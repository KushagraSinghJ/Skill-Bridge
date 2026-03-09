from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OpportunityBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    duration: Optional[str] = None
    location: Optional[str] = None
    status: str = "open" # "open" or "closed"

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class OpportunityResponse(OpportunityBase):
    id: str
    ngo_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    ngo_name: Optional[str] = None
    organization_name: Optional[str] = None
