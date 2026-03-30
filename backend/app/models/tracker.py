from pydantic import BaseModel
from typing import Optional
import datetime

class ApplicationCreate(BaseModel):
    company: str
    role: str
    employment_type: str = "Full-time"
    applied_date: Optional[datetime.datetime] = None
    source: str = "Direct"
    notes: Optional[str] = None
    priority: str = "Medium"
    resume_url: Optional[str] = None
    resume_public_id: Optional[str] = None
    reminder_date: Optional[datetime.datetime] = None
    job_description: Optional[str] = None

class StageUpdate(BaseModel):
    new_stage: str
    notes: Optional[str] = None
    date: Optional[datetime.datetime] = None
