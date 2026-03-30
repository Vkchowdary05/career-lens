"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  auth,
  onAuthStateChanged,
  signOut,
  User,
} from "@/lib/firebase";
import { setApiToken } from "@/lib/api";

const API_BASE = "";

interface CareerLensUser {
  id: string;
  firebase_uid: string;
  username: string;
  full_name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  college?: string;
  current_company?: string;
  current_role?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  points: number;
  followers_count: number;
  following_count: number;
  open_to_opportunities: boolean;
}

interface AuthContextValue {
  firebaseUser: User | null;
  clUser: CareerLensUser | null;
  loading: boolean;
  token: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  clUser: null,
  loading: true,
  token: null,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [clUser, setClUser] = useState<CareerLensUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Fetch or create the CareerLens user profile.
   * IMPORTANT: setApiToken is called BEFORE any other API call so that
   * the module-level token in api.ts is always populated by the time
   * child components mount (loading becomes false only after this returns).
   */
  const fetchOrRegister = useCallback(async (fbUser: User) => {
    try {
      // 1. Get a fresh Firebase ID token
      const tok = await fbUser.getIdToken(true);

      // 2. Immediately expose the token to the api.ts module so that
      //    every protected request made after setLoading(false) has a token.
      setToken(tok);
      setApiToken(tok);

      // 3. Register / fetch the CareerLens profile
      const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({
          firebase_uid: fbUser.uid,
          email: fbUser.email,
          full_name:
            fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          photo_url: fbUser.photoURL,
          auth_provider:
            fbUser.providerData[0]?.providerId === "google.com"
              ? "google"
              : "email",
        }),
      });

      if (registerRes.ok) {
        const data = await registerRes.json();
        setClUser(data);
      }
    } catch (err) {
      console.error("[AuthContext] fetchOrRegister error", err);
      // Even on error, keep the token set — requests can still succeed
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const tok = await firebaseUser.getIdToken(false);
      setToken(tok);
      setApiToken(tok);
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClUser(data);
      }
    } catch (err) {
      console.error("[AuthContext] refreshUser error", err);
    }
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setClUser(null);
    setToken(null);
    setApiToken(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // fetchOrRegister sets setApiToken BEFORE returning —
        // so by the time setLoading(false) runs the token is ready.
        await fetchOrRegister(fbUser);
      } else {
        setClUser(null);
        setToken(null);
        setApiToken(null);
      }

      // Only hide the loading screen AFTER the token & profile are ready.
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchOrRegister]);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, clUser, loading, token, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
