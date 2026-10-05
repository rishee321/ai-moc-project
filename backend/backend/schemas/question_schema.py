from pydantic import BaseModel, ConfigDict
from typing import Optional


class QuestionCreate(BaseModel):
    interview_id: int
    question_text: str
    category: Optional[str] = None
    difficulty: Optional[str] = None


class QuestionResponse(BaseModel):
    id: int
    interview_id: int
    question_text: str
    category: Optional[str] = None
    difficulty: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)