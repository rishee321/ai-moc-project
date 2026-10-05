from pydantic import BaseModel
from typing import Optional


class TopicPerformanceItem(BaseModel):
    topic: str

    average_score: Optional[float] = None

    questions_attempted: int = 0

    performance_level: str


class TopicPerformanceResponse(BaseModel):
    total_topics: int

    topics: list[TopicPerformanceItem]