from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

async def retrieve_surviving_candidates(
    db: AsyncIOMotorDatabase, 
    user_coords: List[float], 
    max_distance_meters: float = 50000.0,  # 50km radius boundary check
    is_intra: bool = False,
    user_college: str = ""
) -> List[dict]:
    """
    Phase 1: Database-level pruning layer.
    Instantly drops past, closed, or geographically out-of-bounds events.
    If is_intra is True, filters strictly by same host_college.
    """
    current_time = datetime.utcnow()
    
    query = {
        "is_open": True,
        "registration_deadline": {"$gte": current_time}
    }
    
    if is_intra and user_college:
        # Intra-college: Match exact college, ignore geographic boundary constraint
        query["host_college"] = user_college
    else:
        # Inter-college: Enforce geographic boundary
        query["location_geo"] = {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": user_coords  # [longitude, latitude]
                },
                "$maxDistance": max_distance_meters
            }
        }
    
    cursor = db["events"].find(query)
    # Pull up to 50 local candidate events to process with downstream AI reasoning
    return await cursor.to_list(length=50)