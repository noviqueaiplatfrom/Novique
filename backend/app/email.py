import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

def send_otp_email(to_email: str, otp: str) -> None:
    """Send a 2FA OTP verification code email using Brevo SMTP."""
    if not settings.smtp_user or not settings.smtp_password:
        print(f"[email] SMTP is not configured. OTP for {to_email} is: {otp}")
        return
        
    msg = MIMEMultipart()
    msg['From'] = settings.smtp_from
    msg['To'] = to_email
    msg['Subject'] = f"{otp} is your Novique verification code"
    
    body = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #07111F; color: #F7F9FC; padding: 40px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #101B2D; border: 1px solid rgba(255, 255, 255, 0.08); padding: 40px; border-radius: 24px; color: #F7F9FC;">
          <h2 style="color: #6C63FF; font-size: 24px; margin-bottom: 24px;">Novique 2FA Verification</h2>
          <p style="font-size: 14px; color: #9AA8BD; margin-bottom: 32px;">Please enter the following 6-digit code to complete your verification:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background-color: rgba(108, 99, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.3); padding: 15px 30px; border-radius: 12px; display: inline-block; margin-bottom: 32px;">
            {otp}
          </div>
          <p style="font-size: 11px; color: #9AA8BD;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(body, 'html'))
    
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to_email, msg.as_string())
        print(f"[email] Successfully sent OTP to {to_email}")
    except Exception as e:
        print(f"[email] Failed to send OTP email: {e}")
        # In development, let's print the OTP to the console so they can still log in if SMTP fails
        print(f"[email] FALLBACK - OTP for {to_email} is: {otp}")
