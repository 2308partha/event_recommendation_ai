from bson import ObjectId
from fastapi import HTTPException
from database.db import bounty_collection, user_collection, admin_collection
from models.bounty_model import BountyCreateModel
from datetime import datetime

async def create_bounty_controller(bounty_data: BountyCreateModel, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_clerk_id = claims.get("sub")
    
    admin_doc = await admin_collection.find_one({"clerk_user_id": admin_clerk_id})
    organiser_type = admin_doc.get("organiser_type", "college") if admin_doc else "college"
    
    bounty_dict = bounty_data.model_dump(mode="json")
    bounty_dict["organiser_id"] = admin_clerk_id
    bounty_dict["organiser_type"] = organiser_type
    
    # We might want to store organiser name. Let's get it from clerk claims if possible, or fallback
    bounty_dict["organiser_name"] = claims.get("name") or claims.get("email") or "Organiser"
    bounty_dict["status"] = "open"
    bounty_dict["created_at"] = str(datetime.utcnow())
    bounty_dict["assigned_to"] = None

    result = await bounty_collection.insert_one(bounty_dict)
    bounty_id = str(result.inserted_id)

    return {
        "message": "Bounty created successfully",
        "bounty_id": bounty_id
    }

async def get_open_bounties_controller():
    cursor = bounty_collection.find({"status": "open"})
    bounties = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # Map id for frontend compatibility
        doc["id"] = doc["_id"]
        # Make sure frontend fields exist
        doc["organiser"] = doc.get("organiser_name", "Organiser")
        bounties.append(doc)
    return bounties

async def get_admin_bounties_controller(admin_clerk_id: str):
    cursor = bounty_collection.find({"organiser_id": admin_clerk_id})
    bounties = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        doc["organiser"] = doc.get("organiser_name", "Organiser")
        bounties.append(doc)
    return bounties

async def accept_bounty_controller(bounty_id: str, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    student_clerk_id = claims.get("sub")
    
    if not ObjectId.is_valid(bounty_id):
        raise HTTPException(status_code=400, detail="Invalid bounty ID")
        
    doc = await bounty_collection.find_one({"_id": ObjectId(bounty_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Bounty not found")
        
    if doc.get("status") != "open":
        raise HTTPException(status_code=400, detail="Bounty is not open")
        
    await bounty_collection.update_one(
        {"_id": ObjectId(bounty_id)},
        {"$set": {"status": "in_progress", "assigned_to": student_clerk_id}}
    )
    
    return {"message": "Bounty accepted successfully"}

async def complete_bounty_controller(bounty_id: str, admin_clerk_id: str):
    if not ObjectId.is_valid(bounty_id):
        raise HTTPException(status_code=400, detail="Invalid bounty ID")
        
    doc = await bounty_collection.find_one({"_id": ObjectId(bounty_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Bounty not found")
        
    if doc.get("organiser_id") != admin_clerk_id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this bounty")
        
    if doc.get("status") != "in_progress":
        raise HTTPException(status_code=400, detail="Bounty must be in_progress to be completed")
        
    await bounty_collection.update_one(
        {"_id": ObjectId(bounty_id)},
        {"$set": {"status": "completed"}}
    )
    
    return {"message": "Bounty marked as completed"}
