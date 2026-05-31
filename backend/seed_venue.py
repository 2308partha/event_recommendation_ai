import asyncio
from database.db import user_collection, venue_provider_collection
from middleware.auth_middleware import clerk_sdk
import datetime

async def main():
    target_email = "partha4892rana@gmail.com"
    
    # 1. Find the user in the database
    user = await user_collection.find_one({"email": target_email})
    
    if not user:
        print(f"User with email {target_email} not found in DB.")
        return
        
    clerk_id = user["clerk_user_id"]
    name = user.get("name", "Partha Rana")
    
    print(f"Found user: {name} ({clerk_id})")
    
    # 2. Update user role in DB
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"role": "venue_provider"}}
    )
    
    # 3. Create mock venue provider
    mock_venue = {
        "clerk_user_id": clerk_id,
        "name": name,
        "email": target_email,
        "institution_name": "Tech Hub Spaces",
        "address": "123 Innovation Drive, Silicon Valley",
        "contact_email": target_email,
        "contact_phone": "+1-555-0199",
        "capacity": 500,
        "amenities": "High-Speed WiFi, Stage, 4K Projectors, Surround Sound, AC",
        "gst_details": "GSTIN1234567890",
        "gps_location": "37.3875, -122.0575",
        "ai_trust_score": 98,
        "verified": True,
        "role": "venue_provider",
        "created_at": str(datetime.datetime.utcnow())
    }
    
    # Delete existing if any
    await venue_provider_collection.delete_many({"clerk_user_id": clerk_id})
    await venue_provider_collection.insert_one(mock_venue)
    
    # 4. Update Clerk metadata
    print("Updating Clerk metadata...")
    try:
        await clerk_sdk.users.update_async(
            user_id=clerk_id,
            public_metadata={"role": "venue_provider"}
        )
        print("Clerk metadata updated successfully!")
    except Exception as e:
        print(f"Error updating Clerk: {e}")
        
    print("Done! User is now a Venue Provider.")

if __name__ == "__main__":
    asyncio.run(main())
