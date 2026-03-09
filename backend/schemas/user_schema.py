from pydantic import BaseModel, EmailStr
<<<<<<< HEAD
from typing import Optional, List

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str # 'volunteer' or 'ngo'
    skills: Optional[List[str]] = []
    location: Optional[str] = None
    bio: Optional[str] = None
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    website_url: Optional[str] = None
=======
from typing import Optional


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str

>>>>>>> origin/main

class UserLogin(BaseModel):
    email: EmailStr
    password: str

<<<<<<< HEAD
class UserResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    role: str
    skills: Optional[List[str]] = []
    location: Optional[str] = None
    bio: Optional[str] = None
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    website_url: Optional[str] = None
    message: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    website_url: Optional[str] = None
=======

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    role: str
    message: Optional[str]
>>>>>>> origin/main
