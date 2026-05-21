"""
Тері күнделігі
POST /api/diary/        — жазба қосу
GET  /api/diary/        — барлық жазбалар
DELETE /api/diary/{id}  — жазба жою
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel

from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mood: Mapped[str] = mapped_column(String(20), nullable=False)          # great/good/ok/bad
    water: Mapped[str] = mapped_column(String(20), nullable=True)          # less_1l / 1_2l / more_2l
    sleep: Mapped[str] = mapped_column(String(20), nullable=True)          # less_6 / 6_8 / more_8
    skin_feel: Mapped[str] = mapped_column(String(20), nullable=True)      # oily/dry/normal/sensitive
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DiaryCreate(BaseModel):
    mood: str
    water: Optional[str] = None
    sleep: Optional[str] = None
    skin_feel: Optional[str] = None
    note: Optional[str] = None


router = APIRouter(prefix="/diary", tags=["diary"])


@router.post("/", status_code=201)
async def create_entry(
    payload: DiaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = DiaryEntry(
        user_id=current_user.id,
        mood=payload.mood,
        water=payload.water,
        sleep=payload.sleep,
        skin_feel=payload.skin_feel,
        note=payload.note,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {
        "id": str(entry.id),
        "mood": entry.mood,
        "water": entry.water,
        "sleep": entry.sleep,
        "skin_feel": entry.skin_feel,
        "note": entry.note,
        "created_at": entry.created_at.isoformat(),
    }


@router.get("/")
async def get_entries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DiaryEntry)
        .where(DiaryEntry.user_id == current_user.id)
        .order_by(desc(DiaryEntry.created_at))
        .limit(30)
    )
    entries = result.scalars().all()
    return [
        {
            "id": str(e.id),
            "mood": e.mood,
            "water": e.water,
            "sleep": e.sleep,
            "skin_feel": e.skin_feel,
            "note": e.note,
            "created_at": e.created_at.isoformat(),
        }
        for e in entries
    ]


@router.delete("/{entry_id}", status_code=200)
async def delete_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DiaryEntry).where(
            DiaryEntry.id == uuid.UUID(entry_id),
            DiaryEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Жазба табылмады.")
    await db.delete(entry)
    await db.commit()
    return {"message": "Жойылды."}