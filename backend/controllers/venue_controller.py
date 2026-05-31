from bson import ObjectId
from fastapi import HTTPException
from database.db import venue_provider_collection, venue_request_collection, admin_collection, user_collection
from models.venue_model import VenueProviderRequestModel, VenueRequestCreateModel
from middleware.auth_middleware import clerk_sdk
from services.ai_service import AIService
import datetime

# ================================
# VENUE PROVIDER LOGIC
# ================================

async def verify_venue_provider_controller(request_data: VenueProviderRequestModel, image_bytes: bytes, mime_type: str, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")
    name = claims.get("name", "Venue Provider")
    email = claims.get("email", "")

    # We reuse the AI service but trick it slightly by passing organization name
    user_data = {
        "organiser_type": "venue_provider", 
        "organization": request_data.institution_name,
        "full_name": name
    }
    
    ai_result = await AIService.analyze_id_card(user_data, image_bytes, mime_type)
    
    if not ai_result.get("is_valid"):
        return {"approved": False, "reason": ai_result.get("reason", "ID card invalid.")}

    provider_doc = {
        "clerk_user_id": clerk_user_id,
        "name": name,
        "email": email,
        "institution_name": request_data.institution_name,
        "address": request_data.address,
        "contact_email": request_data.contact_email,
        "contact_phone": request_data.contact_phone,
        "capacity": request_data.capacity,
        "amenities": request_data.amenities,
        "gst_details": request_data.gst_details,
        "gps_location": request_data.gps_location,
        "ai_trust_score": ai_result.get("extracted", {}).get("trust_score", 80),
        "verified": True,
        "role": "venue_provider",
        "created_at": str(datetime.datetime.utcnow())
    }
    
    await venue_provider_collection.insert_one(provider_doc)
    
    # Also update user collection role
    await user_collection.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": {"role": "venue_provider"}}
    )
    
    # Update clerk metadata
    try:
        await clerk_sdk.users.update_async(
            user_id=clerk_user_id,
            public_metadata={"role": "venue_provider"}
        )
    except Exception as e:
        print(f"Failed to update Clerk metadata: {e}")

    return {"approved": True, "reason": "AI successfully verified Institution ID.", "role": "venue_provider"}

async def dev_bypass_provider_controller(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")
    name = claims.get("name", "Test Provider")
    email = claims.get("email", "")

    provider_doc = {
        "clerk_user_id": clerk_user_id,
        "name": name,
        "email": email,
        "institution_name": "Seeded Test Provider",
        "address": "Virtual HQ",
        "contact_email": email,
        "contact_phone": "0000000000",
        "capacity": 500,
        "verified": True,
        "role": "venue_provider",
        "created_at": str(datetime.datetime.utcnow())
    }
    
    await venue_provider_collection.insert_one(provider_doc)
    
    # Also update user collection role
    await user_collection.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": {"role": "venue_provider"}}
    )
    
    # Update clerk metadata
    try:
        await clerk_sdk.users.update_async(
            user_id=clerk_user_id,
            public_metadata={"role": "venue_provider"}
        )
    except Exception as e:
        print(f"Failed to update Clerk metadata: {e}")

    return {"approved": True, "reason": "Dev bypass applied.", "role": "venue_provider"}

# ================================
# MARKETPLACE LOGIC (Venue Requests)
# ================================

async def create_venue_request_controller(request_data: VenueRequestCreateModel, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    organizer_id = claims.get("sub")
    
    # Validate the organizer exists and is an admin
    admin_doc = await admin_collection.find_one({"clerk_user_id": organizer_id})
    if not admin_doc:
        raise HTTPException(status_code=403, detail="Only organizers can request venues.")
        
    req_dict = request_data.model_dump(mode="json")
    req_dict["organizer_id"] = organizer_id
    req_dict["organizer_name"] = admin_doc.get("organization", claims.get("name", "Unknown Organizer"))
    req_dict["status"] = "open"
    req_dict["created_at"] = str(datetime.datetime.utcnow())
    req_dict["accepted_by_provider_id"] = None
    req_dict["venue_name"] = None

    result = await venue_request_collection.insert_one(req_dict)
    
    return {
        "message": "Venue request published successfully",
        "request_id": str(result.inserted_id)
    }

async def get_open_venue_requests_controller():
    cursor = venue_request_collection.find({"status": "open"}).sort("created_at", -1)
    requests = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        requests.append(doc)
    return requests

async def get_my_venue_requests_controller(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    user_id = claims.get("sub")
    
    cursor = venue_request_collection.find({"organizer_id": user_id}).sort("created_at", -1)
    requests = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        requests.append(doc)
    return requests

async def accept_venue_request_controller(request_id: str, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    provider_id = claims.get("sub")
    
    # Validate venue provider
    provider_doc = await venue_provider_collection.find_one({"clerk_user_id": provider_id})
    if not provider_doc:
        raise HTTPException(status_code=403, detail="Only verified Venue Providers can accept requests.")
        
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
        
    doc = await venue_request_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if doc.get("status") != "open":
        raise HTTPException(status_code=400, detail="This request has already been accepted.")
        
    await venue_request_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {
            "status": "accepted", 
            "accepted_by_provider_id": provider_id,
            "venue_name": provider_doc.get("institution_name", "Provided Venue")
        }}
    )
    
    return {"message": "Venue request accepted successfully!"}
