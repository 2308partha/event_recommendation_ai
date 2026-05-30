from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from datetime import date
from models.location_model import LocationModel

class UserCreateModel(BaseModel):
    clerk_user_id: str
    name: str
    email: EmailStr
    image_url: HttpUrl
    is_profile_completed: bool = False
    role: str = "student"

class UserUpdateModel(BaseModel):
    # Academic Details
    college_name: Optional[str] = None
    department: Optional[str] = None
    roll_no: Optional[str] = None
    pass_out_year: Optional[int] = None
    
    # Personal Details
    dob: Optional[date] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None

    # Social Links
    github_url: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None

    # Recommendation Features
    interests: List[str] = []
    skills: List[str] = []
    hobbies: List[str] = []
    preferred_categories: List[str] = []

    # Location
    location_name: Optional[str] = None
    current_location: Optional[LocationModel] = None
    
    intercollege_preference: Optional[bool] = True