from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.resume_model import Resume
from models.job_matching_model import JobMatching

from schemas.job_matching_schema import JobMatchingResponse

from services.job_matching_service import analyze_job_match

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/job-matching",
    tags=["Job Matching"]
)


@router.post(
    "/analyze",
    response_model=JobMatchingResponse
)
def create_job_matching(
    resume_id: int,
    job_title: str,
    job_description: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # 1. Check Resume
    # -----------------------------------------------------

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user["user_id"]
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    # -----------------------------------------------------
    # 2. Validate Job Description
    # -----------------------------------------------------

    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty"
        )

    # -----------------------------------------------------
    # 3. Get Resume Text
    # -----------------------------------------------------

    resume_text = resume.extracted_text or ""

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is not available"
        )

    # -----------------------------------------------------
    # 4. Analyze Resume vs Job Description using Gemini
    # -----------------------------------------------------

    ai_result = analyze_job_match(
        resume_text=resume_text,
        job_description=job_description
    )

    if not ai_result:
        raise HTTPException(
            status_code=500,
            detail="Could not generate job matching analysis"
        )

    # -----------------------------------------------------
    # 5. Parse AI Response
    # -----------------------------------------------------

    job_title_result = job_title

    match_percentage = None
    matching_skills = ""
    missing_skills = ""
    skill_gaps = ""
    recommendations = ""

    current_section = None

    for line in ai_result.splitlines():

        line = line.strip()

        if not line:
            continue

        lower_line = line.lower()

        if lower_line.startswith("job title:"):

            value = line.split(":", 1)[1].strip()

            if value:
                job_title_result = value

            current_section = None

        elif lower_line.startswith("match percentage:"):

            value = line.split(":", 1)[1].strip()

            try:
                value = value.replace("%", "").strip()
                match_percentage = float(value)
            except ValueError:
                match_percentage = None

            current_section = None

        elif lower_line.startswith("matching skills:"):

            matching_skills = line.split(
                ":", 1
            )[1].strip()

            current_section = "matching"

        elif lower_line.startswith("missing skills:"):

            missing_skills = line.split(
                ":", 1
            )[1].strip()

            current_section = "missing"

        elif lower_line.startswith("skill gaps:"):

            skill_gaps = line.split(
                ":", 1
            )[1].strip()

            current_section = "gaps"

        elif lower_line.startswith("recommendations:"):

            recommendations = line.split(
                ":", 1
            )[1].strip()

            current_section = "recommendations"

        else:

            if current_section == "matching":

                matching_skills += " " + line

            elif current_section == "missing":

                missing_skills += " " + line

            elif current_section == "gaps":

                skill_gaps += " " + line

            elif current_section == "recommendations":

                recommendations += " " + line

    # -----------------------------------------------------
    # 6. Save Analysis
    # -----------------------------------------------------

    new_matching = JobMatching(
        user_id=current_user["user_id"],
        resume_id=resume_id,
        job_title=job_title_result,
        match_percentage=match_percentage,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        skill_gaps=skill_gaps,
        recommendations=recommendations
    )

    db.add(new_matching)

    db.commit()

    db.refresh(new_matching)

    # -----------------------------------------------------
    # 7. Return Result
    # -----------------------------------------------------

    return new_matching