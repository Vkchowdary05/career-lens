from pydantic import BaseModel
from typing import Optional, List

class PostCreate(BaseModel):
    content: str
    post_type: str = "general"
    tags: List[str] = []
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    package_range: Optional[str] = None
    apply_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None
