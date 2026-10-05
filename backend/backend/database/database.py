from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# SQLite Database URL
DATABASE_URL = "sqlite:///./ai_mock_interview.db"


# Create Database Engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Create Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for all models
Base = declarative_base()


# Database Dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()