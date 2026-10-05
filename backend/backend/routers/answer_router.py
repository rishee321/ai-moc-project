from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.answer_model import Answer
from models.question_model import Question
from models.interview_model import Interview

from schemas.answer_schema import (
    AnswerCreate,
    AnswerResponse
)

from utils.auth_dependency import get_current_user

from services.ai_service import evaluate_answer


router = APIRouter(
    prefix="/answers",
    tags=["Answers"]
)


# =========================================================
# SUBMIT ANSWER
# =========================================================

@router.post(
    "/",
    response_model=AnswerResponse
)
def submit_answer(
    answer_data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # 1. Find question
    # -----------------------------------------------------

    question = db.query(Question).filter(
        Question.id == answer_data.question_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )


    # -----------------------------------------------------
    # 2. Verify interview ownership
    # -----------------------------------------------------

    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )


    # -----------------------------------------------------
    # 3. Check interview status
    # -----------------------------------------------------

    if interview.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot submit answer. "
                f"Interview status is '{interview.status}'. "
                f"Start the interview first."
            )
        )


    # -----------------------------------------------------
    # 4. Validate empty answer
    # -----------------------------------------------------

    if not answer_data.answer_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty"
        )


    # -----------------------------------------------------
    # 5. Check duplicate answer
    # -----------------------------------------------------

    existing_answer = db.query(Answer).filter(
        Answer.question_id == answer_data.question_id
    ).first()

    if existing_answer:
        raise HTTPException(
            status_code=400,
            detail="This question has already been answered"
        )


    # -----------------------------------------------------
    # 6. AI Evaluation
    # -----------------------------------------------------

    ai_result = evaluate_answer(
        question.question_text,
        answer_data.answer_text
    )


    # -----------------------------------------------------
    # 7. Extract AI score
    # -----------------------------------------------------

    score = None

    if isinstance(ai_result, dict):

        score_value = ai_result.get("score")

        try:
            if score_value is not None:
                score = float(score_value)
        except (ValueError, TypeError):
            score = None

    else:

        # Backward compatibility if AI returns string
        for line in str(ai_result).splitlines():

            if line.strip().lower().startswith("score:"):

                try:
                    score_text = line.split(
                        ":",
                        1
                    )[1].strip()

                    score = float(
                        score_text.split(
                            "/",
                            1
                        )[0].strip()
                    )

                except (ValueError, TypeError):
                    score = None

                break


    # -----------------------------------------------------
    # 8. Convert AI feedback to string
    # -----------------------------------------------------

    if isinstance(ai_result, dict):

        feedback_parts = []

        if ai_result.get("feedback"):
            feedback_parts.append(
                f"Feedback: {ai_result['feedback']}"
            )

        if ai_result.get("strengths"):
            feedback_parts.append(
                f"Strengths: {ai_result['strengths']}"
            )

        if ai_result.get("weaknesses"):
            feedback_parts.append(
                f"Weaknesses: {ai_result['weaknesses']}"
            )

        if ai_result.get("suggestions"):
            feedback_parts.append(
                f"Suggestions: {ai_result['suggestions']}"
            )

        feedback = "\n".join(feedback_parts)

    else:
        feedback = str(ai_result)


    # -----------------------------------------------------
    # 9. Save answer
    # -----------------------------------------------------

    new_answer = Answer(
        question_id=answer_data.question_id,
        answer_text=answer_data.answer_text,
        score=score,
        feedback=feedback
    )

    db.add(new_answer)

    db.commit()

    db.refresh(new_answer)


    # -----------------------------------------------------
    # 10. Return answer
    # -----------------------------------------------------

    return new_answer


# =========================================================
# GET ANSWER
# =========================================================

@router.get(
    "/{answer_id}",
    response_model=AnswerResponse
)
def get_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    answer = db.query(Answer).join(
        Question,
        Answer.question_id == Question.id
    ).join(
        Interview,
        Question.interview_id == Interview.id
    ).filter(
        Answer.id == answer_id,
        Interview.user_id == current_user["user_id"]
    ).first()


    if not answer:
        raise HTTPException(
            status_code=404,
            detail="Answer not found"
        )


    return answer