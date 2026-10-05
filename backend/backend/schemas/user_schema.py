from pydantic import BaseModel, EmailStr


# =========================
# REGISTER SCHEMA
# =========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# =========================
# LOGIN SCHEMA
# =========================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================
# RESPONSE SCHEMA
# =========================

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# =========================
# PROFILE RESPONSE SCHEMA
# =========================

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# =========================
# PROFILE UPDATE SCHEMA
# =========================

class UserProfileUpdate(BaseModel):
    name: str
    email: EmailStr

# =========================
# CHANGE PASSWORD SCHEMA
# =========================

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str    