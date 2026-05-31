from fastapi import APIRouter, Depends, status, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.db import db
from recommendation.engine import RecommendationEngine
from middleware.auth_middleware import verify_clerk_token

async def get_db():
    yield db

router = APIRouter(tags=["AI Discovery Engine"])

@router.get("/events/recommendations", status_code=status.HTTP_200_OK)
async def get_campus_recommendations(
    is_intra: bool = False,
    clerk_user = Depends(verify_clerk_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    End-to-End AI Feed Discovery Endpoint.
    1. Grabs the student profile using Clerk token claims.
    2. Runs Phase 1 (Geospatial & Timeline Pruning) directly inside MongoDB.
    3. Runs Phase 2 & 3 (LangChain Expression Language + Gemini-2.5-Flash Analysis).
    4. Runs Phase 4 (Master Weighted Scoring) and returns a sorted personalized array feed.
    """
    try:
        claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
        clerk_user_id = claims.get("sub")
        
        # Check if the user document exists before running heavy math
        user_exists = await db["users"].find_one({"clerk_user_id": clerk_user_id})
        
        if not user_exists:
            # Fallback to generic feed
            user_id = None
        else:
            user_id = str(user_exists["_id"])
            
        # Invoke your top-level orchestrator engine
        personalized_feed = await RecommendationEngine.get_personalized_feed(db=db, user_id=user_id, is_intra=is_intra)
        
        return {
            "success": True,
            "count": len(personalized_feed),
            "data": personalized_feed
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation pipeline execution interrupted: {str(e)}"
        )