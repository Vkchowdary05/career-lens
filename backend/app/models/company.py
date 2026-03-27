from pydantic import BaseModel
from typing import Optional

class CompanyCustomEntry(BaseModel):
    name: str
