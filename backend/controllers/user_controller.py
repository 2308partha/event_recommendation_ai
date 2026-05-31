from datetime import datetime, timezone
from fastapi import HTTPException

from database.db import user_collection 
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