from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BountyCreateModel(BaseModel):
    """What the React frontend sends when creating a bounty"""
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    reward: str = Field(..., min_length=1) # e.g. "150", "Junior Organiser Badge"
    category: str = "Technical Task" # e.g. "Amenity", "Technical", "Logistics"
    event_id: Optional[str] = None # Optional link to a specific event
    
class BountyModel(BountyCreateModel):
    """What is actually saved in MongoDB"""
    organiser_id: str # The Admin's or User's Clerk ID
    organiser_name: str
    organiser_type: str = "community"
    status: str = "open" # open, in_progress, completed
    assigned_to: Optional[str] = None # Student's User ID
    applicants: list[str] = [] # List of Clerk IDs of applicants
    created_at: datetime = Field(default_factory=datetime.utcnow)
