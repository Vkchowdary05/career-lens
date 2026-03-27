from pydantic import BaseModel
from typing import Optional, List

class ResumeJobDetails(BaseModel):
    job_description: str
    role_category: str
    target_country: str
    target_city: Optional[str] = None
    target_company: Optional[str] = None

class EducationEntry(BaseModel):
    institution: str
    degree: str
    field: str
    cgpa_or_percentage: Optional[str] = None
    year_of_passing: Optional[int] = None

class WorkEntry(BaseModel):
    company: str
    role: str
    duration: str
    responsibilities: str

class ProjectEntry(BaseModel):
    name: str
    description: str
    tech_stack: List[str] = []
    url: Optional[str] = None

class ResumeProfile(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    education: List[EducationEntry] = []
    work_experience: List[WorkEntry] = []
    projects: List[ProjectEntry] = []
    skills: List[str] = []
    certifications: List[str] = []
    achievements: List[str] = []
    cv_extracted_text: Optional[str] = None

class SkillAnswer(BaseModel):
    skill: str
    answer: str

class ResumeGenerateRequest(BaseModel):
    job_details: ResumeJobDetails
    profile: ResumeProfile
    skill_answers: List[SkillAnswer] = []
