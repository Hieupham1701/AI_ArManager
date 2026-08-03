// Thin client for the FastAPI auth service (backend/api/auth.py).
// See that file for the full request/response shapes.

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: AuthUser;
}

export interface SignupResponse {
  message: string;
  user: AuthUser;
}

export interface ProfileResponse {
  user: AuthUser;
  profile: Record<string, unknown> | null;
}

export interface MessageResponse {
  message?: string;
  success?: boolean;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail ?? data?.message;
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(", ")
      : detail;
    throw new Error(message || "Something went wrong. Please try again.");
  }

  return data as T;
}

function withAuth(accessToken: string, headers: HeadersInit = {}): HeadersInit {
  return { ...headers, Authorization: `Bearer ${accessToken}` };
}

export function signup(payload: {
  email: string;
  password: string;
  business_name?: string;
}) {
  const { email, ...rest } = payload;
  return apiRequest<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ business_email: email, ...rest }),
  });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ business_email: payload.email, password: payload.password }),
  });
}

export function refreshToken(refresh_token: string) {
  return apiRequest<Omit<LoginResponse, "message" | "user">>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });
}

export function logout(accessToken: string) {
  return apiRequest<MessageResponse>("/auth/logout", {
    method: "POST",
    headers: withAuth(accessToken),
  });
}

export function getProfile(accessToken: string) {
  return apiRequest<ProfileResponse>("/auth/profile", {
    method: "GET",
    headers: withAuth(accessToken),
  });
}

export function updateProfile(
  accessToken: string,
  payload: { business_name?: string; phone_number?: string }
) {
  return apiRequest<MessageResponse>("/auth/profile", {
    method: "PUT",
    headers: withAuth(accessToken),
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ business_email: email }),
  });
}

export function resetPassword(payload: { access_token: string; new_password: string }) {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  accessToken: string,
  payload: { current_password: string; new_password: string }
) {
  return apiRequest<MessageResponse>("/auth/change-password", {
    method: "POST",
    headers: withAuth(accessToken),
    body: JSON.stringify(payload),
  });
}
