"""
Пікір/Отзыв жүйесі — async үйлесімді нұсқа
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel

from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user


# ── Model ─────────────────────────────────────────────────────────────────────
class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    analysis_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="SET NULL"),
        nullable=True,
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skin_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    user_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)  # кэш
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


# ── Schemas ───────────────────────────────────────────────────────────────────
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    analysis_id: Optional[str] = None
    skin_type: Optional[str] = None


# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", status_code=201)
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=422, detail="Рейтинг 1-5 аралығында болуы керек.")

    analysis_id = None
    if payload.analysis_id:
        try:
            analysis_id = uuid.UUID(payload.analysis_id)
        except ValueError:
            pass

    review = Review(
        user_id=current_user.id,
        analysis_id=analysis_id,
        rating=payload.rating,
        comment=payload.comment,
        skin_type=payload.skin_type,
        user_name=current_user.name,  # JOIN жасамай кэштейміз
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return {
        "id": str(review.id),
        "user_name": review.user_name or current_user.name,
        "rating": review.rating,
        "comment": review.comment,
        "skin_type": review.skin_type,
        "created_at": review.created_at.isoformat(),
    }


@router.get("/")
async def get_reviews(
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0,
):
    # lazy join жоқ — тікелей user_name алдын ала сақталған
    result = await db.execute(
        select(Review)
        .order_by(desc(Review.created_at))
        .limit(limit)
        .offset(offset)
    )
    reviews = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "user_name": r.user_name or "Пайдаланушы",
            "rating": r.rating,
            "comment": r.comment,
            "skin_type": r.skin_type,
            "created_at": r.created_at.isoformat(),
        }
        for r in reviews
    ]


@router.get("/my")
async def get_my_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(desc(Review.created_at))
    )
    reviews = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "rating": r.rating,
            "comment": r.comment,
            "skin_type": r.skin_type,
            "created_at": r.created_at.isoformat(),
        }
        for r in reviews
    ]


@router.delete("/{review_id}", status_code=200)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        rid = uuid.UUID(review_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Жарамсыз ID.")

    result = await db.execute(select(Review).where(Review.id == rid))
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Пікір табылмады.")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Рұқсат жоқ.")

    await db.delete(review)
    await db.commit()
    return {"message": "Пікір жойылды."}