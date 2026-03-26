import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Model output ─────────────────────────────────
    # oily | dry | normal | combination
    skin_type: Mapped[str] = mapped_column(String(20), nullable=False)

    # 0-100 integer confidence (percentage of top class)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)

    # Full class probabilities: {"oily": 0.82, "dry": 0.10, "normal": 0.05, "combination": 0.03}
    probabilities: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Snapshot of lifestyle at time of analysis (for historical context)
    lifestyle_snapshot: Mapped[dict | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    user: Mapped["User"] = relationship("User", back_populates="analyses")

    def __repr__(self) -> str:
        return f"<Analysis {self.skin_type} {self.confidence}% user={self.user_id}>"
