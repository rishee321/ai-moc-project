from pydantic import BaseModel
from typing import Optional


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_interviews: int
    completed_interviews: int
    in_progress_interviews: int
    created_interviews: int
    average_score: Optional[float] = None


class InterviewTypeStatistic(BaseModel):
    interview_type: str
    total_interviews: int


class AdminUserPerformance(BaseModel):
    user_id: int
    name: str
    email: str
    total_interviews: int
    completed_interviews: int
    average_score: Optional[float] = None