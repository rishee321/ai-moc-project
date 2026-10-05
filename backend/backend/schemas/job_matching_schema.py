from pydantic import BaseModel, ConfigDict
from typing import Optional


class JobMatchingResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int

    job_title: Optional[str] = None
    match_percentage: Optional[float] = None

    matching_skills: Optional[str] = None
    missing_skills: Optional[str] = None
    skill_gaps: Optional[str] = None
    recommendations: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)