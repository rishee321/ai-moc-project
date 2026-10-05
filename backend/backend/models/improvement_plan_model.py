from sqlalchemy import Column, Integer, Text, ForeignKey
from database.database import Base


class ImprovementPlan(Base):
    __tablename__ = "improvement_plans"

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

    duration_days = Column(
        Integer,
        nullable=False,
        default=7
    )

    plan = Column(
        Text,
        nullable=True
    )

    focus_areas = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        Text,
        nullable=True
    )