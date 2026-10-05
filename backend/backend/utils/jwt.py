from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = "AI-MOCK-INTERVIEW-SECRET-2026"
ALGORITHM = "HS256"

# Login token will remain valid for 24 hours
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode["exp"] = expire

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token