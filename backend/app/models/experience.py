from pydantic import BaseModel
from typing import Optional, List

class InterviewRound(BaseModel):
    round_number: int
    round_type: str
    duration_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    narrative: str
    cleared: bool = True
    questions_asked: List[str] = []

class PrepResource(BaseModel):
    resource_type: str
    name_or_url: str

class ExperienceCreate(BaseModel):
    company_name: str
    role: str
    role_custom: Optional[str] = None
    employment_type: str = "Full-time"
    experience_level: str = "Fresher"
    location: str = ""
    country: str = "India"
    application_source: str
    application_source_custom: Optional[str] = None
    referrer_designation: Optional[str] = None
    rounds: List[InterviewRound]
    outcome: str
    package_range: Optional[str] = None
    bond_details: Optional[str] = None
    joining_timeline: Optional[str] = None
    prep_resources: List[PrepResource] = []
    tips_and_advice: Optional[str] = None
    is_public: bool = True
    allow_questions: bool = True
