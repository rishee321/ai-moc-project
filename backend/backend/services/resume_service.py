import time

from services.ai_service import safe_generate_content


# ==========================================
# Extract Text From PDF
# ==========================================

def extract_text_from_pdf(file_path: str) -> str:

    from dotenv import load_dotenv
    from google import genai

    load_dotenv()

    # Get one configured Gemini key only for file upload.
    # The actual AI text generation uses safe_generate_content().
    import os

    api_key = os.getenv("GEMINI_API_KEY_1")

    if not api_key:
        raise RuntimeError(
            "No Gemini API key is configured."
        )

    client = genai.Client(
        api_key=api_key
    )

    uploaded_file = client.files.upload(
        file=file_path
    )

    prompt = """
Read this resume PDF carefully.

Extract all readable text from the resume.

Include:

- Name
- Email
- Phone
- Career objective
- Education
- Technical skills
- Projects
- Experience
- Certifications
- Training
- Achievements
- Languages
- Any other relevant information

Return only the extracted resume text.
Do not explain anything.
"""

    # Gemini file upload itself requires a client.
    # Generation is handled through the multi-key AI service.
    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[
                uploaded_file,
                prompt
            ]
        )

        if not response or not response.text:
            raise RuntimeError(
                "Gemini returned empty resume text."
            )

        extracted_text = response.text.strip()

        print("================================")
        print("EXTRACTED RESUME TEXT")
        print("================================")
        print(extracted_text)

        return extracted_text

    except Exception as e:

        print(
            f"Resume PDF extraction error: {e}"
        )

        raise RuntimeError(
            "AI resume text extraction failed."
        )


# ==========================================
# Basic Skill Extraction
# ==========================================

def basic_skill_extraction(
    resume_text: str
) -> str:

    known_skills = [
        "Python",
        "C",
        "C++",
        "Java",
        "JavaScript",
        "HTML",
        "CSS",
        "React",
        "Django",
        "FastAPI",
        "Flask",
        "SQL",
        "MySQL",
        "SQLite",
        "PostgreSQL",
        "MongoDB",
        "Git",
        "GitHub",
        "REST API",
        "API",
        "Machine Learning",
        "Artificial Intelligence",
        "Data Analytics",
        "NumPy",
        "Pandas",
        "Matplotlib",
        "TensorFlow",
        "IoT",
        "AWS",
        "Docker"
    ]

    text_lower = resume_text.lower()

    found_skills = []

    for skill in known_skills:

        if skill.lower() in text_lower:
            found_skills.append(skill)

    return ", ".join(found_skills)


# ==========================================
# Extract Skills Using Gemini
# ==========================================

def extract_skills_from_resume(
    resume_text: str
) -> str:

    prompt = f"""
You are an AI resume analyzer.

Analyze the following resume.

Extract the candidate's technical skills.

Resume:

{resume_text}

Return ONLY a comma-separated list of technical skills.

Example:

Python, Django, FastAPI, SQL, HTML, CSS, JavaScript, Git
"""

    try:

        print(
            "Gemini AI skill extraction started..."
        )

        skills = safe_generate_content(
            prompt
        )

        skills = skills.strip()

        if skills:

            print("================================")
            print("AI EXTRACTED SKILLS")
            print("================================")
            print(skills)

            return skills

        raise RuntimeError(
            "Gemini returned empty skills."
        )

    except Exception as e:

        print(
            f"Gemini skill extraction error: {e}"
        )

        # IMPORTANT:
        # We are not using fake AI scores.
        # This fallback only performs local skill detection
        # if Gemini is unavailable.

        print("================================")
        print("USING BASIC SKILL EXTRACTION")
        print("================================")

        fallback_skills = basic_skill_extraction(
            resume_text
        )

        if fallback_skills:

            print(
                "Detected Skills:",
                fallback_skills
            )

            return fallback_skills

        return "Skills could not be automatically detected"