import json

from models.coding_challenge_model import CodingChallenge
from models.coding_submission_model import CodingSubmission


# =====================================================
# CREATE CODING CHALLENGE
# =====================================================

def create_coding_challenge(db, challenge_data):

    new_challenge = CodingChallenge(
        title=challenge_data.title,
        description=challenge_data.description,
        difficulty=challenge_data.difficulty,
        category=challenge_data.category,
        language=challenge_data.language,
        input_format=challenge_data.input_format,
        output_format=challenge_data.output_format,
        sample_input=challenge_data.sample_input,
        sample_output=challenge_data.sample_output,
        test_cases=challenge_data.test_cases
    )

    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)

    return new_challenge


# =====================================================
# GET ALL CODING CHALLENGES
# =====================================================

def get_all_coding_challenges(db):

    return (
        db.query(CodingChallenge)
        .order_by(CodingChallenge.id.asc())
        .all()
    )


# =====================================================
# GET SINGLE CODING CHALLENGE
# =====================================================

def get_coding_challenge(db, challenge_id):

    return (
        db.query(CodingChallenge)
        .filter(
            CodingChallenge.id == challenge_id
        )
        .first()
    )


# =====================================================
# CALCULATE SCORE
# =====================================================

def calculate_score(
    passed_test_cases: int,
    total_test_cases: int
):

    if total_test_cases <= 0:
        return 0

    return round(
        (passed_test_cases / total_test_cases) * 100,
        2
    )


# =====================================================
# CREATE CODE SUBMISSION
# =====================================================

def create_submission(
    db,
    user_id: int,
    challenge_id: int,
    language: str,
    code: str
):

    challenge = get_coding_challenge(
        db,
        challenge_id
    )

    if not challenge:
        return None

    # ---------------------------------------------
    # Read test cases
    # ---------------------------------------------

    total_test_cases = 0
    passed_test_cases = 0

    if challenge.test_cases:

        try:

            test_cases = json.loads(
                challenge.test_cases
            )

            if isinstance(test_cases, list):

                total_test_cases = len(
                    test_cases
                )

        except (
            json.JSONDecodeError,
            TypeError
        ):

            total_test_cases = 0

    # ---------------------------------------------
    # Initial score
    # ---------------------------------------------

    score = calculate_score(
        passed_test_cases,
        total_test_cases
    )

    # ---------------------------------------------
    # Create submission
    # ---------------------------------------------

    new_submission = CodingSubmission(

        user_id=user_id,

        challenge_id=challenge_id,

        language=language,

        code=code,

        status="Pending Execution",

        score=score,

        passed_test_cases=passed_test_cases,

        total_test_cases=total_test_cases,

        execution_time=None,

        error_message=None,

        ai_feedback=None
    )

    db.add(new_submission)

    db.commit()

    db.refresh(new_submission)

    return new_submission