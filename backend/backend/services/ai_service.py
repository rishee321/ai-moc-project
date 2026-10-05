
import os
import json
import time
import re
from typing import List, Dict, Any

import requests
from dotenv import load_dotenv


# =========================================================
# ENV
# =========================================================

load_dotenv()


# =========================================================
# OPENROUTER CONFIG
# =========================================================

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_NAME = "google/gemma-4-31b-it:free"

# Optional OpenRouter headers
APP_NAME = os.getenv("OPENROUTER_APP_NAME", "Interview+")

APP_URL = os.getenv(
    "OPENROUTER_APP_URL",
    "http://localhost:5173"
)


# =========================================================
# LOAD API KEYS
# =========================================================

def load_api_keys() -> List[str]:
    """
    Load OpenRouter API keys from .env.

    Supported:

    GEMINI_API_KEY_1
    GEMINI_API_KEY_2
    GEMINI_API_KEY_3
    ...

    Also supports:

    OPENROUTER_API_KEY_1
    OPENROUTER_API_KEY_2
    OPENROUTER_API_KEY_3
    ...

    And old single-key formats:

    GEMINI_API_KEY
    OPENROUTER_API_KEY
    """

    keys = []

    # -----------------------------------------------------
    # Numbered GEMINI_API_KEY_1, GEMINI_API_KEY_2...
    # -----------------------------------------------------

    index = 1

    while True:
        key = os.getenv(f"GEMINI_API_KEY_{index}")

        if not key:
            break

        key = key.strip()

        if key and key not in keys:
            keys.append(key)

        index += 1

    # -----------------------------------------------------
    # Numbered OPENROUTER_API_KEY_1...
    # -----------------------------------------------------

    index = 1

    while True:
        key = os.getenv(f"OPENROUTER_API_KEY_{index}")

        if not key:
            break

        key = key.strip()

        if key and key not in keys:
            keys.append(key)

        index += 1

    # -----------------------------------------------------
    # Old single GEMINI_API_KEY
    # -----------------------------------------------------

    old_gemini_key = os.getenv("GEMINI_API_KEY")

    if old_gemini_key:
        old_gemini_key = old_gemini_key.strip()

        if old_gemini_key and old_gemini_key not in keys:
            keys.append(old_gemini_key)

    # -----------------------------------------------------
    # Single OPENROUTER_API_KEY
    # -----------------------------------------------------

    old_openrouter_key = os.getenv("OPENROUTER_API_KEY")

    if old_openrouter_key:
        old_openrouter_key = old_openrouter_key.strip()

        if old_openrouter_key and old_openrouter_key not in keys:
            keys.append(old_openrouter_key)

    return keys


API_KEYS = load_api_keys()


if not API_KEYS:
    raise RuntimeError(
        "No OpenRouter API keys configured. "
        "Add GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc. "
        "or OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc. "
        "to your .env file."
    )


# =========================================================
# KEY ROTATION STATE
# =========================================================

current_key_index = 0

# Example:
#
# {
#     0: 1760000000,
#     1: 1760000000
# }
#
key_cooldowns: Dict[int, float] = {}


# =========================================================
# AVAILABLE KEYS
# =========================================================

def get_available_key_indices() -> List[int]:
    """
    Return keys that are currently not in cooldown.
    """

    now = time.time()

    available = []

    for index in range(len(API_KEYS)):

        cooldown_until = key_cooldowns.get(index, 0)

        if now >= cooldown_until:
            available.append(index)

    return available


# =========================================================
# MARK KEY TEMPORARILY UNAVAILABLE
# =========================================================

def mark_key_quota_exhausted(
    index: int,
    cooldown_seconds: int = 60
):
    """
    Temporarily disable a key after rate-limit/quota error.
    """

    key_cooldowns[index] = (
        time.time() + cooldown_seconds
    )

    print(
        f"[OpenRouter] Key #{index + 1} temporarily "
        f"disabled for {cooldown_seconds} seconds."
    )


# =========================================================
# NEXT KEY
# =========================================================

def get_next_key_index() -> int:
    """
    Select next available key using round-robin rotation.
    """

    global current_key_index

    available = get_available_key_indices()

    if not available:

        if not key_cooldowns:
            return 0

        oldest_index = min(
            key_cooldowns,
            key=key_cooldowns.get
        )

        current_key_index = oldest_index

        return oldest_index

    for offset in range(len(API_KEYS)):

        index = (
            current_key_index + offset
        ) % len(API_KEYS)

        if index in available:

            current_key_index = index

            return index

    return available[0]


# =========================================================
# ERROR HELPERS
# =========================================================

def is_rate_limit_error(error: Exception) -> bool:
    """
    Detect OpenRouter 429 / quota / rate-limit errors.
    """

    error_text = str(error).lower()

    return (
        "429" in error_text
        or "rate limit" in error_text
        or "rate_limit" in error_text
        or "too many requests" in error_text
        or "quota" in error_text
        or "credits" in error_text
    )


def is_temporary_error(error: Exception) -> bool:
    """
    Detect temporary server errors such as 502/503/504.
    """

    error_text = str(error).lower()

    return (
        "502" in error_text
        or "503" in error_text
        or "504" in error_text
        or "service unavailable" in error_text
        or "temporarily unavailable" in error_text
        or "high demand" in error_text
    )


def extract_retry_seconds(
    error: Exception
) -> int:
    """
    Try to extract retry seconds from an error.
    """

    error_text = str(error)

    patterns = [
        r"retry.*?(\d+(?:\.\d+)?)\s*s",
        r"retry_after.*?(\d+(?:\.\d+)?)",
        r"retry.*?(\d+(?:\.\d+)?)\s*seconds",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            error_text,
            re.IGNORECASE
        )

        if match:

            try:
                return int(
                    float(match.group(1))
                )
            except Exception:
                pass

    return 60


# =========================================================
# SINGLE OPENROUTER REQUEST
# =========================================================

def generate_with_key(
    prompt: str,
    key_index: int
) -> str:
    """
    Make one OpenRouter request using one API key.
    """

    key = API_KEYS[key_index]

    print(
        f"[OpenRouter] Using API key "
        f"#{key_index + 1} "
        f"with model {MODEL_NAME}"
    )

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": APP_NAME,
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=120
    )

    # -----------------------------------------------------
    # HTTP ERROR
    # -----------------------------------------------------

    if response.status_code != 200:

        try:
            error_data = response.json()

        except Exception:
            error_data = response.text

        raise RuntimeError(
            f"OpenRouter HTTP {response.status_code}: "
            f"{error_data}"
        )

    # -----------------------------------------------------
    # RESPONSE JSON
    # -----------------------------------------------------

    try:
        data = response.json()

    except Exception as error:

        raise RuntimeError(
            f"OpenRouter returned invalid JSON: {error}"
        )

    # -----------------------------------------------------
    # CHOICES
    # -----------------------------------------------------

    choices = data.get("choices")

    if not choices:

        raise RuntimeError(
            "OpenRouter returned no choices."
        )

    # -----------------------------------------------------
    # MESSAGE
    # -----------------------------------------------------

    message = choices[0].get("message", {})

    text = message.get("content")

    if not text:

        raise RuntimeError(
            "OpenRouter returned no text response."
        )

    return str(text).strip()


# =========================================================
# MAIN SAFE OPENROUTER FUNCTION
# =========================================================

def safe_generate_content(
    prompt: str,
    max_attempts_per_key: int = 1
) -> str:
    """
    Generate content using multiple OpenRouter API keys.

    Example:

    Key 1
       ↓
    rate limit
       ↓
    Key 2
       ↓
    success

    No fake fallback response is returned.
    """

    if not API_KEYS:

        raise RuntimeError(
            "No OpenRouter API keys available."
        )

    attempted_keys = set()

    # -----------------------------------------------------
    # Try every key once
    # -----------------------------------------------------

    for _ in range(len(API_KEYS)):

        key_index = get_next_key_index()

        # Prevent accidental infinite rotation
        if key_index in attempted_keys:

            remaining = [
                i
                for i in get_available_key_indices()
                if i not in attempted_keys
            ]

            if not remaining:
                break

            key_index = remaining[0]

        attempted_keys.add(key_index)

        # -------------------------------------------------
        # Attempts per key
        # -------------------------------------------------

        for attempt in range(
            max_attempts_per_key
        ):

            try:

                result = generate_with_key(
                    prompt,
                    key_index
                )

                print(
                    f"[OpenRouter] Success using "
                    f"API key #{key_index + 1}"
                )

                # Move round-robin pointer forward

                global current_key_index

                current_key_index = (
                    key_index + 1
                ) % len(API_KEYS)

                return result

            except Exception as error:

                print(
                    f"[OpenRouter] Error with key "
                    f"#{key_index + 1}: {error}"
                )

                # -----------------------------------------
                # RATE LIMIT / QUOTA
                # -----------------------------------------

                if is_rate_limit_error(error):

                    retry_seconds = (
                        extract_retry_seconds(error)
                    )

                    cooldown = min(
                        max(
                            retry_seconds,
                            30
                        ),
                        300
                    )

                    mark_key_quota_exhausted(
                        key_index,
                        cooldown
                    )

                    break

                # -----------------------------------------
                # TEMPORARY SERVER ERROR
                # -----------------------------------------

                if is_temporary_error(error):

                    mark_key_quota_exhausted(
                        key_index,
                        30
                    )

                    break

                # -----------------------------------------
                # OTHER ERROR
                # -----------------------------------------

                if (
                    attempt
                    < max_attempts_per_key - 1
                ):

                    sleep_time = (
                        2 ** attempt
                    )

                    print(
                        f"[OpenRouter] Retrying "
                        f"key #{key_index + 1} "
                        f"in {sleep_time}s..."
                    )

                    time.sleep(sleep_time)

                else:

                    break

    # =====================================================
    # ALL KEYS FAILED
    # =====================================================

    available = (
        get_available_key_indices()
    )

    if not available:

        raise RuntimeError(
            "All configured OpenRouter API keys "
            "are currently rate-limited, "
            "quota-exhausted, or temporarily unavailable."
        )

    raise RuntimeError(
        "OpenRouter AI is temporarily unavailable "
        "after trying all configured API keys."
    )


# =========================================================
# JSON CLEANER
# =========================================================

def clean_json_response(
    text: str
) -> str:
    """
    Remove markdown code fences if the model returns:

    ```json
    [...]
    ```
    """

    text = text.strip()

    # Remove opening JSON fence

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    # Remove generic opening fence

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    # Remove closing fence

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    return text.strip()


# =========================================================
# INTERVIEW QUESTIONS
# =========================================================

def generate_interview_questions(
    domain: str,
    interview_type: str,
    difficulty: str,
    number_of_questions: int = 10
) -> List[Dict[str, Any]]:

    prompt = f"""
You are an AI technical interviewer.

Generate exactly {number_of_questions} interview questions.

Interview details:

Domain: {domain}

Interview Type: {interview_type}

Difficulty: {difficulty}

Requirements:

1. Generate exactly {number_of_questions} questions.
2. Questions must be relevant to the selected domain.
3. Questions must match the selected interview type.
4. Questions must match the selected difficulty.
5. Do not generate duplicate questions.
6. Do not include answers.
7. Do not include explanations.
8. Return ONLY valid JSON.

Required JSON format:

[
  {{
    "question_text": "Question here",
    "category": "Technical"
  }}
]
"""

    response = safe_generate_content(prompt)

    response = clean_json_response(
        response
    )

    try:

        data = json.loads(response)

    except json.JSONDecodeError as error:

        raise RuntimeError(
            f"OpenRouter returned invalid "
            f"question JSON: {error}"
        )

    if not isinstance(data, list):

        raise RuntimeError(
            "Question response is not a list."
        )

    if len(data) != number_of_questions:

        raise RuntimeError(
            f"OpenRouter generated "
            f"{len(data)} questions instead of "
            f"{number_of_questions}."
        )

    validated_questions = []

    for item in data:

        if not isinstance(item, dict):

            raise RuntimeError(
                "Invalid question object returned."
            )

        question_text = item.get(
            "question_text"
        )

        category = item.get(
            "category",
            "Technical"
        )

        if not question_text:

            raise RuntimeError(
                "Question without question_text."
            )

        validated_questions.append(
            {
                "question_text": str(
                    question_text
                ).strip(),

                "category": str(
                    category
                ).strip()
            }
        )

    return validated_questions


# =========================================================
# ANSWER EVALUATION
# =========================================================

def evaluate_answer(
    question: str,
    answer: str
) -> Dict[str, Any]:

    prompt = f"""
You are an AI interview evaluator.

Evaluate the candidate's answer.

Question:

{question}

Candidate Answer:

{answer}

Evaluate based on:

- Correctness
- Technical knowledge
- Relevance
- Clarity
- Completeness

Return ONLY valid JSON.

Required format:

{{
  "score": 0,
  "feedback": "Detailed feedback",
  "strengths": "Main strengths",
  "weaknesses": "Main weaknesses",
  "suggestions": "How to improve"
}}

Score must be an integer from 0 to 10.
"""

    response = safe_generate_content(
        prompt
    )

    response = clean_json_response(
        response
    )

    try:

        data = json.loads(response)

    except json.JSONDecodeError as error:

        raise RuntimeError(
            f"Invalid evaluation JSON: {error}"
        )

    try:

        score = int(
            data.get("score", 0)
        )

    except Exception:

        raise RuntimeError(
            "Invalid score returned."
        )

    score = max(
        0,
        min(10, score)
    )

    return {
        "score": score,

        "feedback": str(
            data.get(
                "feedback",
                ""
            )
        ).strip(),

        "strengths": str(
            data.get(
                "strengths",
                ""
            )
        ).strip(),

        "weaknesses": str(
            data.get(
                "weaknesses",
                ""
            )
        ).strip(),

        "suggestions": str(
            data.get(
                "suggestions",
                ""
            )
        ).strip()
    }


# =========================================================
# FINAL INTERVIEW ANALYSIS
# =========================================================

def analyze_interview(
    answers_text: str
) -> Dict[str, Any]:

    prompt = f"""
You are an AI interview performance analyst.

Analyze the complete interview.

Candidate answers:

{answers_text}

Evaluate:

1. Overall performance
2. Technical knowledge
3. Communication
4. Problem solving
5. Strengths
6. Weaknesses
7. Improvement suggestions
8. Final recommendation

Return ONLY valid JSON.

Required format:

{{
  "overall_score": 0,
  "technical_score": 0,
  "communication_score": 0,
  "problem_solving_score": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "overall_feedback": "Detailed final analysis"
}}

All scores must be integers from 0 to 10.
"""

    response = safe_generate_content(
        prompt
    )

    response = clean_json_response(
        response
    )

    try:

        data = json.loads(response)

    except json.JSONDecodeError as error:

        raise RuntimeError(
            f"Invalid analysis JSON: {error}"
        )

    def normalize_score(value):

        try:

            value = int(value)

        except Exception:

            value = 0

        return max(
            0,
            min(10, value)
        )

    return {
        "overall_score":
            normalize_score(
                data.get(
                    "overall_score",
                    0
                )
            ),

        "technical_score":
            normalize_score(
                data.get(
                    "technical_score",
                    0
                )
            ),

        "communication_score":
            normalize_score(
                data.get(
                    "communication_score",
                    0
                )
            ),

        "problem_solving_score":
            normalize_score(
                data.get(
                    "problem_solving_score",
                    0
                )
            ),

        "strengths":
            data.get(
                "strengths",
                []
            ),

        "weaknesses":
            data.get(
                "weaknesses",
                []
            ),

        "suggestions":
            data.get(
                "suggestions",
                []
            ),

        "overall_feedback":
            str(
                data.get(
                    "overall_feedback",
                    ""
                )
            ).strip()
    }


# =========================================================
# ADAPTIVE DIFFICULTY
# =========================================================

def get_adaptive_difficulty(
    score: float
) -> str:

    if score < 4:
        return "Easy"

    if score < 7:
        return "Medium"

    return "Hard"


# =========================================================
# FOLLOW-UP QUESTION
# =========================================================

def generate_follow_up_question(
    question: str,
    answer: str,
    score: float,
    domain: str
) -> str:

    prompt = f"""
You are an AI interviewer conducting
a personalized interview.

Domain:

{domain}

Previous Question:

{question}

Candidate Answer:

{answer}

Previous Score:

{score}/10

Generate ONE personalized follow-up
interview question.

The follow-up should:

- Be directly related to the candidate's previous answer.
- Test deeper understanding.
- Match the candidate's performance.
- Be relevant to the domain.
- Not repeat the previous question.

Return ONLY the question text.
"""

    response = safe_generate_content(
        prompt
    )

    return response.strip()


# =========================================================
# RESUME-BASED QUESTIONS
# =========================================================

def generate_resume_questions(
    resume_text: str,
    number_of_questions: int = 10
) -> List[str]:

    prompt = f"""
You are an AI interviewer.

Analyze the following resume and generate exactly
{number_of_questions} interview questions based on it.

Resume:

{resume_text}

Requirements:

1. Questions must be based on information in the resume.
2. Include technical and project-related questions where possible.
3. Do not invent resume information.
4. Do not provide answers.
5. Return ONLY valid JSON.

Required format:

[
  "Question 1",
  "Question 2"
]
"""

    response = safe_generate_content(
        prompt
    )

    response = clean_json_response(
        response
    )

    try:

        data = json.loads(response)

    except json.JSONDecodeError as error:

        raise RuntimeError(
            f"Invalid resume question JSON: {error}"
        )

    if not isinstance(data, list):

        raise RuntimeError(
            "Resume question response "
            "is not a list."
        )

    if len(data) != number_of_questions:

        raise RuntimeError(
            f"OpenRouter generated "
            f"{len(data)} resume questions "
            f"instead of {number_of_questions}."
        )

    return [
        str(question).strip()
        for question in data
    ]


# =========================================================
# CODE REVIEW
# =========================================================

def review_code(
    code: str,
    language: str,
    problem: str
) -> Dict[str, Any]:

    prompt = f"""
You are an AI coding interviewer.

Programming Language:

{language}

Problem:

{problem}

Candidate Code:

{code}

Review the code for:

- Correctness
- Logic
- Time complexity
- Space complexity
- Code quality
- Potential bugs
- Improvements

Return ONLY valid JSON.

Required format:

{{
  "score": 0,
  "feedback": "Detailed feedback",
  "bugs": [],
  "improvements": [],
  "time_complexity": "",
  "space_complexity": ""
}}

Score must be an integer from 0 to 10.
"""

    response = safe_generate_content(
        prompt
    )

    response = clean_json_response(
        response
    )

    try:

        data = json.loads(response)

    except json.JSONDecodeError as error:

        raise RuntimeError(
            f"Invalid code review JSON: {error}"
        )

    try:

        score = int(
            data.get("score", 0)
        )

    except Exception:

        score = 0

    score = max(
        0,
        min(10, score)
    )

    return {
        "score": score,

        "feedback": str(
            data.get(
                "feedback",
                ""
            )
        ).strip(),

        "bugs": data.get(
            "bugs",
            []
        ),

        "improvements": data.get(
            "improvements",
            []
        ),

        "time_complexity": str(
            data.get(
                "time_complexity",
                ""
            )
        ).strip(),

        "space_complexity": str(
            data.get(
                "space_complexity",
                ""
            )
        ).strip()
    }
