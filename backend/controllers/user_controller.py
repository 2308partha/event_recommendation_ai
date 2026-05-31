from datetime import datetime, timezone
from fastapi import HTTPException

from database.db import user_collection, registration_collection, event_collection
from bson import ObjectId
from models.user_model import UserCreateModel, UserUpdateModel
from middleware.auth_middleware import clerk_sdk
from services.geolocation_service import GeolocationService

# =========================
# CREATE / SYNC USER
# =========================

async def create_user_controller(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    name = claims.get("name")
    email = claims.get("email")
    image_url = claims.get("image_url")

    # 🌟 ADD THIS LINE: Force email to lowercase if it exists
    if email:
        email = email.lower()

    if not (name and email and image_url):
        try:
            full_user = await clerk_sdk.users.get_async(user_id=clerk_user_id)
            name = name or f"{full_user.first_name or ''} {full_user.last_name or ''}".strip() or "Unknown"
            
            # 🌟 UPDATE THIS LINE: Add .lower() to the fallback as well
            raw_email = email or (full_user.email_addresses[0].email_address if full_user.email_addresses else "unknown@example.com")
            email = raw_email.lower()
            
            image_url = image_url or full_user.image_url or "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cannot fetch user details from Clerk API: {str(e)}")
        
    user_data = UserCreateModel(
        clerk_user_id=clerk_user_id,
        name=name,
        email=email,
        image_url=image_url,
    )

    existing_user = await user_collection.find_one({"clerk_user_id": user_data.clerk_user_id})

    if existing_user:
        await user_collection.update_one(
            {"clerk_user_id": user_data.clerk_user_id},
            {"$set": {
                "name": user_data.name,
                "email": user_data.email,
                "image_url": user_data.image_url.unicode_string() if hasattr(user_data.image_url, "unicode_string") else str(user_data.image_url) if user_data.image_url else None,
                "role": existing_user.get("role", user_data.role)
            }}
        )
        return {"message": "User synced/updated"}

    await user_collection.insert_one(user_data.model_dump(mode="json"))

    # ---> ADDED: Tell Clerk this user is now a student <---
    try:
        await clerk_sdk.users.update_async(
            user_id=clerk_user_id,
            public_metadata={"role": "student"}
        )
    except Exception as e:
        print(f"Failed to update Clerk metadata: {e}")

    return {"message": "User created"}

# =========================
# GET CURRENT USER
# =========================

async def get_user_controller(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    user = await user_collection.find_one(
        {"clerk_user_id": clerk_user_id},
        {"_id": 0}
    )
    return {"user": user}

# =========================
# UPDATE USER
# =========================

async def update_user_controller(clerk_user, update_data: UserUpdateModel):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    final_update_data = update_data.model_dump(mode="json", exclude_unset=True)
    
    if "location_name" in final_update_data and "current_location" not in final_update_data:
        location_name = final_update_data["location_name"]
        if location_name:
            coords = await GeolocationService.get_coordinates(location_name)
            if coords:
                lat, lon, fmt_addr = coords
                final_update_data["current_location"] = {
                    "latitude": lat,
                    "longitude": lon,
                    "formatted_address": fmt_addr
                }

    # ---> ADDED: Fixed datetime deprecation <---
    final_update_data["updated_at"] = datetime.now(timezone.utc)

    existing_user = await user_collection.find_one({"clerk_user_id": clerk_user_id})
    if not existing_user:
        return {"message": "User not found"}

    merged_data = {**existing_user, **final_update_data}

    required_fields = [
        "college_name", "department", "roll_no", "pass_out_year",
        "dob", "phone_number", "blood_group",
        "interests", "skills", "hobbies", "preferred_categories"
    ]

    is_completed = all(bool(merged_data.get(field)) for field in required_fields)
    final_update_data["is_profile_completed"] = is_completed

    await user_collection.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": final_update_data}
    )

    return {
        "message": "User updated",
        "is_profile_completed": is_completed
    }

# =========================
# GET USER ANALYTICS
# =========================

async def get_user_analytics_controller(clerk_user):
    try:
        claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized: No user ID found in token")
        
        # 1. Fetch User Details
        user_doc = await user_collection.find_one({"clerk_user_id": user_id}) or {}
        
        # 2. Get all registrations for this user
        cursor = registration_collection.find({"user_id": user_id})
        registrations = await cursor.to_list(length=100)
        
        # 3. Build event_id list and lookup event details
        event_ids = []
        for r in registrations:
            eid = r.get("event_id")
            if isinstance(eid, str) and ObjectId.is_valid(eid):
                event_ids.append(ObjectId(eid))
            elif isinstance(eid, ObjectId):
                event_ids.append(eid)

        events_map = {}
        if event_ids:
            events_cursor = event_collection.find({"_id": {"$in": event_ids}})
            events_list = await events_cursor.to_list(length=100)
            events_map = {str(e["_id"]): e for e in events_list}
            
        attended_events = []
        performance_history = []
        total_score = 0.0
        scored_count = 0
        
        for reg in registrations:
            eid = str(reg.get("event_id", ""))
            event = events_map.get(eid, {})
            score = reg.get("performance_score")
            date_val = reg.get("registered_at", "")
            date_str = str(date_val)[:10] if date_val else "N/A"

            attended_events.append({
                "title": event.get("title", "Unknown Event"),
                "category": event.get("category", "General"),
                "score": score,
                "date": date_str,
                "status": reg.get("status", "registered"),
                "attended": reg.get("attended", False),
            })

            if score is not None:
                performance_history.append({
                    "name": event.get("title", "Event"),
                    "score": float(score),
                    "date": date_str
                })
                total_score += float(score)
                scored_count += 1

        avg_score = round(total_score / scored_count, 1) if scored_count > 0 else 0.0

        # 4. Fetch Bounties earned by this user
        from database.db import bounty_collection
        bounty_cursor = bounty_collection.find({"assigned_to": user_id, "status": "completed"})
        bounties_raw = await bounty_cursor.to_list(length=100)
        
        bounties_earned = []
        total_bounty_tokens = 0
        for b in bounties_raw:
            reward_str = str(b.get("reward", "0"))
            try:
                digits = ''.join(filter(str.isdigit, reward_str))
                tokens = int(digits) if digits else 0
            except Exception:
                tokens = 0
            total_bounty_tokens += tokens
            bounties_earned.append({
                "title": b.get("title", "Bounty Task"),
                "reward": reward_str,
                "tokens": tokens,
                "category": b.get("category", "General"),
                "completed_at": str(b.get("created_at", ""))[:10]
            })

        return {
            "user_details": {
                "name": user_doc.get("name", claims.get("name", "Student")),
                "email": user_doc.get("email", claims.get("email", "")),
                "department": user_doc.get("department", "Not Specified"),
                "roll_no": user_doc.get("roll_no", "Not Specified"),
                "skills": user_doc.get("skills", []) or [],
                "image_url": user_doc.get("image_url", ""),
                "college_name": user_doc.get("college_name", "Not Specified"),
                "phone_number": user_doc.get("phone_number", ""),
                "blood_group": user_doc.get("blood_group", ""),
                "pass_out_year": str(user_doc.get("pass_out_year", "")),
                "interests": user_doc.get("interests", []) or [],
                "hobbies": user_doc.get("hobbies", []) or [],
            },
            "analytics": {
                "total_events": len(registrations),
                "average_score": avg_score,
                "performance_history": performance_history,
                "attended_events": attended_events,
                "total_bounty_tokens": total_bounty_tokens,
                "bounties_earned": bounties_earned
            }
        }
    except Exception as e:
        print(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))