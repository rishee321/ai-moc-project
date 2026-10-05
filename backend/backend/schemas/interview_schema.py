from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class InterviewCreate(BaseModel):
    interview_type: str
    domain: str
    difficulty: str
    total_questions: int = 10


class InterviewResponse(BaseModel):
    id: int
    user_id: int
    interview_type: str
    domain: str
    difficulty: str
    total_questions: int

    # NEW
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewHistoryResponse(BaseModel):
    id: int
    interview_type: str
    domain: str
    difficulty: str
    total_questions: int

    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None

    # NEW
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)