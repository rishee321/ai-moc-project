from sqlalchemy import Column, Integer, String, Text
from database.database import Base


class CodingChallenge(Base):
    __tablename__ = "coding_challenges"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=False)

    difficulty = Column(String(30), nullable=False)

    category = Column(String(100), nullable=True)

    language = Column(String(50), nullable=True)

    input_format = Column(Text, nullable=True)

    output_format = Column(Text, nullable=True)

    sample_input = Column(Text, nullable=True)

    sample_output = Column(Text, nullable=True)

    test_cases = Column(Text, nullable=True)