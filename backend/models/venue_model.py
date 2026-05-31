from pydantic import BaseModel, Field
from typing import Optional, List
from fastapi import Form

# ========================
# VENUE PROVIDER MODELS
# ========================

class VenueProviderRequestModel(BaseModel):
    institution_name: str
    address: str
    contact_email: str
    contact_phone: str
    # Advanced Phase 2 Fields
    capacity: Optional[int] = None
    amenities: Optional[str] = None # e.g. "WiFi, AC, Projector, Stage"
    gst_details: Optional[str] = None
    gps_location: Optional[str] = None # Optional lat/lng or maps link
    
    @classmethod
    def as_form(
        cls,
        institution_name: str = Form(...),
        address: str = Form(...),
        contact_email: str = Form(...),
        contact_phone: str = Form(...),
        capacity: Optional[int] = Form(None),
        amenities: Optional[str] = Form(None),
        gst_details: Optional[str] = Form(None),
        gps_location: Optional[str] = Form(None)
    ):
        return cls(
            institution_name=institution_name,
            address=address,
            contact_email=contact_email,
            contact_phone=contact_phone,
            capacity=capacity,
            amenities=amenities,
            gst_details=gst_details,
            gps_location=gps_location
        )

# ========================
# VENUE REQUEST MODELS (Marketplace)
# ========================

class VenueRequestCreateModel(BaseModel):
    event_title: str
    expected_date: str
    expected_capacity: int
    requirements: Optional[str] = None
    target_budget: Optional[float] = None # New field
    city: Optional[str] = None # New field
    # No status or provider fields here, they are set by the backend
