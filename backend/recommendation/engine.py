from motor.motor_asyncio import AsyncIOMotorDatabase
from recommendation.pipeline.phase1_retrieval import retrieve_surviving_candidates
from recommendation.pipeline.phase2_semantic import evaluate_candidates_with_ai
from recommendation.pipeline.phase4_formula import apply_master_formula

class RecommendationEngine:
    
    @staticmethod
    async def get_personalized_feed(db: AsyncIOMotorDatabase, user_id: str, is_intra: bool = False) -> list:
        """
        Coordinates execution pipelines from Phase 1 through Phase 4 sequentially.
        """
        # 1. Fetch user context from MongoDB
        user_profile = await db["users"].find_one({"_id": user_id})
        if not user_profile:
            # Provide a generic mock profile for non-onboarded users
            user_profile = {
                "coordinates": [87.2913, 23.5477],
                "college_name": "",
                "skills": ["Tech", "Innovation"],
                "interests": ["General"]
            }
            
        user_coords = user_profile.get("coordinates", [87.2913, 23.5477]) # Falling back to base coordinates if unset
        user_college = user_profile.get("college_name", "") # Get user's college
        
        # 2. Run Phase 1 Pruning
        candidates = await retrieve_surviving_candidates(db, user_coords, is_intra=is_intra, user_college=user_college)
        if not candidates:
            return []
            
        # 3. Run Phase 2 & 3 Contextual Scoring via LangChain
        scored_packages = await evaluate_candidates_with_ai(db, user_profile, candidates, is_intra=is_intra)
        
        # 4. Run Phase 4 Normalization Sorting
        personalized_feed = await apply_master_formula(scored_packages, user_profile, is_intra=is_intra)
        
        return personalized_feed