from services.ai_service import safe_generate_content


def analyze_job_match(
    resume_text: str,
    job_description: str
):

    prompt = f"""
You are an AI Job Matching and Career Analysis Assistant.

Compare the candidate's resume with the given job description.

Candidate Resume:
{resume_text}

Job Description:
{job_description}

Analyze how well the candidate matches the job.

Return the result in EXACTLY this format:

Job Title:
<job title>

Match Percentage:
<number between 0 and 100>

Matching Skills:
<comma-separated skills that match>

Missing Skills:
<comma-separated skills required by the job but missing from the resume>

Skill Gaps:
<short explanation of the main skill gaps>

Recommendations:
<clear and practical recommendations for improving the candidate's chances>

Rules:

1. Base the analysis only on the resume and job description.
2. Identify technical and relevant professional skills.
3. Do not invent skills that are not present in the resume.
4. Match percentage must be a number from 0 to 100.
5. Keep the analysis concise and professional.
6. Give practical recommendations.
"""

    response = safe_generate_content(prompt)

    return response.strip()