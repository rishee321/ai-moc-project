from sqlalchemy import Column, Integer, String, Text, ForeignKey

from database.database import Base


class Question(Base):

    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    question_text = Column(
        Text,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    difficulty = Column(
        String(50),
        nullable=False
    )