from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.database import get_db

from models.interview_model import Interview
from models.result_model import Result

from schemas.dashboard_schema import DashboardResponse
from schemas.performance_schema import PerformanceTrendResponse
from schemas.topic_performance_schema import TopicPerformanceResponse

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# 1. DASHBOARD STATISTICS
# =========================================================

@router.get(
    "/stats",
    response_model=DashboardResponse
)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # Total interviews
    total_interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .count()
    )

    # Completed interviews
    completed_interviews = (
        db.query(Result)
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .count()
    )

    # Average overall score
    average_score = (
        db.query(func.avg(Result.overall_score))
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .scalar()
    )

    # Highest overall score
    highest_score = (
        db.query(func.max(Result.overall_score))
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .scalar()
    )

    # Technical average
    technical_average = (
        db.query(func.avg(Result.technical_score))
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .scalar()
    )

    # Communication average
    communication_average = (
        db.query(func.avg(Result.communication_score))
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .scalar()
    )

    # Problem solving average
    problem_solving_average = (
        db.query(func.avg(Result.problem_solving_score))
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .scalar()
    )

    return {
        "total_interviews": total_interviews,

        "completed_interviews": completed_interviews,

        "average_score": round(average_score, 2)
        if average_score is not None else None,

        "highest_score": round(highest_score, 2)
        if highest_score is not None else None,

        "technical_average": round(technical_average, 2)
        if technical_average is not None else None,

        "communication_average": round(communication_average, 2)
        if communication_average is not None else None,

        "problem_solving_average": round(problem_solving_average, 2)
        if problem_solving_average is not None else None
    }


# =========================================================
# 2. PERFORMANCE TREND
# =========================================================

@router.get(
    "/performance-trend",
    response_model=PerformanceTrendResponse
)
def get_performance_trend(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    results = (
        db.query(Result)
        .join(
            Interview,
            Result.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .order_by(
            Result.id.asc()
        )
        .all()
    )

    performance = []

    for result in results:

        performance.append({
            "interview_id": result.interview_id,
            "overall_score": result.overall_score,
            "technical_score": result.technical_score,
            "communication_score": result.communication_score,
            "problem_solving_score": result.problem_solving_score
        })

    return {
        "total_interviews": len(performance),
        "performance": performance
    }


# =========================================================
# 3. TOPIC-WISE PERFORMANCE
# =========================================================

@router.get(
    "/topic-performance",
    response_model=TopicPerformanceResponse
)
def get_topic_performance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    from models.question_model import Question
    from models.answer_model import Answer

    questions = (
        db.query(Question, Answer)
        .join(
            Answer,
            Question.id == Answer.question_id
        )
        .join(
            Interview,
            Question.interview_id == Interview.id
        )
        .filter(
            Interview.user_id == current_user["user_id"]
        )
        .all()
    )

    # Store topic-wise score data
    topic_data = {}

    for question, answer in questions:

        topic = question.category or "General"

        if topic not in topic_data:

            topic_data[topic] = {
                "total_score": 0,
                "questions_attempted": 0
            }

        if answer.score is not None:

            topic_data[topic]["total_score"] += answer.score

            topic_data[topic]["questions_attempted"] += 1

    topics = []

    # Calculate topic performance
    for topic, data in topic_data.items():

        attempted = data["questions_attempted"]

        # If no valid score
        if attempted == 0:

            average_score = None

            performance_level = "Not Available"

        else:

            # Calculate average score
            average_score = round(
                data["total_score"] / attempted,
                2
            )

            # Decide performance level
            if average_score >= 8:

                performance_level = "Strong"

            elif average_score >= 5:

                performance_level = "Moderate"

            else:

                performance_level = "Weak"

        topics.append({
            "topic": topic,
            "average_score": average_score,
            "questions_attempted": attempted,
            "performance_level": performance_level
        })

    return {
        "total_topics": len(topics),
        "topics": topics
    }