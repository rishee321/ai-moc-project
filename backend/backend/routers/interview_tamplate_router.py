from fastapi import APIRouter, HTTPException

from schemas.interview_template_schema import (
    InterviewTemplateResponse
)


router = APIRouter(
    prefix="/interview-templates",
    tags=["Interview Templates"]
)


# =========================================================
# INTERVIEW TEMPLATES
# =========================================================

INTERVIEW_TEMPLATES = [
    {
        "template_id": "technical",
        "name": "Technical Interview",
        "description": "Technical questions based on programming, databases, APIs and software development.",
        "interview_type": "Technical",
        "recommended_questions": 10,
        "supported_difficulty": [
            "Easy",
            "Medium",
            "Hard"
        ],
        "features": [
            "Technical Questions",
            "AI Evaluation",
            "Adaptive Follow-up",
            "Performance Analysis"
        ]
    },
    {
        "template_id": "hr",
        "name": "HR Interview",
        "description": "HR and personality-based questions for interview preparation.",
        "interview_type": "HR",
        "recommended_questions": 8,
        "supported_difficulty": [
            "Easy",
            "Medium"
        ],
        "features": [
            "HR Questions",
            "Communication Evaluation",
            "AI Feedback",
            "Performance Analysis"
        ]
    },
    {
        "template_id": "behavioral",
        "name": "Behavioral Interview",
        "description": "Behavioral and situational questions to evaluate communication and problem-solving.",
        "interview_type": "Behavioral",
        "recommended_questions": 8,
        "supported_difficulty": [
            "Medium",
            "Hard"
        ],
        "features": [
            "Situational Questions",
            "Problem Solving",
            "Communication Evaluation",
            "AI Feedback"
        ]
    },
    {
        "template_id": "resume",
        "name": "Resume Based Interview",
        "description": "Personalized interview questions generated from the candidate's resume.",
        "interview_type": "Resume Based",
        "recommended_questions": 10,
        "supported_difficulty": [
            "Easy",
            "Medium",
            "Hard"
        ],
        "features": [
            "Resume Analysis",
            "Personalized Questions",
            "AI Evaluation",
            "Adaptive Follow-up"
        ]
    },
    {
        "template_id": "job-description",
        "name": "Job Description Based Interview",
        "description": "Interview preparation based on the requirements of a specific job description.",
        "interview_type": "Job Description Based",
        "recommended_questions": 10,
        "supported_difficulty": [
            "Medium",
            "Hard"
        ],
        "features": [
            "Job Matching",
            "Skill Gap Analysis",
            "Personalized Questions",
            "AI Evaluation"
        ]
    }
]


# =========================================================
# GET ALL TEMPLATES
# =========================================================

@router.get(
    "/",
    response_model=list[InterviewTemplateResponse]
)
def get_interview_templates():

    return INTERVIEW_TEMPLATES


# =========================================================
# GET TEMPLATE BY ID
# =========================================================

@router.get(
    "/{template_id}",
    response_model=InterviewTemplateResponse
)
def get_interview_template(
    template_id: str
):

    for template in INTERVIEW_TEMPLATES:

        if template["template_id"] == template_id:
            return template

    raise HTTPException(
        status_code=404,
        detail="Interview template not found"
    )