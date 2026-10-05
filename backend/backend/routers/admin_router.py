from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.database import get_db

from models.user_model import User
from models.interview_model import Interview
from models.result_model import Result

from schemas.admin_schema import (
    AdminDashboardResponse,
    InterviewTypeStatistic,
    AdminUserPerformance
)

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"]
)


# =========================================================
# ADMIN ACCESS CHECK
# =========================================================

def check_admin(current_user: dict):
    """
    Temporary admin check.

    For now, user ID 1 is treated as admin.
    Later we can add a proper role column
    (admin/user) to the users table.
    """

    if current_user["user_id"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )


# =========================================================
# 1. ADMIN DASHBOARD
# =========================================================

@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse
)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    check_admin(current_user)

    total_users = (
        db.query(User)
        .count()
    )

    total_interviews = (
        db.query(Interview)
        .count()
    )

    completed_interviews = (
        db.query(Interview)
        .filter(
            Interview.status == "completed"
        )
        .count()
    )

    in_progress_interviews = (
        db.query(Interview)
        .filter(
            Interview.status == "in_progress"
        )
        .count()
    )

    created_interviews = (
        db.query(Interview)
        .filter(
            Interview.status == "created"
        )
        .count()
    )

    average_score = (
        db.query(
            func.avg(Result.overall_score)
        )
        .scalar()
    )

    return {
        "total_users": total_users,
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "in_progress_interviews": in_progress_interviews,
        "created_interviews": created_interviews,
        "average_score": round(
            average_score, 2
        ) if average_score is not None else None
    }


# =========================================================
# 2. INTERVIEW TYPE STATISTICS
# =========================================================

@router.get(
    "/interview-types",
    response_model=list[InterviewTypeStatistic]
)
def get_interview_type_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    check_admin(current_user)

    statistics = (
        db.query(
            Interview.interview_type,
            func.count(Interview.id)
        )
        .group_by(
            Interview.interview_type
        )
        .all()
    )

    return [
        {
            "interview_type": interview_type,
            "total_interviews": total
        }
        for interview_type, total in statistics
    ]


# =========================================================
# 3. USER PERFORMANCE
# =========================================================

@router.get(
    "/user-performance",
    response_model=list[AdminUserPerformance]
)
def get_user_performance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    check_admin(current_user)

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    performance = []

    for user in users:

        total_interviews = (
            db.query(Interview)
            .filter(
                Interview.user_id == user.id
            )
            .count()
        )

        completed_interviews = (
            db.query(Interview)
            .filter(
                Interview.user_id == user.id,
                Interview.status == "completed"
            )
            .count()
        )

        average_score = (
            db.query(
                func.avg(Result.overall_score)
            )
            .join(
                Interview,
                Result.interview_id == Interview.id
            )
            .filter(
                Interview.user_id == user.id
            )
            .scalar()
        )

        performance.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "average_score": round(
                average_score, 2
            ) if average_score is not None else None
        })

    return performance