from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float
from datetime import datetime

from database.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("questions.id"),
        nullable=False
    )

    answer_text = Column(Text, nullable=False)

    score = Column(Float, nullable=True)

    feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)