from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional
from fastapi import Form

# Created after Clerk Signup/Login
class AdminCreateModel(BaseModel):
    clerk_user_id: str
    name: str
    email: EmailStr
    image_url: HttpUrl

# Admin Verification Request Model
class AdminRequestModel(BaseModel):
    organiser_type: str = Field(default="college") # 'college' or 'community'
    
    # Common fields
    phone_number: str = Field(..., pattern=r"^[6-9]\d{9}$")
    official_email: EmailStr
    organization: str # Can act as college name or company name depending on type
    
    # College Organiser Fields
    college_name: Optional[str] = None
    roll_number: Optional[str] = None
    year_of_study: Optional[int] = None
    department: Optional[str] = None
    club_name: Optional[str] = None
    post: Optional[str] = None
    club_note: Optional[str] = None
    
    # Community/Company Organiser Fields
    company_name: Optional[str] = None
    designation: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        organiser_type: str = Form("college"),
        phone_number: str = Form(...),
        official_email: str = Form(...),
        organization: str = Form(...),
        college_name: str = Form(None),
        roll_number: str = Form(None),
        year_of_study: int = Form(None),
        department: str = Form(None),
        club_name: str = Form(None),
        post: str = Form(None),
        club_note: str = Form(None),
        company_name: str = Form(None),
        designation: str = Form(None)
    ):
        return cls(
            organiser_type=organiser_type,
            phone_number=phone_number,
            official_email=official_email,
            organization=organization,
            college_name=college_name,
            roll_number=roll_number,
            year_of_study=year_of_study,
            department=department,
            club_name=club_name,
            post=post,
            club_note=club_note,
            company_name=company_name,
            designation=designation
        )

# AI Verification Response Model
class AdminResponseModel(BaseModel):
    approved: bool
    reason: str
    role: Optional[str] = None