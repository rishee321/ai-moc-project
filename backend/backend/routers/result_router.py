from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from database.database import get_db

from models.result_model import Result
from models.interview_model import Interview
from models.question_model import Question
from models.answer_model import Answer

from schemas.result_schema import ResultResponse

from utils.auth_dependency import get_current_user

from services.ai_service import analyze_interview
from services.report_service import generate_interview_report


router = APIRouter(
    prefix="/results",
    tags=["Results"]
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_value(data: dict, *keys):
    """
    Get value from Gemini response using multiple
    possible key names.
    """

    for key in keys:

        if key in data and data[key] is not None:
            return data[key]

    return None


def get_score(data: dict, *keys):
    """
    Safely convert Gemini score to float.
    """

    value = get_value(data, *keys)

    if value is None:
        return None

    try:
        if isinstance(value, str):
            value = value.replace("/10", "")
            value = value.replace("/ 10", "")
            value = value.strip()

        return float(value)

    except (ValueError, TypeError):
        return None


def get_text(data: dict, *keys):
    """
    Safely convert Gemini feedback into text.
    """

    value = get_value(data, *keys)

    if value is None:
        return ""

    if isinstance(value, list):
        return "\n".join(
            str(item) for item in value
        )

    if isinstance(value, dict):
        return "\n".join(
            f"{key}: {value}"
            for key, value in value.items()
        )

    return str(value).strip()


# =========================================================
# GENERATE INTERVIEW RESULT
# =========================================================

@router.post(
    "/generate/{interview_id}",
    response_model=ResultResponse
)
def generate_result(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # 1. Find interview
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
    # 2. Get questions
    # -----------------------------------------------------

    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="No questions found for this interview"
        )


    # -----------------------------------------------------
    # 3. Build answer data
    # -----------------------------------------------------

    answers_text = ""

    for question in questions:

        answer = db.query(Answer).filter(
            Answer.question_id == question.id
        ).order_by(
            Answer.id.desc()
        ).first()

        if answer:

            answers_text += (
                f"\nQuestion: {question.question_text}\n"
                f"Candidate Answer: {answer.answer_text}\n"
                f"Individual Score: {answer.score}\n"
            )


    if not answers_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No answers found for this interview"
        )


    # -----------------------------------------------------
    # 4. GEMINI FINAL ANALYSIS
    # -----------------------------------------------------

    print("\n========================================")
    print("GENERATING FINAL GEMINI ANALYSIS")
    print("========================================")

    ai_result = analyze_interview(
        answers_text
    )

    print("GEMINI FINAL RESULT:")
    print(ai_result)
    print("========================================\n")


    # -----------------------------------------------------
    # 5. Make sure response is dictionary
    # -----------------------------------------------------

    if not isinstance(ai_result, dict):

        raise HTTPException(
            status_code=500,
            detail="Gemini returned an invalid final analysis format"
        )


    # -----------------------------------------------------
    # 6. Extract Gemini scores
    # -----------------------------------------------------

    overall_score = get_score(
        ai_result,
        "overall_score",
        "Overall Score",
        "overall"
    )

    technical_score = get_score(
        ai_result,
        "technical_score",
        "Technical Score",
        "technical"
    )

    communication_score = get_score(
        ai_result,
        "communication_score",
        "Communication Score",
        "communication"
    )

    problem_solving_score = get_score(
        ai_result,
        "problem_solving_score",
        "Problem Solving Score",
        "problem_solving",
        "problemSolving"
    )


    # -----------------------------------------------------
    # 7. Extract Gemini feedback
    # -----------------------------------------------------

    strengths = get_text(
        ai_result,
        "strengths",
        "Strengths"
    )

    weaknesses = get_text(
        ai_result,
        "weaknesses",
        "Weaknesses",
        "areas_to_improve",
        "Areas to Improve"
    )

    suggestions = get_text(
        ai_result,
        "suggestions",
        "Suggestions",
        "suggestion",
        "final_suggestion",
        "Final Suggestion"
    )


    # -----------------------------------------------------
    # 8. Validate Gemini result
    # -----------------------------------------------------

    if (
        overall_score is None
        and technical_score is None
        and communication_score is None
        and problem_solving_score is None
        and not strengths
        and not weaknesses
        and not suggestions
    ):

        raise HTTPException(
            status_code=500,
            detail="Gemini returned empty final analysis"
        )


    # -----------------------------------------------------
    # 9. Find existing result
    # -----------------------------------------------------

    result = db.query(Result).filter(
        Result.interview_id == interview_id
    ).first()


    # -----------------------------------------------------
    # 10. Update or create result
    # -----------------------------------------------------

    if result:

        result.overall_score = overall_score
        result.technical_score = technical_score
        result.communication_score = communication_score
        result.problem_solving_score = problem_solving_score

        result.strengths = strengths
        result.weaknesses = weaknesses
        result.suggestions = suggestions

    else:

        result = Result(
            interview_id=interview_id,

            overall_score=overall_score,
            technical_score=technical_score,
            communication_score=communication_score,
            problem_solving_score=problem_solving_score,

            strengths=strengths,
            weaknesses=weaknesses,
            suggestions=suggestions
        )

        db.add(result)


    # -----------------------------------------------------
    # 11. Save
    # -----------------------------------------------------

    db.commit()

    db.refresh(result)


    # -----------------------------------------------------
    # 12. Return Gemini result
    # -----------------------------------------------------

    return result


# =========================================================
# GET INTERVIEW RESULT
# =========================================================

@router.get(
    "/interview/{interview_id}",
    response_model=ResultResponse
)
def get_interview_result(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    result = db.query(Result).join(
        Interview,
        Result.interview_id == Interview.id
    ).filter(
        Result.interview_id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    return result


# =========================================================
# PDF REPORT
# =========================================================

@router.get(
    "/report/{interview_id}"
)
def download_interview_report(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # Check interview
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
    # Check result
    # -----------------------------------------------------

    result = db.query(Result).filter(
        Result.interview_id == interview_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Interview result not found. Generate result first."
        )


    # -----------------------------------------------------
    # Generate PDF
    # -----------------------------------------------------

    pdf_buffer = generate_interview_report(
        db,
        interview_id
    )

    if pdf_buffer is None:
        raise HTTPException(
            status_code=500,
            detail="Could not generate PDF report"
        )


    # -----------------------------------------------------
    # Return PDF
    # -----------------------------------------------------

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename=interview_report_{interview_id}.pdf"
        }
    )