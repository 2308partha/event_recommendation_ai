from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from database.db import event_collection
from models.event_model import EventCreateModel
from services.geolocation_service import GeolocationService
from services.embedding_service import EmbeddingService

async def create_event_controller(
    event_data: EventCreateModel,
    clerk_user
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_clerk_id = claims.get("sub")
    
    event_dict = event_data.model_dump(mode="json")
    event_dict["created_by"] = admin_clerk_id
    event_dict["created_at"] = str(datetime.utcnow())
    event_dict["registration_count"] = 0
    event_dict["attendance_count"] = 0
    event_dict["trending_score"] = 0.0

    # 1. Geolocation lookup
    if event_dict.get("location_name"):
        coords = await GeolocationService.get_coordinates(event_dict["location_name"])
        if coords:
            lat, lon, fmt_addr = coords
            event_dict["coordinates"] = {
                "latitude": lat,
                "longitude": lon,
                "formatted_address": fmt_addr
            }

    # 2. Store in MongoDB
    result = await event_collection.insert_one(event_dict)
    event_id = str(result.inserted_id)

    # 3. Generate Embeddings & Store in Vector DB
   

    return {
        "message": "Event created successfully",
        "event_id": event_id
    }

# 🔓 FOR USERS: Gets every event in the database for the main feed
async def get_all_events_controller():
    cursor = event_collection.find({})
    events = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        events.append(doc)
    return {"events": events}

# 🔓 FOR USERS & ADMINS: Gets details for a single specific event
async def get_event_by_id_controller(event_id: str):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID")
        
    doc = await event_collection.find_one({"_id": ObjectId(event_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
        
    doc["_id"] = str(doc["_id"])
    return {"event": doc}

# 🔒 FOR ADMINS ONLY: Gets only the events created by this specific admin
async def get_admin_events_controller(admin_clerk_id: str):
    cursor = event_collection.find({"created_by": admin_clerk_id})
    events = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        events.append(doc)
    return {"events": events}