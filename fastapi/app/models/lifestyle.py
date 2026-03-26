import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Lifestyle(Base):
    __tablename__ = "lifestyles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # ── Hydration / Sleep ────────────────────────────
    water_intake: Mapped[str | None] = mapped_column(String(20))    # less_1l | 1_2l | 2_3l | more_3l
    sleep_hours: Mapped[str | None] = mapped_column(String(20))     # less_5 | 5_7 | 7_9 | more_9

    # ── Diet / Activity ──────────────────────────────
    diet: Mapped[str | None] = mapped_column(String(30))            # processed | mixed | balanced | plant_based
    stress_level: Mapped[str | None] = mapped_column(String(5))     # "1".."5"
    exercise: Mapped[str | None] = mapped_column(String(20))        # rarely | 1_2pw | 3_5pw | daily

    # ── Sun & Environment ────────────────────────────
    sun_exposure: Mapped[str | None] = mapped_column(String(20))    # minimal | 30_60min | 1_3h | more_3h
    spf_use: Mapped[str | None] = mapped_column(String(20))         # never | sometimes | often | always

    # ── Skincare ─────────────────────────────────────
    current_routine: Mapped[str | None] = mapped_column(String(20)) # none | basic | moderate | advanced

    # Multi-select stored as JSON array: ["acne","aging",...]
    concerns: Mapped[list | None] = mapped_column(JSONB, default=list)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="lifestyle")

    def __repr__(self) -> str:
        return f"<Lifestyle user_id={self.user_id}>"
