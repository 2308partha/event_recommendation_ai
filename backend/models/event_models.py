from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime
from models.location_models import LocationModel

class EventCreateModel(BaseModel):
    """What the React frontend sends when creating an event"""
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    tags: List[str] = []
    category: str
    club: Optional[str] = None
    # 🕒 Timeline Additions
    start_date: datetime
    end_date: datetime
    registration_deadline: datetime
    
    # 👥 Rules Additions
    is_team_event: bool = False
    max_team_size: int = Field(default=1, ge=1)
    
    # Logistics
    location_name: str
    mode: str = "offline"
    intercollege: bool = True
    banner_url: Optional[HttpUrl] = None

class EventModel(EventCreateModel):
    """What is actually saved in MongoDB"""
    # 🔒 Tracking Additions
    created_by: str # The Admin's Clerk ID
    created_at: datetime
    
    # System Metrics
    coordinates: Optional[LocationModel] = None
    registration_open: bool = True
    registration_count: int = 0
    attendance_count: int = 0
    trending_score: float = 0.0