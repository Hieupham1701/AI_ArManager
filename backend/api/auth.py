"""
Auth router for authentication endpoints.

Endpoints:
  POST /auth/signup
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout
  GET /auth/profile
  PUT /auth/profile
  POST /auth/forgot-password
  POST /auth/reset-password
  POST /auth/change-password
"""
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from supabase import Client, create_client

from config import SUPABASE_URL, SUPABASE_KEY, SERVICE_ROLE_KEY, FRONTEND_URL

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY) if SERVICE_ROLE_KEY else None
router = APIRouter(tags=["Auth"])
bearer_scheme = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SignupRequest(BaseModel):
    business_email: EmailStr
    password: str = Field(min_length=8)
    business_name: Optional[str] = None


class LoginRequest(BaseModel):
    business_email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    business_email: EmailStr


class ResetPasswordRequest(BaseModel):
    access_token: str
    new_password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class UpdateProfileRequest(BaseModel):
    business_name: Optional[str] = None
    phone_number: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _update_password_with_token(access_token: str, new_password: str) -> None:
    """Update a user's password using their own access token.

    Uses the Supabase Auth REST endpoint directly so it works with just the
    access token (no refresh token or service-role key required), and is
    naturally scoped to that one user.
    """
    response = httpx.put(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json={"password": new_password},
        timeout=10,
    )
    if response.status_code >= 400:
        detail = response.json().get("msg", "Failed to update password")
        raise HTTPException(status_code=response.status_code, detail=detail)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)):
    """Dependency that validates the `Authorization: Bearer <token>` header."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Token is invalid or has expired")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Token is invalid or has expired")

    return {"user": user_response.user, "token": token}


# ---------------------------------------------------------------------------
# Signup -> Supabase Auth creates user -> profile row (optional) -> verify email
# ---------------------------------------------------------------------------
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup_user(payload: SignupRequest):
    """Register a new user."""
    try:
        response = supabase.auth.sign_up({
            "email": payload.business_email,
            "password": payload.password,
            "options": {
                "data": {
                    "business_name": payload.business_name,
                },
                "email_redirect_to": f"{FRONTEND_URL}/login",
            },
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    # Best-effort: create a matching row in `users`. Non-fatal if it fails
    # (e.g. table doesn't exist yet, or RLS blocks it until email is verified).
    # Use service role client to bypass RLS if available.
    try:
        db_client = supabase_admin if supabase_admin else supabase
        db_client.table("users").upsert({
            "id": response.user.id,
            "email": payload.business_email,
            "business_name": payload.business_name,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = str(e))

    return {
        "message": "Signup successful. Please check your email to verify your account.",
        "user": response.user,
    }


# ---------------------------------------------------------------------------
# Login -> access token + refresh token
# ---------------------------------------------------------------------------
@router.post("/login")
def login_user(payload: LoginRequest):
    """Login user and return access token."""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": payload.business_email,
            "password": payload.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    if not response.session:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "expires_in": response.session.expires_in,
        "user": response.user,
    }


# ---------------------------------------------------------------------------
# Refresh token -> new access token
# ---------------------------------------------------------------------------
@router.post("/refresh")
def refresh_token(payload: RefreshRequest):
    """Refresh access token using refresh token."""
    try:
        response = supabase.auth.refresh_session(payload.refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    if not response.session:
        raise HTTPException(status_code=401, detail="Unable to refresh session")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "expires_in": response.session.expires_in,
    }


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------
@router.post("/logout")
def logout_user(current: dict = Depends(get_current_user)):
    """Logout user and revoke token."""
    response = httpx.post(
        f"{SUPABASE_URL}/auth/v1/logout",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {current['token']}",
        },
        timeout=10,
    )
    if response.status_code >= 400 and response.status_code != 401:
        raise HTTPException(status_code=response.status_code, detail="Failed to log out")

    return {"message": "Logged out successfully"}


# ---------------------------------------------------------------------------
# Protected: profile
# ---------------------------------------------------------------------------
@router.get("/profile")
def get_profile(current: dict = Depends(get_current_user)):
    """Get user profile."""
    user = current["user"]

    profile_row = None
    try:
        result = supabase.table("users").select("*").eq("id", user.id).single().execute()
        profile_row = result.data
    except Exception:
        profile_row = None

    return {"user": user, "profile": profile_row}


@router.put("/profile")
def update_profile(payload: UpdateProfileRequest, current: dict = Depends(get_current_user)):
    """Update user profile."""
    user = current["user"]
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    try:
        supabase.table("users").update(updates).eq("id", user.id).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "message": "Profile updated", "profile": updates}


# ---------------------------------------------------------------------------
# Forgot password -> email with reset link
# ---------------------------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    """Send password reset email."""
    try:
        supabase.auth.reset_password_email(
            payload.business_email,
            {"redirect_to": f"{FRONTEND_URL}/login/resetpassword"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "success": True,
        "message": "If an account exists for this business email, a password reset link has been sent.",
    }


# ---------------------------------------------------------------------------
# Reset password (from the emailed recovery link's access token)
# ---------------------------------------------------------------------------
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    """Reset password with recovery token."""
    try:
        user_response = supabase.auth.get_user(payload.access_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Recovery link is invalid or has expired")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Recovery link is invalid or has expired")

    _update_password_with_token(payload.access_token, payload.new_password)

    return {"success": True, "message": "Password has been reset. Please log in."}


# ---------------------------------------------------------------------------
# Change password (authenticated user, must confirm current password)
# ---------------------------------------------------------------------------
@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, current: dict = Depends(get_current_user)):
    """Change password for authenticated user."""
    business_email = current["user"].email
    try:
        supabase.auth.sign_in_with_password({"email": business_email, "password": payload.current_password})
    except Exception:
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    _update_password_with_token(current["token"], payload.new_password)

    return {"success": True, "message": "Password changed successfully."}
