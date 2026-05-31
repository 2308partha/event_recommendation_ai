from fastapi import File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from middleware.auth_middleware import verify_clerk_token, clerk_sdk
from models.admin_model import AdminCreateModel, AdminRequestModel, AdminResponseModel
from database.db import admin_collection
from utils.cloudinary_helper import upload_to_cloudinary
from services.ai_service import AIService

async def create_admin(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    name = claims.get("name")
    email = claims.get("email")
    image_url = claims.get("image_url")

    if not (name and email and image_url):
        try:
            full_user = await clerk_sdk.users.get_async(user_id=clerk_user_id)
            name = name or f"{full_user.first_name or ''} {full_user.last_name or ''}".strip() or "Unknown"
            email = email or (full_user.email_addresses[0].email_address if full_user.email_addresses else "unknown@example.com")
            image_url = image_url or full_user.image_url or "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cannot fetch user details from Clerk API: {str(e)}")

    admin_data = AdminCreateModel(
        clerk_user_id=clerk_user_id,
        name=name,
        email=email,
        image_url=image_url
    )

    existing_admin = await admin_collection.find_one({"clerk_user_id": admin_data.clerk_user_id})

    if existing_admin:
        await admin_collection.update_one(
            {"clerk_user_id": admin_data.clerk_user_id},
            {"$set": {
                "name": admin_data.name,
                "email": admin_data.email,
                "image_url": admin_data.image_url.unicode_string() if hasattr(admin_data.image_url, "unicode_string") else str(admin_data.image_url) if admin_data.image_url else None
            }}
        )
        return {"message": "Admin updated successfully"}

    await admin_collection.insert_one(admin_data.model_dump(mode="json"))
    return {"message": "Admin created"}


async def verify_admin(
    clerk_user,
    request_data: AdminRequestModel,
    id_card: UploadFile = File(...)
) -> AdminResponseModel:

    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized user")

    existing_admin = await admin_collection.find_one({"clerk_user_id": clerk_user_id})

    if existing_admin and existing_admin.get("verified") and existing_admin.get("role") == "admin":
        return AdminResponseModel(approved=True, role="admin", reason="Already verified admin")

    image_bytes = await id_card.read()
    id_card.file.seek(0)

    try:
        upload_result = await run_in_threadpool(upload_to_cloudinary, image_bytes, folder="admin_id_cards")
        image_url = upload_result.get("secure_url") or upload_result.get("url")
    except Exception as e:
        return AdminResponseModel(approved=False, role=None, reason=f"Cloudinary image upload failed: {str(e)}")

   # 1. Try to get data from the DB or Claims first
    name = existing_admin.get("name") if existing_admin else claims.get("name")
    email = existing_admin.get("email") if existing_admin else claims.get("email")
    profile_image_url = existing_admin.get("image_url") if existing_admin else claims.get("image_url")

    # 2. If it is missing or "Unknown", fetch it directly from the Clerk API
    if not name or name == "Unknown":
        try:
            full_user = await clerk_sdk.users.get_async(user_id=clerk_user_id)
            name = f"{full_user.first_name or ''} {full_user.last_name or ''}".strip() or "Unknown"
            email = full_user.email_addresses[0].email_address if full_user.email_addresses else "unknown@example.com"
            profile_image_url = full_user.image_url or "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        except Exception as e:
            print(f"Failed to fetch user from Clerk API: {e}")
            name = "Unknown"
            email = "unknown@example.com"
            profile_image_url = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"

    # Construct user data for AI prompt
    user_data_dict = request_data.model_dump()
    user_data_dict["full_name"] = name
    user_data_dict["mobile_no"] = request_data.phone_number

    try:
        ai_result = await AIService.analyze_id_card(
            user_data=user_data_dict,
            image_bytes=image_bytes,
            mime_type=id_card.content_type
        )
    except Exception as e:
        return AdminResponseModel(approved=False, role=None, reason=f"AI Analysis crashed: {str(e)}")

    approved = ai_result.get("is_valid", False)
    reason = ai_result.get("reason", "ID card verification failed")

    if not approved:
        return AdminResponseModel(approved=False, role=None, reason=reason)

    await admin_collection.update_one(
        {"clerk_user_id": clerk_user_id},
        {"$set": {
            "name": name,
            "email": email,
            "image_url": profile_image_url,
            "college_name": request_data.college_name,
            "roll_number": request_data.roll_number,
            "year_of_study": request_data.year_of_study,
            "phone_number": request_data.phone_number,
            "official_email": request_data.official_email,
            "organization": request_data.organization,
            "department": request_data.department,
            "club_name": request_data.club_name,
            "post": request_data.post,
            "club_note": request_data.club_note,
            "id_card_image_url": image_url,
            "verified": True,
            "role": "admin"
        }},
        upsert=True
    )

    # ---> ADDED: Tell Clerk this user is now an admin <---
    try:
        await clerk_sdk.users.update_async(
            user_id=clerk_user_id,
            public_metadata={"role": "admin"}
        )
    except Exception as e:
        print(f"Failed to update Clerk metadata: {e}")

    return AdminResponseModel(approved=True, role="admin", reason="Admin verified successfully")


async def get_admin(clerk_user):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")

    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized user")

    admin = await admin_collection.find_one({"clerk_user_id": clerk_user_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"admin": admin}