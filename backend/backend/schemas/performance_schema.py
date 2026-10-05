from pydantic import BaseModel
from typing import Optional


class PerformanceTrendItem(BaseModel):
    interview_id: int

    overall_score: Optional[float] = None

    technical_score: Optional[float] = None

    communication_score: Optional[float] = None

    problem_solving_score: Optional[float] = None


class PerformanceTrendResponse(BaseModel):
    total_interviews: int

    performance: list[PerformanceTrendItem]