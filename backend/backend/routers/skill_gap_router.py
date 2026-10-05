from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db

from models.interview_model import Interview
from models.answer_model import Answer
from models.question_model import Question
from models.resume_model import Resume
from models.skill_gap_model import SkillGapAnalysis

from schemas.skill_gap_schema import SkillGapResponse

from services.skill_gap_service import analyze_skill_gap

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/skill-gap",
    tags=["Skill Gap Analysis"]
)


@router.post(
    "/analyze/{interview_id}",
    response_model=SkillGapResponse
)
def create_skill_gap_analysis(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # 1. Check interview ownership
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user["user_id"]
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    # 2. Interview should be completed
    if interview.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Complete the interview before skill gap analysis"
        )

    # 3. Get user's latest resume
    resume = db.query(Resume).filter(
        Resume.user_id == current_user["user_id"]
    ).order_by(
        Resume.id.desc()
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found. Upload a resume first."
        )

    # 4. Get interview questions
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found for this interview"
        )

    # 5. Collect interview answers
    interview_answers = []

    for question in questions:

        answer = db.query(Answer).filter(
            Answer.question_id == question.id
        ).order_by(
            Answer.id.desc()
        ).first()

        if answer:
            interview_answers.append(
                f"""
Question:
{question.question_text}

Category:
{question.category}

Difficulty:
{question.difficulty}

Answer:
{answer.answer_text}

Score:
{answer.score}/10
"""
            )

    if not interview_answers:
        raise HTTPException(
            status_code=400,
            detail="No answers found for this interview"
        )

    answers_text = "\n".join(interview_answers)

    # 6. Resume skills
    resume_skills = resume.skills or "No skills extracted"

    # 7. Send data to Gemini
    ai_result = analyze_skill_gap(
        resume_skills=resume_skills,
        interview_answers=answers_text
    )

    # 8. Parse AI response
    strong_skills = ""
    moderate_skills = ""
    weak_skills = ""
    missing_skills = ""
    recommendations = ""

    current_section = None

    for line in ai_result.splitlines():

        line = line.strip()

        if not line:
            continue

        lower_line = line.lower()

        if lower_line.startswith("strong skills:"):
            current_section = "strong"
            strong_skills = line.split(":", 1)[1].strip()

        elif lower_line.startswith("moderate skills:"):
            current_section = "moderate"
            moderate_skills = line.split(":", 1)[1].strip()

        elif lower_line.startswith("weak skills:"):
            current_section = "weak"
            weak_skills = line.split(":", 1)[1].strip()

        elif lower_line.startswith("missing skills:"):
            current_section = "missing"
            missing_skills = line.split(":", 1)[1].strip()

        elif lower_line.startswith("recommendations:"):
            current_section = "recommendations"
            recommendations = line.split(":", 1)[1].strip()

        else:

            if current_section == "strong":
                strong_skills += " " + line

            elif current_section == "moderate":
                moderate_skills += " " + line

            elif current_section == "weak":
                weak_skills += " " + line

            elif current_section == "missing":
                missing_skills += " " + line

            elif current_section == "recommendations":
                recommendations += " " + line

    # 9. Save analysis
    analysis = SkillGapAnalysis(
        user_id=current_user["user_id"],
        interview_id=interview_id,
        strong_skills=strong_skills,
        moderate_skills=moderate_skills,
        weak_skills=weak_skills,
        missing_skills=missing_skills,
        recommendations=recommendations
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis