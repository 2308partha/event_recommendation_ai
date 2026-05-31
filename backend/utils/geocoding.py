import math
import urllib.request
import urllib.parse
import json
import asyncio

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in km
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

async def get_coordinates(location_name: str):
    """
    Fetch latitude and longitude for a given location name using Nominatim API.
    Returns (longitude, latitude) to match GeoJSON format.
    """
    if not location_name:
        return None
        
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(location_name)}&format=json&limit=1"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'College-Event-Manager-AI-App'}
    )
    
    try:
        def fetch():
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    return json.loads(response.read().decode('utf-8'))
            return []
            
        data = await asyncio.to_thread(fetch)
        
        if data and len(data) > 0:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return [lon, lat]
    except Exception as e:
        print(f"Geocoding error for {location_name}: {e}")
        
    return None

async def calculate_distance_score(user_coords, event_coords, user_loc_name=None, event_loc_name=None):
    """
    Calculate distance score based on coordinates or location names.
    Returns a score between 0.0 and 1.0.
    """
    if not user_coords and user_loc_name:
        user_coords = await get_coordinates(user_loc_name)
        
    if not event_coords and event_loc_name:
        event_coords = await get_coordinates(event_loc_name)
        
    if not user_coords or not event_coords:
        return 0.5 # Default score if distance can't be computed
        
    dist_km = haversine(user_coords[0], user_coords[1], event_coords[0], event_coords[1])
    
    # Example decay formula: score drops as distance increases. Max distance ~500km gets near 0.
    # 0km -> 1.0, 50km -> ~0.8, 100km -> ~0.6, 500km -> ~0.1
    score = math.exp(-dist_km / 200.0)
    return max(0.0, min(1.0, score))
