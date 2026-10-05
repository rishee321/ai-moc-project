from sqlalchemy import Column, Integer, Text, ForeignKey
from database.database import Base


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    strong_skills = Column(Text, nullable=True)

    moderate_skills = Column(Text, nullable=True)

    weak_skills = Column(Text, nullable=True)

    missing_skills = Column(Text, nullable=True)

    recommendations = Column(Text, nullable=True)