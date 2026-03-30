from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ──────────────── User Schemas ────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserAdminCreate(BaseModel):
    username: str
    email: str
    password: str
    is_admin: bool = False


class UserAdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ──────────────── Photo Schemas ────────────────

class PhotoCreate(BaseModel):
    title: str
    description: Optional[str] = ""


class PhotoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class PhotoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: str
    uploaded_at: datetime
    user_id: int
    owner_username: Optional[str] = None

    class Config:
        from_attributes = True
