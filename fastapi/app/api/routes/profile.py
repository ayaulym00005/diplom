from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.lifestyle import Lifestyle
from app.schemas.lifestyle import LifestyleIn, LifestyleOut, ProfileStatusOut
from app.core.security import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


# ── POST /api/profile/lifestyle ───────────────────────────────────────────────

@router.post("/lifestyle", response_model=LifestyleOut, status_code=status.HTTP_200_OK)
async def save_lifestyle(
    payload: LifestyleIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or fully replace the user's lifestyle data."""
    result = await db.execute(
        select(Lifestyle).where(Lifestyle.user_id == current_user.id)
    )
    lifestyle: Lifestyle | None = result.scalar_one_or_none()

    update_data = payload.model_dump(exclude_unset=False)

    if lifestyle is None:
        lifestyle = Lifestyle(user_id=current_user.id, **update_data)
        db.add(lifestyle)
    else:
        for field, value in update_data.items():
            setattr(lifestyle, field, value)

    # Mark onboarding as complete
    current_user.onboarding_complete = True

    await db.commit()
    await db.refresh(lifestyle)

    return lifestyle


# ── GET /api/profile/lifestyle ────────────────────────────────────────────────

@router.get("/lifestyle", response_model=LifestyleOut)
async def get_lifestyle(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lifestyle).where(Lifestyle.user_id == current_user.id)
    )
    lifestyle: Lifestyle | None = result.scalar_one_or_none()

    if lifestyle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lifestyle profile not found. Please complete onboarding."
        )
    return lifestyle


# ── GET /api/profile/status ───────────────────────────────────────────────────

@router.get("/status", response_model=ProfileStatusOut)
async def get_status(current_user: User = Depends(get_current_user)):
    return ProfileStatusOut(onboardingComplete=current_user.onboarding_complete)
