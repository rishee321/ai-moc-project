from services.ai_service import safe_generate_content


def generate_improvement_plan(
    strong_skills: str,
    moderate_skills: str,
    weak_skills: str,
    missing_skills: str,
    duration_days: int = 7
):
    prompt = f"""
You are an AI career improvement coach.

Create a personalized interview improvement plan
for a candidate based on their Skill Gap Analysis.

Strong Skills:
{strong_skills}

Moderate Skills:
{moderate_skills}

Weak Skills:
{weak_skills}

Missing Skills:
{missing_skills}

Plan Duration:
{duration_days} days

Return the result in EXACTLY this format:

Focus Areas:
<comma-separated important skills>

Day 1:
<tasks>

Day 2:
<tasks>

Day 3:
<tasks>

Continue until Day {duration_days}.

Final Recommendation:
<short overall recommendation>

Rules:

1. Focus mainly on weak and missing skills.
2. Use moderate skills for additional practice.
3. Do not spend much time on already strong skills.
4. Give practical tasks and interview practice.
5. Include revision and mock interview practice.
6. Make the plan realistic for a student/job seeker.
7. Keep each day's tasks clear and concise.
"""

    response = safe_generate_content(prompt)

    return response.strip()