"""
auth.py — Аутентификация маршруттары
Forgot password: Gmail SMTP арқылы нақты email жіберіледі
"""
import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Reset tokens (production-та Redis қолдану керек)
_reset_tokens: dict[str, dict] = {}


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserPublic(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    is_active: bool
    is_admin: bool
    onboarding_complete: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ── POST /api/auth/register ───────────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.strip().lower()
    name = payload.name.strip()

    if len(name) < 2:
        raise HTTPException(422, "Аты тым қысқа.")
    if len(payload.password) < 8:
        raise HTTPException(422, "Құпия сөз кемінде 8 таңба болуы керек.")

    try:
        result = await db.execute(select(User).where(User.email == email))
    except Exception as e:
        logger.exception(f"Register DB check error for {email}: {e}")
        raise HTTPException(500, "Деректер қорына қосылу мүмкін болмады.")
    if result.scalar_one_or_none():
        raise HTTPException(409, "Бұл email тіркелген.")

    try:
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(payload.password),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except Exception as e:
        await db.rollback()
        logger.exception(f"Register DB error for {email}: {e}")
        raise HTTPException(500, "Аккаунт жасалмады. Қайталаңыз.")

    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))


# ── POST /api/auth/login ──────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.strip().lower()
    logger.info(f"Login attempt for {email}")

    try:
        result = await db.execute(select(User).where(User.email == email))
    except Exception as e:
        logger.exception(f"Login DB error for {email}: {e}")
        raise HTTPException(500, "Деректер қорына қосылу мүмкін болмады.")
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(401, "Бұл email тіркелмеген.")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Құпия сөз қате.")
    if not user.is_active:
        raise HTTPException(403, "Аккаунт блокталған.")

    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))


# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)


# ── PATCH /api/auth/profile ───────────────────────────────────────────────────
@router.patch("/profile", response_model=UserPublic)
async def update_profile(
    payload: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        name = payload.name.strip()
        if len(name) < 2:
            raise HTTPException(422, "Аты тым қысқа.")
        current_user.name = name

    if payload.email is not None:
        new_email = str(payload.email).strip().lower()
        if new_email != current_user.email:
            result = await db.execute(select(User).where(User.email == new_email))
            if result.scalar_one_or_none():
                raise HTTPException(409, "Бұл email басқа аккаунтта тіркелген.")
            current_user.email = new_email

    await db.commit()
    await db.refresh(current_user)
    return UserPublic.model_validate(current_user)


# ── POST /api/auth/change-password ───────────────────────────────────────────
@router.post("/change-password", status_code=200)
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(401, "Ескі құпия сөз қате.")
    if len(payload.new_password) < 8:
        raise HTTPException(422, "Жаңа құпия сөз кемінде 8 таңба болуы керек.")
    if payload.old_password == payload.new_password:
        raise HTTPException(422, "Жаңа құпия сөз ескісімен бірдей.")

    current_user.hashed_password = hash_password(payload.new_password)
    await db.commit()
    return {"message": "Құпия сөз сәтті өзгертілді."}


# ── POST /api/auth/forgot-password ───────────────────────────────────────────
@router.post("/forgot-password", status_code=200)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Gmail SMTP арқылы нақты email жіберіледі."""
    import os
    from app.services.email_services import send_reset_email

    email = str(payload.email).strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        token = secrets.token_urlsafe(32)
        _reset_tokens[token] = {
            "user_id": str(user.id),
            "expires": datetime.now(timezone.utc) + timedelta(hours=1),
        }

        # .env-те MAIL_USERNAME бар ма?
        mail_configured = bool(os.getenv("MAIL_USERNAME"))

        if mail_configured:
            # Background-та email жіберу (request блокталмайды)
            background_tasks.add_task(
                send_reset_email,
                to_email=email,
                token=token,
                user_name=user.name,
            )
            return {
                "message": "Код email-ге жіберілді. Поштаңызды тексеріңіз.",
                "email_sent": True,
            }
        else:
            # .env орнатылмаған — demo token қайтарамыз
            print(f"⚠️  MAIL_USERNAME орнатылмаған. Demo token: {token}")
            return {
                "message": "Demo режімі: MAIL_USERNAME орнатылмаған.",
                "email_sent": False,
                "demo_token": token,
            }

    # Security: email жоқ болса да бірдей жауап
    return {
        "message": "Егер аккаунт болса, нұсқаулық жіберіледі.",
        "email_sent": False,
    }


# ── POST /api/auth/reset-password ────────────────────────────────────────────
@router.post("/reset-password", status_code=200)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    token_data = _reset_tokens.get(payload.token)

    if not token_data:
        raise HTTPException(400, "Token жарамсыз немесе мерзімі өткен.")

    if datetime.now(timezone.utc) > token_data["expires"]:
        del _reset_tokens[payload.token]
        raise HTTPException(400, "Token мерзімі өткен. Қайтадан сұраңыз.")

    if len(payload.new_password) < 8:
        raise HTTPException(422, "Құпия сөз кемінде 8 таңба болуы керек.")

    result = await db.execute(
        select(User).where(User.id == uuid.UUID(token_data["user_id"]))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Пайдаланушы табылмады.")

    user.hashed_password = hash_password(payload.new_password)
    await db.commit()
    del _reset_tokens[payload.token]

    return {"message": "Құпия сөз сәтті өзгертілді. Жаңа парольмен кіріңіз."}


# ── DELETE /api/auth/account ──────────────────────────────────────────────────
@router.delete("/account", status_code=200)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Аккаунт сәтті жойылды."}