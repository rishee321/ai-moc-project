from pydantic import BaseModel
from typing import Optional


class DashboardResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_score: Optional[float] = None
    highest_score: Optional[float] = None
    technical_average: Optional[float] = None
    communication_average: Optional[float] = None
    problem_solving_average: Optional[float] = None