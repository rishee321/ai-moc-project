from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

#from backend import schemas
from schemas.improvement_plan_schema import ImprovementPlanResponse
from database.database import get_db

from models.interview_model import Interview
from models.skill_gap_model import SkillGapAnalysis
from models.improvement_plan_model import ImprovementPlan

from schemas.improvement_plan_schema import ImprovementPlanResponse

from services.improvement_plan_service import generate_improvement_plan

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/improvement-plan",
    tags=["Improvement Plan"]
)


@router.post(
    "/generate/{interview_id}",
    response_model=ImprovementPlanResponse
)
def create_improvement_plan(
    interview_id: int,
    duration_days: int = 7,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # 1. Validate duration
    if duration_days not in [7, 14]:
        raise HTTPException(
            status_code=400,
            detail="Duration must be either 7 or 14 days"
        )

    # 2. Check interview ownership
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    # 3. Interview must be completed
    if interview.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Complete the interview before generating an improvement plan"
        )

    # 4. Get latest Skill Gap Analysis
    skill_gap = db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.interview_id == interview_id,
        SkillGapAnalysis.user_id == current_user["user_id"]
    ).order_by(
        SkillGapAnalysis.id.desc()
    ).first()

    if not skill_gap:
        raise HTTPException(
            status_code=404,
            detail="Skill Gap Analysis not found. Generate Skill Gap Analysis first."
        )

    # 5. Generate AI improvement plan
    ai_plan = generate_improvement_plan(
        strong_skills=skill_gap.strong_skills or "",
        moderate_skills=skill_gap.moderate_skills or "",
        weak_skills=skill_gap.weak_skills or "",
        missing_skills=skill_gap.missing_skills or "",
        duration_days=duration_days
    )

    if not ai_plan:
        raise HTTPException(
            status_code=500,
            detail="Could not generate improvement plan"
        )

    # 6. Extract focus areas
    focus_areas = skill_gap.weak_skills or ""

    if skill_gap.missing_skills:
        if focus_areas:
            focus_areas += ", " + skill_gap.missing_skills
        else:
            focus_areas = skill_gap.missing_skills

    # 7. Save improvement plan
    new_plan = ImprovementPlan(
        user_id=current_user["user_id"],
        interview_id=interview_id,
        duration_days=duration_days,
        plan=ai_plan,
        focus_areas=focus_areas
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.get(
    "/{interview_id}",
    response_model=ImprovementPlanResponse
)
def get_improvement_plan(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    plan = db.query(ImprovementPlan).filter(
        ImprovementPlan.interview_id == interview_id,
        ImprovementPlan.user_id == current_user["user_id"]
    ).order_by(
        ImprovementPlan.id.desc()
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Improvement plan not found"
        )

    return plan