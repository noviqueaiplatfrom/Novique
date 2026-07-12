"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/lib/auth";

interface AuthState {
  token: string | null;
  user: authApi.User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<authApi.LoginResponse>;
  register: (email: string, password: string) => Promise<authApi.LoginResponse>;
  verify2fa: (email: string, code: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "ap_token";
const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<authApi.User | null>(null);
  const [ready, setReady] = useState(false);

  // Rehydrate from localStorage on first load.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    authApi
      .getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback(async (tp: authApi.TokenPair) => {
    localStorage.setItem(TOKEN_KEY, tp.access_token);
    setToken(tp.access_token);
    setUser(await authApi.getMe(tp.access_token));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      if (res.status !== "mfa_required") {
        await finish(res as authApi.TokenPair);
      }
      return res;
    },
    [finish],
  );
  const register = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.register(email, password);
      if (res.status !== "mfa_required") {
        await finish(res as authApi.TokenPair);
      }
      return res;
    },
    [finish],
  );
  const verify2fa = useCallback(
    async (email: string, code: string) => {
      const res = await authApi.verify2fa(email, code);
      await finish(res);
    },
    [finish],
  );
  const loginWithGoogle = useCallback(
    async (idToken: string) => finish(await authApi.loginWithGoogle(idToken)),
    [finish],
  );
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ token, user, ready, login, register, verify2fa, loginWithGoogle, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
