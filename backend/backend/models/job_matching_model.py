from sqlalchemy import Column, Integer, Float, Text, String, ForeignKey
from database.database import Base


class JobMatching(Base):
    __tablename__ = "job_matchings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False
    )

    job_title = Column(
        String(150),
        nullable=True
    )

    match_percentage = Column(
        Float,
        nullable=True
    )

    matching_skills = Column(
        Text,
        nullable=True
    )

    missing_skills = Column(
        Text,
        nullable=True
    )

    skill_gaps = Column(
        Text,
        nullable=True
    )

    recommendations = Column(
        Text,
        nullable=True
    )