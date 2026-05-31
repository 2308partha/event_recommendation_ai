from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException
from database.db import event_collection, registration_collection, user_collection 
from models.registration_model import RegistrationCreateModel, RegistrationUpdateModel

# ---------------------------------------------------------
# 1. CREATE REGISTRATION (STUDENT)
# ---------------------------------------------------------
async def create_registration_controller(
    registration_data: RegistrationCreateModel,
    clerk_user
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    user_id = claims.get("sub")

    # 1. Check if Event Exists
    if not ObjectId.is_valid(registration_data.event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID format")
        
    event = await event_collection.find_one({"_id": ObjectId(registration_data.event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # 2. Check Registration Deadline
    try:
        deadline_str = event.get("registration_deadline", "").replace("Z", "")
        deadline = datetime.fromisoformat(deadline_str)
        # 🌟 FIX: Updated deprecated datetime.utcnow() to timezone.utc
        if datetime.now(timezone.utc).replace(tzinfo=None) > deadline:
            raise HTTPException(status_code=400, detail="Registration for this event has closed.")
    except ValueError:
        pass # Fallback if date is missing or malformed

    # 3. Check Team Size Rules
    num_members = len(registration_data.members)
    
    if not event.get("is_team_event") and num_members > 1:
        raise HTTPException(status_code=400, detail="This is a solo event. You cannot register a team.")
        
    if event.get("is_team_event") and num_members > event.get("max_team_size", 1):
        raise HTTPException(
            status_code=400, 
            detail=f"Team size exceeds the maximum limit of {event.get('max_team_size')}."
        )

    # 4. Check for Duplicate Registration
    existing_reg = await registration_collection.find_one({
        "user_id": user_id,
        "event_id": registration_data.event_id
    })
    if existing_reg:
        raise HTTPException(status_code=400, detail="You are already registered for this event.")

    # 5. 🌟 HYBRID COLLABORATIVE SHARING
    # Force emails to lowercase so they are perfect for future syncing
    member_emails = []
    for member in registration_data.members:
        member.email = member.email.lower()
        member_emails.append(member.email)

    linked_ids = [user_id] # Always start by linking the person submitting
    
    # Instantly link teammates who ALREADY have an account
    cursor = user_collection.find({"email": {"$in": member_emails}})
    async for db_user in cursor:
        # 🌟 FIX: Corrected key name to clerk_user_id and removed the raw _id fallback!
        found_clerk_id = db_user.get("clerk_user_id") 
        if found_clerk_id and found_clerk_id not in linked_ids:
            linked_ids.append(found_clerk_id)

    # 6. Format and Save to MongoDB
    reg_dict = registration_data.model_dump(mode="json")
    reg_dict["user_id"] = user_id
    reg_dict["linked_user_ids"] = linked_ids # Contains creator + any existing friends
    # 🌟 FIX: Updated deprecated datetime.utcnow()
    reg_dict["registered_at"] = datetime.now(timezone.utc).isoformat()
    reg_dict["status"] = "registered"
    reg_dict["attended"] = False

    await registration_collection.insert_one(reg_dict)

    # 7. Increment Event Registration Count Atomically
    await event_collection.update_one(
        {"_id": ObjectId(registration_data.event_id)},
        {"$inc": {"registration_count": 1}}
    )

    return {"message": "Successfully registered for the event!"}


# ---------------------------------------------------------
# 2. GET MY REGISTRATIONS (STUDENT)
# ---------------------------------------------------------
async def get_my_registrations_controller(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    user_id = claims.get("sub")
    
    # 1. Fetch the user's email to catch registrations where they weren't linked by ID yet
    # 🌟 FIX: Corrected query key to clerk_user_id
    current_user = await user_collection.find_one({"clerk_user_id": user_id})
    
    # 2. The Fail-Safe Query
    if current_user and current_user.get("email"):
        user_email = current_user.get("email").lower()
        query = {
            "$or": [
                {"linked_user_ids": user_id},     # Linked at creation OR by the Sync route
                {"members.email": user_email}     # Bulletproof fallback: search the array directly
            ]
        }
    else:
        query = {"linked_user_ids": user_id}

    cursor = registration_collection.find(query)
    registrations = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        registrations.append(doc)
        
    return {"registrations": registrations}


# ---------------------------------------------------------
# 3. GET EVENT ATTENDEES (ADMIN ONLY)
# ---------------------------------------------------------
async def get_event_attendees_controller(event_id: str, clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_id = claims.get("sub")
    
    # Verify this admin actually created this event
    event = await event_collection.find_one({"_id": ObjectId(event_id)})
    if not event or event.get("created_by") != admin_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these attendees.")
        
    cursor = registration_collection.find({"event_id": event_id})
    attendees = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        attendees.append(doc)
        
    return {"attendees": attendees}


# ---------------------------------------------------------
# 4. UPDATE REGISTRATION STATUS/ATTENDANCE (ADMIN ONLY)
# ---------------------------------------------------------
async def update_registration_status_controller(
    registration_id: str,
    update_data: RegistrationUpdateModel,
    clerk_user
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_id = claims.get("sub")

    if not ObjectId.is_valid(registration_id):
        raise HTTPException(status_code=400, detail="Invalid registration ID")
        
    registration = await registration_collection.find_one({"_id": ObjectId(registration_id)})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Verify admin ownership of the event
    event = await event_collection.find_one({"_id": ObjectId(registration["event_id"])})
    if not event or event.get("created_by") != admin_id:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You can only modify registrations for events you created."
        )

    # Filter out fields the admin didn't include in the request
    update_fields = update_data.model_dump(exclude_unset=True)
    if not update_fields:
        return {"message": "No new data provided to update."}

    # Apply the update
    await registration_collection.update_one(
        {"_id": ObjectId(registration_id)},
        {"$set": update_fields}
    )

    # Increment or Decrement Event Attendance Count safely
    if update_fields.get("attended") is True and not registration.get("attended"):
        await event_collection.update_one(
            {"_id": ObjectId(registration["event_id"])},
            {"$inc": {"attendance_count": 1}}
        )
    elif update_fields.get("attended") is False and registration.get("attended") is True:
         await event_collection.update_one(
            {"_id": ObjectId(registration["event_id"])},
            {"$inc": {"attendance_count": -1}}
        )

    return {"message": "Registration updated successfully", "updated_fields": update_fields}