from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    extracted_text: Optional[str] = None
    skills: Optional[str] = None
    uploaded_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)