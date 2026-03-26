import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Request schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ── Response schemas ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    onboarding_complete: bool
    created_at: datetime

    # alias for frontend compatibility: onboardingComplete
    @property
    def onboardingComplete(self) -> bool:
        return self.onboarding_complete


class UserPublic(BaseModel):
    """Slim user shape returned inside auth responses (matches frontend expectations)."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    onboardingComplete: bool = Field(alias="onboarding_complete")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AuthResponse(BaseModel):
    token: str
    user: UserPublic
