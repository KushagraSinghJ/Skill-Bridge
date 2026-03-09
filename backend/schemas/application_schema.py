from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class ApplicationBase(BaseModel):
    opportunity_id: str
    cover_letter: Optional[str] = None
    relevant_experience: Optional[str] = None
    availability: Optional[str] = None
    status: str = "pending" # pending, accepted, rejected

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected"]

class ApplicationResponse(ApplicationBase):
    id: str
    volunteer_id: str
    applied_at: datetime
    
    # Optional fields for denormalized data in dashboards
    opportunity_title: Optional[str] = None
    ngo_name: Optional[str] = None
    volunteer_name: Optional[str] = None
    volunteer_email: Optional[EmailStr] = None
    volunteer_location: Optional[str] = None
    volunteer_bio: Optional[str] = None
    volunteer_skills: Optional[list[str]] = None

    class Config:
        from_attributes = True
