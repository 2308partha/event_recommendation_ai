from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime

class ProviderServiceModel(BaseModel):
    service_name: str
    description: str
    starting_price: float

class ProviderModel(BaseModel):
    """
    Unified model representing any B2B/B2C service provider in the Event Ecosystem.
    """
    name: str = Field(..., description="Name of the vendor, speaker, or sponsor company")
    provider_type: str = Field(..., description="e.g., 'Venue', 'Vendor', 'Sponsor', 'Speaker', 'Community'")
    category: str = Field(..., description="e.g., 'Photography', 'EdTech', 'Auditorium'")
    
    # Contact & Location
    city: str
    contact_email: str
    contact_phone: Optional[str] = None
    
    # Brand/Portfolio
    description: str
    banner_url: Optional[str] = None
    services: List[ProviderServiceModel] = []
    
    # Trust & Verification
    is_verified: bool = False
    trust_score: float = Field(default=85.0, ge=0.0, le=100.0) # 0-100 score
    total_completed_bookings: int = 0
    average_rating: float = Field(default=5.0, ge=0.0, le=5.0)
    
    # Financial/Requirements limits
    min_budget: float = 0.0
    max_capacity: Optional[int] = None # Mainly for Venues
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
