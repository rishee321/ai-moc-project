import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session

from database.database import get_db

from models.resume_model import Resume
from models.interview_model import Interview
from models.question_model import Question

from schemas.resume_schema import ResumeResponse

from services.resume_service import (
    extract_text_from_pdf,
    extract_skills_from_resume
)

from services.ai_service import (
    generate_resume_questions
)

from utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


# ==========================================
# Upload Folder
# ==========================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================
# 1. Upload Resume
# ==========================================

@router.post(
    "/upload",
    response_model=ResumeResponse
)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # Check PDF
    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Create file path
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    # Save PDF
    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Extract resume text
    extracted_text = extract_text_from_pdf(
        file_path
    )

    if not extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )

    # Extract skills
    skills = extract_skills_from_resume(
        extracted_text
    )

    # Save resume
    resume = Resume(
        user_id=current_user["user_id"],
        filename=file.filename,
        extracted_text=extracted_text,
        skills=skills
    )

    db.add(resume)

    db.commit()

    db.refresh(resume)

    return resume


# ==========================================
# 2. Generate + Save Personalized Questions
# ==========================================

@router.post(
    "/generate-questions/{resume_id}"
)
def generate_questions_from_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # --------------------------------------
    # Find Resume
    # --------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user["user_id"]
        )
        .first()
    )

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    # --------------------------------------
    # Check Resume Text
    # --------------------------------------

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Resume text is not available"
        )

    # --------------------------------------
    # Generate Questions Using AI
    # --------------------------------------

    questions_text = generate_resume_questions(
        resume_text=resume.extracted_text,
        skills=resume.skills or "",
        number_of_questions=10
    )

    if not questions_text:

        raise HTTPException(
            status_code=500,
            detail="Could not generate questions"
        )

    # --------------------------------------
    # Create Interview
    # --------------------------------------

    interview = Interview(
        user_id=current_user["user_id"],
        interview_type="Resume Based",
        domain="Resume",
        difficulty="Mixed",
        total_questions=10
    )

    db.add(interview)

    db.commit()

    db.refresh(interview)

    # --------------------------------------
    # Convert AI Response to Questions
    # --------------------------------------

    lines = questions_text.splitlines()

    saved_questions = []

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # Remove numbering:
        # 1. Question
        # 2. Question
        # 3. Question

        if "." in line:

            first_part, remaining_part = line.split(
                ".",
                1
            )

            if first_part.strip().isdigit():

                line = remaining_part.strip()

        if not line:
            continue

        # Determine difficulty
        difficulty = "Medium"

        saved_question = Question(
            interview_id=interview.id,
            question_text=line,
            category="Resume Based",
            difficulty=difficulty
        )

        db.add(saved_question)

        db.flush()

        saved_questions.append({
            "id": saved_question.id,
            "question": saved_question.question_text,
            "category": saved_question.category,
            "difficulty": saved_question.difficulty
        })

    # --------------------------------------
    # Save All Questions
    # --------------------------------------

    db.commit()

    # --------------------------------------
    # Return Response
    # --------------------------------------

    return {
        "message": "Resume-based interview created successfully",
        "resume_id": resume.id,
        "interview_id": interview.id,
        "skills": resume.skills,
        "total_questions": len(saved_questions),
        "questions": saved_questions
    }