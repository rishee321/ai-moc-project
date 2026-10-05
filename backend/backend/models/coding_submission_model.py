from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from database.database import Base


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    challenge_id = Column(
        Integer,
        ForeignKey("coding_challenges.id"),
        nullable=False
    )

    language = Column(
        String(50),
        nullable=False
    )

    code = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=True
    )

    score = Column(
        Float,
        nullable=True
    )

    passed_test_cases = Column(
        Integer,
        default=0
    )

    total_test_cases = Column(
        Integer,
        default=0
    )

    execution_time = Column(
        Float,
        nullable=True
    )

    error_message = Column(
        Text,
        nullable=True
    )

    ai_feedback = Column(
        Text,
        nullable=True
    )