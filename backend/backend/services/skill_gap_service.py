from services.ai_service import safe_generate_content


def analyze_skill_gap(
    resume_skills: str,
    interview_answers: str
):
    prompt = f"""
You are an AI Skill Gap Analyzer for a mock interview system.

Analyze the candidate's skills and interview performance.

Candidate Resume Skills:
{resume_skills}

Interview Performance:
{interview_answers}

Compare the candidate's resume skills with their interview performance.

Return the result in EXACTLY this format:

Strong Skills:
<comma-separated skills>

Moderate Skills:
<comma-separated skills>

Weak Skills:
<comma-separated skills>

Missing Skills:
<comma-separated skills>

Recommendations:
<clear and practical improvement recommendations>

Rules:

1. Identify skills where the candidate performed well.
2. Identify skills where performance was average.
3. Identify weak technical or interview-related skills.
4. Identify important skills that appear missing or insufficient.
5. Give practical recommendations for improvement.
6. Base the analysis only on the provided information.
7. Keep the response concise and professional.
"""

    response = safe_generate_content(prompt)

    return response.strip()