from pydantic import BaseModel, ConfigDict
from typing import Optional


class SkillGapResponse(BaseModel):
    id: int
    user_id: int
    interview_id: int

    strong_skills: Optional[str] = None
    moderate_skills: Optional[str] = None
    weak_skills: Optional[str] = None
    missing_skills: Optional[str] = None
    recommendations: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)