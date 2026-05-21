from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Админ құқығы жоқ."
        )
    return current_user


@router.get("/users")
async def get_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "onboarding_complete": u.onboarding_complete,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    # Жалпы санақ
    total_users = await db.scalar(select(func.count(User.id)))
    total_analyses = await db.scalar(select(func.count(Analysis.id)))

    # Тері типтері бойынша
    skin_stats_result = await db.execute(
        select(Analysis.skin_type, func.count(Analysis.id))
        .group_by(Analysis.skin_type)
    )
    skin_stats = {row[0]: row[1] for row in skin_stats_result.fetchall()}

    # Соңғы 7 күндегі тіркелу
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    daily_result = await db.execute(
        select(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        )
        .where(User.created_at >= seven_days_ago)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
    )
    daily_registrations = [
        {"date": str(row.date), "count": row.count}
        for row in daily_result.fetchall()
    ]

    # Соңғы 7 күндегі талдаулар
    daily_analyses_result = await db.execute(
        select(
            func.date(Analysis.created_at).label("date"),
            func.count(Analysis.id).label("count")
        )
        .where(Analysis.created_at >= seven_days_ago)
        .group_by(func.date(Analysis.created_at))
        .order_by(func.date(Analysis.created_at))
    )
    daily_analyses = [
        {"date": str(row.date), "count": row.count}
        for row in daily_analyses_result.fetchall()
    ]

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "skin_stats": skin_stats,
        "daily_registrations": daily_registrations,
        "daily_analyses": daily_analyses,
    }


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    import uuid
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пайдаланушы табылмады.")
    user.is_active = not user.is_active
    await db.commit()
    return {"id": str(user.id), "is_active": user.is_active}