from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.question_model import Question
from models.answer_model import Answer
from models.interview_model import Interview

from utils.auth_dependency import get_current_user

from services.ai_service import (
    generate_follow_up_question,
    get_adaptive_difficulty
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Interview"]
)


# Maximum follow-up questions allowed
MAX_FOLLOW_UPS = 2


# ==================================================
# ADAPTIVE FOLLOW-UP QUESTION
# ==================================================

@router.post("/follow-up/{question_id}")
def create_follow_up_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # ------------------------------------------------
    # 1. Find original question + interview
    # ------------------------------------------------

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

    # Get interview information
    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    # Domain used by Gemini for generating relevant follow-up
    domain = interview.domain


    # ------------------------------------------------
    # 2. Find latest answer
    # ------------------------------------------------

    answer = db.query(Answer).filter(
        Answer.question_id == question_id
    ).order_by(
        Answer.id.desc()
    ).first()

    if not answer:
        raise HTTPException(
            status_code=400,
            detail="No answer found for this question"
        )


    # ------------------------------------------------
    # 3. Count existing follow-ups
    # ------------------------------------------------

    follow_up_count = db.query(Question).filter(
        Question.interview_id == question.interview_id,
        Question.category == "Adaptive Follow-up"
    ).count()


    # ------------------------------------------------
    # 4. Check follow-up limit
    # ------------------------------------------------

    if follow_up_count >= MAX_FOLLOW_UPS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Maximum follow-up limit reached. "
                f"Only {MAX_FOLLOW_UPS} adaptive follow-ups "
                f"are allowed."
            )
        )


    # ------------------------------------------------
    # 5. Determine adaptive difficulty
    # ------------------------------------------------

    adaptive_difficulty = get_adaptive_difficulty(
        answer.score
    )


    # ------------------------------------------------
    # 6. Generate follow-up using Gemini
    # ------------------------------------------------

    follow_up_question = generate_follow_up_question(
        question=question.question_text,
        answer=answer.answer_text,
        score=answer.score,
        domain=domain
    )

    if not follow_up_question:
        raise HTTPException(
            status_code=500,
            detail="Could not generate follow-up question"
        )


    # ------------------------------------------------
    # 7. Save follow-up question
    # ------------------------------------------------

    new_question = Question(
        interview_id=question.interview_id,
        question_text=follow_up_question,
        category="Adaptive Follow-up",
        difficulty=adaptive_difficulty
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)


    # ------------------------------------------------
    # 8. Return response
    # ------------------------------------------------

    return {
        "message": "Adaptive follow-up question generated successfully",

        "previous_question_id": question.id,

        "previous_question": question.question_text,

        "answer_id": answer.id,

        "answer_score": answer.score,

        "domain": domain,

        "adaptive_difficulty": adaptive_difficulty,

        "follow_up_number": follow_up_count + 1,

        "maximum_follow_ups": MAX_FOLLOW_UPS,

        "follow_up_question_id": new_question.id,

        "follow_up_question": new_question.question_text,

        "category": new_question.category,

        "difficulty": new_question.difficulty
    }