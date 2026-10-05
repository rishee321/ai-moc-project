from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.coding_challenge_model import CodingChallenge
from models.coding_submission_model import CodingSubmission
from services.code_execution_service import execute_python_code
from services.ai_service import review_code

from schemas.coding_schema import (
    CodingChallengeCreate,
    CodingChallengeResponse,
    CodingSubmissionCreate,
    CodingSubmissionResponse
)

from services.coding_service import (
    create_coding_challenge,
    get_all_coding_challenges,
    get_coding_challenge,
    create_submission
)

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/coding",
    tags=["Coding Round"]
)


# =====================================================
# CREATE CODING CHALLENGE
# =====================================================

@router.post(
    "/challenges",
    response_model=CodingChallengeResponse
)
def create_challenge(
    challenge_data: CodingChallengeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only admin can create coding challenges
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return create_coding_challenge(
        db,
        challenge_data
    )


# =====================================================
# GET ALL CODING CHALLENGES
# =====================================================

@router.get(
    "/challenges",
    response_model=list[CodingChallengeResponse]
)
def get_challenges(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_all_coding_challenges(db)


# =====================================================
# GET SINGLE CODING CHALLENGE
# =====================================================

@router.get(
    "/challenges/{challenge_id}",
    response_model=CodingChallengeResponse
)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    challenge = get_coding_challenge(
        db,
        challenge_id
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Coding challenge not found"
        )

    return challenge


# =====================================================
# SUBMIT CODE
# =====================================================

@router.post(
    "/submit",
    response_model=CodingSubmissionResponse
)
def submit_code(
    submission_data: CodingSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check code
    if not submission_data.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty"
        )

    # Get challenge
    challenge = get_coding_challenge(
        db,
        submission_data.challenge_id
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Coding challenge not found"
        )

    # Currently Python is supported
    if submission_data.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Currently only Python is supported"
        )

    # Check test cases
    if not challenge.test_cases:
        raise HTTPException(
            status_code=400,
            detail="No test cases available"
        )

    # Create submission
    submission = CodingSubmission(
        user_id=current_user["user_id"],
        challenge_id=submission_data.challenge_id,
        language=submission_data.language,
        code=submission_data.code,
        status="Running",
        score=0,
        passed_test_cases=0,
        total_test_cases=0
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Execute code
    try:
        execution_result = execute_python_code(
            code=submission_data.code,
            test_cases=challenge.test_cases
        )

        submission.status = execution_result.get(
            "status",
            "Execution Failed"
        )

        submission.score = execution_result.get(
            "score",
            0
        )

        submission.passed_test_cases = execution_result.get(
            "passed_test_cases",
            0
        )

        submission.total_test_cases = execution_result.get(
            "total_test_cases",
            0
        )

        submission.execution_time = execution_result.get(
            "execution_time",
            0
        )

        submission.error_message = execution_result.get(
            "error_message"
        )

        db.commit()
        db.refresh(submission)

        # =====================================================
        # AI CODE REVIEW
        # =====================================================

        try:
            ai_feedback = review_code(
                code=submission_data.code,
                language=submission_data.language,
                problem_description=challenge.description,
                execution_status=submission.status,
                score=submission.score or 0
            )

            submission.ai_feedback = ai_feedback

            db.commit()
            db.refresh(submission)

        except Exception as ai_error:
            submission.ai_feedback = (
                f"AI code review unavailable: {str(ai_error)}"
            )

            db.commit()
            db.refresh(submission)

        return submission

    except Exception as e:

        submission.status = "Execution Failed"
        submission.error_message = str(e)

        db.commit()
        db.refresh(submission)

        return submission

# =====================================================
# GET CURRENT USER SUBMISSION HISTORY
# =====================================================

@router.get(
    "/submissions",
    response_model=list[CodingSubmissionResponse]
)
def get_submission_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    submissions = (
        db.query(CodingSubmission)
        .filter(
            CodingSubmission.user_id ==
            current_user["user_id"]
        )
        .order_by(
            CodingSubmission.id.desc()
        )
        .all()
    )

    return submissions


# =====================================================
# GET SINGLE SUBMISSION
# =====================================================

@router.get(
    "/submissions/{submission_id}",
    response_model=CodingSubmissionResponse
)
def get_submission_details(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    submission = (
        db.query(CodingSubmission)
        .filter(
            CodingSubmission.id == submission_id,
            CodingSubmission.user_id ==
            current_user["user_id"]
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    return submission    