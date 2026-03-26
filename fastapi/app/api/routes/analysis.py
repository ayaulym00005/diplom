import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.models.lifestyle import Lifestyle
from app.schemas.analysis import AnalysisOut, AnalysisListItem
from app.core.security import get_current_user
from app.core.config import settings
from app.services import ml_service

router = APIRouter(prefix="/analysis", tags=["analysis"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


# ── POST /api/analysis/predict ────────────────────────────────────────────────

@router.post("/predict", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
async def predict(
    image: UploadFile = File(..., description="Face photo (JPEG / PNG / WEBP, max 10 MB)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Validate file type ────────────────────────────
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{image.content_type}'. Upload a JPEG, PNG, or WEBP image."
        )

    # ── Validate file size ────────────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    # ── Run ML inference ──────────────────────────────
    try:
        skin_type, confidence, probs = ml_service.predict(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    # ── Snapshot current lifestyle ────────────────────
    lifestyle_snapshot = None
    lf_result = await db.execute(select(Lifestyle).where(Lifestyle.user_id == current_user.id))
    lifestyle = lf_result.scalar_one_or_none()
    if lifestyle:
        lifestyle_snapshot = {
            "water_intake": lifestyle.water_intake,
            "sleep_hours": lifestyle.sleep_hours,
            "diet": lifestyle.diet,
            "stress_level": lifestyle.stress_level,
            "sun_exposure": lifestyle.sun_exposure,
            "spf_use": lifestyle.spf_use,
            "exercise": lifestyle.exercise,
            "current_routine": lifestyle.current_routine,
            "concerns": lifestyle.concerns,
        }

    # ── Persist result ────────────────────────────────
    analysis = Analysis(
        user_id=current_user.id,
        skin_type=skin_type,
        confidence=confidence,
        probabilities=probs,
        lifestyle_snapshot=lifestyle_snapshot,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    return analysis


# ── GET /api/analysis/history ─────────────────────────────────────────────────

@router.get("/history", response_model=List[AnalysisListItem])
async def history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
    )
    return result.scalars().all()


# ── GET /api/analysis/{analysis_id} ──────────────────────────────────────────

@router.get("/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,  # enforce ownership
        )
    )
    analysis: Analysis | None = result.scalar_one_or_none()

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found."
        )
    return analysis
