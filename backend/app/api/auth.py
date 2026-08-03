"""Authentication routes: register, login, refresh."""
from __future__ import annotations
import hmac
import secrets
import redis

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import AccessToken, RefreshIn, TokenPair, UserCreate, LoginResponse, Verify2FaRequest
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.email import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

# Brute-force protection: cap attempts per email within a rolling window
# before making the caller wait out the window. Applies to both password
# login and OTP verification (a 6-digit code is guessable in seconds
# without this).
_MAX_ATTEMPTS = 5
_WINDOW_SECONDS = 300


def _enforce_rate_limit(key: str) -> None:
    attempts = redis_client.incr(key)
    if attempts == 1:
        redis_client.expire(key, _WINDOW_SECONDS)
    if attempts > _MAX_ATTEMPTS:
        ttl = redis_client.ttl(key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. Try again in {max(ttl, 1)}s.",
        )


def _tokens(user_id: int) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


def _trigger_mfa(email: str) -> LoginResponse:
    """Generate OTP, save to Redis, and send via Brevo SMTP."""
    otp = f"{secrets.randbelow(900000) + 100000:06d}"
    redis_client.setex(f"mfa:login:{email}", 300, otp)  # 5 minutes TTL
    redis_client.delete(f"ratelimit:mfa:{email}")  # fresh OTP, fresh attempt budget
    send_otp_email(email, otp)
    return LoginResponse(status="mfa_required", email=email)


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="Invalid email")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return _trigger_mfa(user.email)


@router.post("/login", response_model=LoginResponse)
def login(body: UserCreate, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    _enforce_rate_limit(f"ratelimit:login:{email}")
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _trigger_mfa(user.email)


@router.post("/verify-2fa", response_model=TokenPair)
def verify_2fa(body: Verify2FaRequest, db: Session = Depends(get_db)):
    """Verify OTP verification code and issue JWT tokens."""
    email = body.email.strip().lower()
    code = body.code.strip()
    _enforce_rate_limit(f"ratelimit:mfa:{email}")
    stored_code = redis_client.get(f"mfa:login:{email}")
    if not stored_code or not hmac.compare_digest(stored_code, code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code"
        )
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    redis_client.delete(f"mfa:login:{email}")
    redis_client.delete(f"ratelimit:mfa:{email}")
    return _tokens(user.id)


@router.post("/refresh", response_model=AccessToken)
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    user_id = decode_token(body.refresh_token, "refresh")
    if db.get(User, user_id) is None:
        raise HTTPException(status_code=401, detail="User not found")
    return AccessToken(access_token=create_access_token(user_id))


from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    id_token: str


@router.post("/google", response_model=TokenPair)
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user using their Google ID token."""
    import httpx
    try:
        response = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": body.id_token},
            timeout=5.0
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Google verification service: {str(e)}"
        )
        
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google ID token"
        )

    google_data = response.json()

    # tokeninfo only proves the token is a *valid Google-signed token*, not that
    # it was issued for this app — without checking `aud`, a token minted for
    # any other site's "Sign in with Google" button would be accepted here too.
    if not settings.google_client_id or google_data.get("aud") != settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google ID token was not issued for this application"
        )

    email = google_data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token does not contain email"
        )
        
    google_sub = google_data.get("sub")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    email = email.strip().lower()
    
    # 1. Lookup by google_sub
    user = db.scalar(select(User).where(User.google_sub == google_sub))
    
    # 2. Lookup by email if not found
    if not user:
        user = db.scalar(select(User).where(User.email == email))
        if user:
            user.google_sub = google_sub
            if not user.name and name:
                user.name = name
            if not user.picture and picture:
                user.picture = picture
            db.commit()
            db.refresh(user)
            
    # 3. Create new user
    if not user:
        user = User(
            email=email,
            google_sub=google_sub,
            name=name,
            picture=picture,
            hashed_password=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return _tokens(user.id)
