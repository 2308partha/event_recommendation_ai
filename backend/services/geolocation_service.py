import httpx
from typing import Optional, Tuple
import urllib.parse

class GeolocationService:
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    USER_AGENT = "EventRecommendationAI/1.0 (dev@example.com)"

    @staticmethod
    async def get_coordinates(location_name: str) -> Optional[Tuple[float, float, str]]:
        """
        Convert a location name into latitude, longitude, and formatted address.
        Uses OpenStreetMap Nominatim API.
        Returns: (latitude, longitude, formatted_address) or None if not found.
        """
        if not location_name:
            return None

        # Add headers as required by Nominatim's Usage Policy
        headers = {
            "User-Agent": GeolocationService.USER_AGENT
        }
        
        params = {
            "q": location_name,
            "format": "json",
            "limit": 1
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    GeolocationService.NOMINATIM_URL, 
                    params=params, 
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        result = data[0]
                        lat = float(result.get("lat"))
                        lon = float(result.get("lon"))
                        display_name = result.get("display_name", location_name)
                        return (lat, lon, display_name)
        except Exception as e:
            print(f"Geolocation error: {e}")
            
        return None
