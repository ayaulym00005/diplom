import uuid
from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, ConfigDict


class AnalysisOut(BaseModel):
    """Matches what the frontend expects from /analysis/predict and /analysis/:id"""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    skin_type: str
    confidence: int
    probabilities: Dict[str, float]
    created_at: datetime


class AnalysisListItem(BaseModel):
    """Slimmer shape for the history list."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    skin_type: str
    confidence: int
    created_at: datetime
