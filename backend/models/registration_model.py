from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class Participant(BaseModel):
    """Details for a single person (solo or team member)"""
    name: str = Field(..., min_length=2)
    email: EmailStr
    
    # Optional fields to make the form easier to fill
    roll_number: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None

class RegistrationCreateModel(BaseModel):
    """What the React frontend sends when a student clicks 'Register'"""
    event_id: str
    
    # Team Info (Optional, only used if the event is a team event)
    team_name: Optional[str] = None
    
    # The list of people registering. 
    # If solo event, this list will just have 1 Participant.
    members: List[Participant] = Field(..., min_length=1)

class RegistrationModel(RegistrationCreateModel):
    """What is actually saved in MongoDB"""
    user_id: str # The Clerk ID of the person who clicked submit
    
    # Collaborative Sharing: Clerk IDs of all team members who have accounts
    linked_user_ids: List[str] = [] 
    
    registered_at: datetime
    
    # Status tracking for the Admin & User Dashboards
    status: str = "registered" # can be: registered, waitlisted, rejected, approved
    attended: bool = False # Admin flips this on the day of the event

class RegistrationUpdateModel(BaseModel):
    """Payload for Admins to update a student's status or attendance via PATCH"""
    status: Optional[str] = None
    attended: Optional[bool] = None