// Client-side session storage for the Supabase-backed auth API.
// Tokens live in localStorage; a lightweight non-sensitive marker cookie
// ("ar_session") lets the server-rendered dashboard layout gate access
// without needing to verify the JWT itself.

import type { AuthUser } from "./api";

const STORAGE_KEY = "ar_auth";
const SESSION_COOKIE = "ar_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface StoredSession {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}`;
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
