"""
Прогресс статистикасы
GET /api/progress/stats    — анализдер динамикасы
GET /api/progress/chart    — график деректері
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.core.security import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Барлық анализдер
    result = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.asc())
    )
    analyses = result.scalars().all()

    if not analyses:
        return {"total": 0, "trend": [], "skin_distribution": {}, "avg_confidence": 0, "streak": 0}

    # Тері типтері бойынша бөліну
    skin_dist = {}
    for a in analyses:
        skin_dist[a.skin_type] = skin_dist.get(a.skin_type, 0) + 1

    # Орташа сенімділік
    avg_conf = round(sum(a.confidence for a in analyses) / len(analyses))

    # Соңғы 30 күн тренді
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    trend_result = await db.execute(
        select(
            func.date(Analysis.created_at).label("date"),
            Analysis.skin_type,
            func.avg(Analysis.confidence).label("avg_conf"),
            func.count(Analysis.id).label("count"),
        )
        .where(
            Analysis.user_id == current_user.id,
            Analysis.created_at >= thirty_days_ago,
        )
        .group_by(func.date(Analysis.created_at), Analysis.skin_type)
        .order_by(func.date(Analysis.created_at))
    )
    trend = [
        {
            "date": str(row.date),
            "skin_type": row.skin_type,
            "avg_confidence": round(float(row.avg_conf)),
            "count": row.count,
        }
        for row in trend_result.fetchall()
    ]

    # Streak (қатарынан күндер саны)
    streak = 0
    today = datetime.now(timezone.utc).date()
    dates = sorted(set(a.created_at.date() for a in analyses), reverse=True)
    for i, d in enumerate(dates):
        expected = today - timedelta(days=i)
        if d == expected:
            streak += 1
        else:
            break

    # Жақсару тренді (confidence өсіп жатыр ма?)
    improvement = None
    if len(analyses) >= 2:
        first_5 = analyses[:5]
        last_5 = analyses[-5:]
        avg_first = sum(a.confidence for a in first_5) / len(first_5)
        avg_last = sum(a.confidence for a in last_5) / len(last_5)
        improvement = round(avg_last - avg_first, 1)

    return {
        "total": len(analyses),
        "avg_confidence": avg_conf,
        "skin_distribution": skin_dist,
        "trend": trend,
        "streak": streak,
        "improvement": improvement,
        "first_analysis": analyses[0].created_at.isoformat() if analyses else None,
        "latest_analysis": analyses[-1].created_at.isoformat() if analyses else None,
    }


@router.get("/chart")
async def get_chart_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 30,
):
    """График үшін деректер — соңғы N күн"""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(Analysis)
        .where(
            Analysis.user_id == current_user.id,
            Analysis.created_at >= since,
        )
        .order_by(Analysis.created_at.asc())
    )
    analyses = result.scalars().all()

    return [
        {
            "date": a.created_at.strftime("%d.%m"),
            "skin_type": a.skin_type,
            "confidence": a.confidence,
        }
        for a in analyses
    ]