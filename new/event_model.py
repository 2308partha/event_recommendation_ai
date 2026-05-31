from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime
from models.location_model import LocationModel

class EventModel(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    category: str
    
    # Dates
    start_date: datetime
    end_date: datetime
    
    # Location
    location_name: str
    coordinates: Optional[LocationModel] = None
    
    # Filters & Modes
    mode: str = "offline" # offline, online, hybrid
    intercollege: bool = True
    registration_open: bool = True
    
    # Media
    banner_url: Optional[HttpUrl] = None
    
    # Internal metrics for recommendation
    registration_count: int = 0
    attendance_count: int = 0
    trending_score: float = 0.0

class EventCreateModel(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    category: str
    start_date: datetime
    end_date: datetime
    location_name: str
    mode: str = "offline"
    intercollege: bool = True
    banner_url: Optional[HttpUrl] = None
