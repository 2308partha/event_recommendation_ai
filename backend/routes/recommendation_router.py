from fastapi import APIRouter, Depends, status, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_db
from recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/api/v1", tags=["AI Discovery Engine"])

@router.get("/events/recommendations", status_code=status.HTTP_200_OK)
async def get_campus_recommendations(
    user_id: str = "mock_user_12345",  # Defaults to the user ID seeded in your database
    is_intra: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    End-to-End AI Feed Discovery Endpoint.
    1. Grabs the student profile using the provided user_id.
    2. Runs Phase 1 (Geospatial & Timeline Pruning) directly inside MongoDB.
    3. Runs Phase 2 & 3 (LangChain Expression Language + Gemini-2.5-Flash Analysis).
    4. Runs Phase 4 (Master Weighted Scoring) and returns a sorted personalized array feed.
    """
    try:
        # Check if the user document exists before running heavy math
        user_exists = await db["users"].find_one({"_id": user_id})
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found. Please run your mock seeder route first."
            )
            
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