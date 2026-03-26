import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class LifestyleIn(BaseModel):
    """Matches the answers object sent from the onboarding form."""
    water_intake: Optional[str] = None
    sleep_hours: Optional[str] = None
    diet: Optional[str] = None
    stress_level: Optional[str] = None
    sun_exposure: Optional[str] = None
    spf_use: Optional[str] = None
    exercise: Optional[str] = None
    current_routine: Optional[str] = None
    concerns: Optional[List[str]] = None


class LifestyleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    water_intake: Optional[str]
    sleep_hours: Optional[str]
    diet: Optional[str]
    stress_level: Optional[str]
    sun_exposure: Optional[str]
    spf_use: Optional[str]
    exercise: Optional[str]
    current_routine: Optional[str]
    concerns: Optional[List[str]]
    updated_at: datetime


class ProfileStatusOut(BaseModel):
    onboardingComplete: bool
