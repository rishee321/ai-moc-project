from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.question_model import Question
from models.interview_model import Interview
from models.answer_model import Answer

from schemas.question_schema import (
    QuestionCreate,
    QuestionResponse
)

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


# =========================================================
# CREATE QUESTION
# =========================================================

@router.post(
    "/",
    response_model=QuestionResponse
)
def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # Check interview ownership
    # -----------------------------------------------------

    interview = db.query(Interview).filter(
        Interview.id == question_data.interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    # -----------------------------------------------------
    # Create question
    # -----------------------------------------------------

    new_question = Question(
        interview_id=question_data.interview_id,
        question_text=question_data.question_text,
        category=question_data.category,
        difficulty=question_data.difficulty
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


# =========================================================
# GET ALL QUESTIONS OF AN INTERVIEW
# =========================================================

@router.get(
    "/interview/{interview_id}",
    response_model=list[QuestionResponse]
)
def get_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # Check interview ownership
    # -----------------------------------------------------

    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    # -----------------------------------------------------
    # Get questions
    # -----------------------------------------------------

    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).all()

    return questions


# =========================================================
# GET QUESTION ANSWER STATUS
# =========================================================

@router.get(
    "/{question_id}/status"
)
def get_question_answer_status(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # Find question and verify ownership
    # -----------------------------------------------------

    question = db.query(Question).join(
        Interview,
        Question.interview_id == Interview.id
    ).filter(
        Question.id == question_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    # -----------------------------------------------------
    # Find latest answer
    # -----------------------------------------------------

    answer = db.query(Answer).filter(
        Answer.question_id == question_id
    ).order_by(
        Answer.id.desc()
    ).first()

    # -----------------------------------------------------
    # Question not answered
    # -----------------------------------------------------

    if not answer:
        return {
            "question_id": question.id,
            "question": question.question_text,
            "category": question.category,
            "difficulty": question.difficulty,
            "answered": False,
            "answer_id": None,
            "score": None
        }

    # -----------------------------------------------------
    # Question answered
    # -----------------------------------------------------

    return {
        "question_id": question.id,
        "question": question.question_text,
        "category": question.category,
        "difficulty": question.difficulty,
        "answered": True,
        "answer_id": answer.id,
        "score": answer.score
    }


# =========================================================
# GET SINGLE QUESTION
# =========================================================

@router.get(
    "/{question_id}",
    response_model=QuestionResponse
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # Find question and verify ownership
    # -----------------------------------------------------

    question = db.query(Question).join(
        Interview,
        Question.interview_id == Interview.id
    ).filter(
        Question.id == question_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    return question