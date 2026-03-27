from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    firebase_uid: str
    email: EmailStr
    full_name: str
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_provider: str = "email"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    open_to_opportunities: Optional[bool] = None
