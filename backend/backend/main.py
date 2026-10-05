

from fastapi import FastAPI, Depends

from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine

from models.user_model import User
from models.interview_model import Interview
from models.question_model import Question
from models.answer_model import Answer
from models.result_model import Result
from models.resume_model import Resume

from routers.auth_router import router as auth_router
from routers.interview_router import router as interview_router
from routers.question_router import router as question_router
from routers.answer_router import router as answer_router
from routers.result_router import router as result_router
from routers.dashboard_router import router as dashboard_router
from routers.resume_router import router as resume_router
from routers.ai_router import router as ai_router
from models.skill_gap_model import SkillGapAnalysis
from routers.skill_gap_router import router as skill_gap_router
from models.improvement_plan_model import ImprovementPlan
from routers.improvement_plan_router import router as improvement_plan_router
from models.job_matching_model import JobMatching
from routers.job_matching_router import router as job_matching_router
from routers.admin_router import router as admin_router
from routers.interview_tamplate_router import router as interview_template_router
from routers.coding_challenge_router import router as coding_router

from utils.auth_dependency import get_current_user

 
# create database table

Base.metadata.create_all(bind=engine)

# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(
    title="AI Mock Interview API",
    description="Backend API for AI Mock Interview and Personalized Performance Analysis System",
    version="1.0.0"
)


# =========================================================
# CORS Configuration
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Create Database Tables
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# Include Routers
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    interview_router
)

app.include_router(
    question_router
)

app.include_router(
    answer_router
)

app.include_router(
    result_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    resume_router
)

app.include_router(
    ai_router
)

app.include_router(
    skill_gap_router
)

app.include_router(
    improvement_plan_router
)

app.include_router(
    job_matching_router
)

app.include_router(
    admin_router
)

app.include_router(
    interview_template_router
)

app.include_router(
    coding_router
)

# =========================================================
# Home API
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI Mock Interview Backend is running!"
    }


# =========================================================
# Protected API
# =========================================================

@app.get("/protected")
def protected_route(
    current_user: dict = Depends(get_current_user)
):

    return {
        "message": "You are authenticated!",
        "user": current_user
    }