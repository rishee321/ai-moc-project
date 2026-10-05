from sqlalchemy import Column, Integer, Float, Text, ForeignKey
from database.database import Base


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    overall_score = Column(Float, nullable=True)

    technical_score = Column(Float, nullable=True)

    communication_score = Column(Float, nullable=True)

    problem_solving_score = Column(Float, nullable=True)

    strengths = Column(Text, nullable=True)

    weaknesses = Column(Text, nullable=True)

    suggestions = Column(Text, nullable=True)