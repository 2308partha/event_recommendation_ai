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
    college_name: str
    roll_number: str
    year_of_study: int = Field(..., ge=1, le=6)
    phone_number: str = Field(..., pattern=r"^[6-9]\d{9}$")
    official_email: EmailStr
    organization: str
    department: str
    club_name: str
    post: str
    club_note: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        college_name: str = Form(...),
        roll_number: str = Form(...),
        year_of_study: int = Form(...),
        phone_number: str = Form(...),
        official_email: str = Form(...),
        organization: str = Form(...),
        department: str = Form(...),
        club_name: str = Form(...),
        post: str = Form(...),
        club_note: str = Form(None)
    ):
        return cls(
            college_name=college_name,
            roll_number=roll_number,
            year_of_study=year_of_study,
            phone_number=phone_number,
            official_email=official_email,
            organization=organization,
            department=department,
            club_name=club_name,
            post=post,
            club_note=club_note
        )

# AI Verification Response Model
class AdminResponseModel(BaseModel):
    approved: bool
    reason: str
    role: Optional[str] = None