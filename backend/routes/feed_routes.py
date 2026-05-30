from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token
from database.db import user_collection
from services.recommendation_service import RecommendationService
from fastapi import HTTPException

router = APIRouter()

@router.get("/feed")
async def get_personalized_feed(
    clerk_user = Depends(verify_clerk_token)
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")
    
    # Fetch full user profile from Mongo
    user = await user_collection.find_one({"clerk_user_id": clerk_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.get("is_profile_completed", False):
        raise HTTPException(status_code=400, detail="Profile must be completed to get personalized feed")
        
    feed = await RecommendationService.generate_feed_for_user(user)
    
    return {
        "feed": feed
    }
