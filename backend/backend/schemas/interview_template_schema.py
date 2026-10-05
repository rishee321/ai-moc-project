from pydantic import BaseModel
from typing import Optional


class InterviewTemplateResponse(BaseModel):
    template_id: str
    name: str
    description: str
    interview_type: str
    recommended_questions: int
    supported_difficulty: list[str]
    features: list[str]