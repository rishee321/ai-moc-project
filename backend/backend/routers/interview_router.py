from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database.database import get_db

from models.interview_model import Interview
from models.result_model import Result
from models.question_model import Question
from models.answer_model import Answer

from schemas.interview_schema import (
    InterviewCreate,
    InterviewResponse,
    InterviewHistoryResponse
)

from utils.auth_dependency import get_current_user

from services.ai_service import generate_interview_questions


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"]
)


# ==================================================
# CREATE QUESTIONS USING GEMINI
# ==================================================

def generate_questions(interview):

    domain = interview.domain or "Software Development"

    interview_type = (
        interview.interview_type
        or "Technical"
    )

    difficulty = (
        interview.difficulty
        or "Adaptive"
    )

    total_questions = (
        interview.total_questions
        or 10
    )

    print(
        f"Generating {total_questions} AI questions "
        f"for {domain} / {interview_type} / {difficulty}"
    )

    generated_questions = generate_interview_questions(
        domain=domain,
        interview_type=interview_type,
        difficulty=difficulty,
        number_of_questions=total_questions
    )

    questions = []

    for item in generated_questions:

        question = Question(
            interview_id=interview.id,
            question_text=item["question_text"],
            category=item["category"],
            difficulty=difficulty
        )

        questions.append(question)

    return questions


# ==================================================
# CREATE INTERVIEW
# ==================================================

@router.post(
    "/",
    response_model=InterviewResponse
)
def create_interview(
    interview_data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    new_interview = Interview(
        user_id=current_user["user_id"],
        interview_type=interview_data.interview_type,
        domain=interview_data.domain,
        difficulty=interview_data.difficulty,
        total_questions=interview_data.total_questions,
        status="created"
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return new_interview


# ==================================================
# GET MY INTERVIEWS
# ==================================================

@router.get(
    "/",
    response_model=list[InterviewResponse]
)
def get_my_interviews(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interviews = db.query(Interview).filter(
        Interview.user_id == current_user["user_id"]
    ).all()

    return interviews


# ==================================================
# START INTERVIEW
# ==================================================

@router.post(
    "/{interview_id}/start",
    response_model=InterviewResponse
)
def start_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    if interview.status == "completed":

        raise HTTPException(
            status_code=400,
            detail="Interview is already completed"
        )

    if interview.status == "in_progress":

        raise HTTPException(
            status_code=400,
            detail="Interview is already in progress"
        )

    # ==================================================
    # GENERATE QUESTIONS USING GEMINI
    # ==================================================

    existing_questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).count()

    if existing_questions == 0:

        try:

            questions = generate_questions(
                interview
            )

            for question in questions:
                db.add(question)

        except Exception as error:

            db.rollback()

            print(
                "AI QUESTION GENERATION ERROR:",
                error
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI question generation failed. "
                    "Please try starting a new interview."
                )
            )

    # ==================================================
    # START INTERVIEW
    # ==================================================

    interview.status = "in_progress"

    interview.started_at = datetime.utcnow()

    db.commit()
    db.refresh(interview)

    return interview


# ==================================================
# GET INTERVIEW QUESTIONS
# ==================================================

@router.get(
    "/{interview_id}/questions"
)
def get_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(
        Question.id.asc()
    ).all()

    return [
        {
            "id": question.id,
            "question_text": question.question_text,
            "category": question.category,
            "difficulty": question.difficulty
        }
        for question in questions
    ]


# ==================================================
# COMPLETE INTERVIEW
# ==================================================

@router.post(
    "/{interview_id}/complete",
    response_model=InterviewResponse
)
def complete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    if interview.status == "created":

        raise HTTPException(
            status_code=400,
            detail="Interview has not been started yet"
        )

    if interview.status == "completed":

        raise HTTPException(
            status_code=400,
            detail="Interview is already completed"
        )

    interview.status = "completed"

    interview.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(interview)

    return interview


# ==================================================
# GET INTERVIEW HISTORY
# IMPORTANT:
# KEEP THIS BEFORE /{interview_id}
# ==================================================

@router.get(
    "/history/all",
    response_model=list[InterviewHistoryResponse]
)
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interviews = db.query(Interview).filter(
        Interview.user_id == current_user["user_id"]
    ).order_by(
        Interview.id.desc()
    ).all()

    history = []

    for interview in interviews:

        result = db.query(Result).filter(
            Result.interview_id == interview.id
        ).first()

        history.append({

            "id": interview.id,

            "interview_type":
                interview.interview_type,

            "domain":
                interview.domain,

            "difficulty":
                interview.difficulty,

            "total_questions":
                interview.total_questions,

            "overall_score": (
                result.overall_score
                if result else None
            ),

            "technical_score": (
                result.technical_score
                if result else None
            ),

            "communication_score": (
                result.communication_score
                if result else None
            ),

            "problem_solving_score": (
                result.problem_solving_score
                if result else None
            ),

            "status":
                interview.status,

            "started_at":
                interview.started_at,

            "completed_at":
                interview.completed_at
        })

    return history


# ==================================================
# INTERVIEW PROGRESS
# ==================================================

@router.get(
    "/{interview_id}/progress"
)
def get_interview_progress(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).all()

    total_questions = len(questions)

    answered_questions = 0

    for question in questions:

        answer = db.query(Answer).filter(
            Answer.question_id == question.id
        ).order_by(
            Answer.id.desc()
        ).first()

        if answer:
            answered_questions += 1

    remaining_questions = (
        total_questions -
        answered_questions
    )

    if total_questions > 0:

        progress_percentage = round(
            (
                answered_questions /
                total_questions
            ) * 100,
            2
        )

    else:

        progress_percentage = 0

    return {

        "interview_id":
            interview.id,

        "total_questions":
            total_questions,

        "answered_questions":
            answered_questions,

        "remaining_questions":
            remaining_questions,

        "progress_percentage":
            progress_percentage,

        "status":
            interview.status
    }


# ==================================================
# GET SINGLE INTERVIEW
# ==================================================

@router.get(
    "/{interview_id}",
    response_model=InterviewResponse
)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    return interview