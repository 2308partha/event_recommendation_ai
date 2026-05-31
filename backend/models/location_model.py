from pydantic import BaseModel
from typing import Optional


class LocationModel(BaseModel):

    latitude: float

    longitude: float

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    formatted_address: Optional[str] = None