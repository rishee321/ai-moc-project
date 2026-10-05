from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database.database import Base
from datetime import datetime


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(String(255), nullable=False)

    extracted_text = Column(Text, nullable=True)

    skills = Column(Text, nullable=True)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )