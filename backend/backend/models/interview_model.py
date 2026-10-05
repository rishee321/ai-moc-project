from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from database.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    interview_type = Column(
        String(100),
        nullable=False
    )

    domain = Column(
        String(100),
        nullable=False
    )

    difficulty = Column(
        String(50),
        nullable=False
    )

    total_questions = Column(
        Integer,
        default=10
    )

    # NEW FIELDS

    status = Column(
        String(30),
        default="created"
    )

    started_at = Column(
        DateTime,
        nullable=True
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )