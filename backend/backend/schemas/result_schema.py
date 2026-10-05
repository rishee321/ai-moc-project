from pydantic import BaseModel, ConfigDict
from typing import Optional


class ResultCreate(BaseModel):
    interview_id: int
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    suggestions: Optional[str] = None


class ResultResponse(BaseModel):
    id: int
    interview_id: int
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    suggestions: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)