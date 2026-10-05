from pydantic import BaseModel, ConfigDict
from typing import Optional


class CodingChallengeCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: Optional[str] = None
    language: Optional[str] = "Python"
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    test_cases: Optional[str] = None


class CodingChallengeResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: Optional[str] = None
    language: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    test_cases: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CodingSubmissionCreate(BaseModel):
    challenge_id: int
    language: str = "Python"
    code: str


class CodingSubmissionResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    language: str
    code: str
    status: Optional[str] = None
    score: Optional[float] = None
    passed_test_cases: int
    total_test_cases: int
    execution_time: Optional[float] = None
    error_message: Optional[str] = None
    ai_feedback: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)