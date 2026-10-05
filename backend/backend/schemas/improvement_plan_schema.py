from pydantic import BaseModel, ConfigDict
from typing import Optional


class ImprovementPlanResponse(BaseModel):
    id: int
    user_id: int
    interview_id: int
    duration_days: int
    plan: Optional[str] = None
    focus_areas: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)