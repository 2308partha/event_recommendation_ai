from database.db import event_collection
from services.embedding_service import EmbeddingService
from services.ranking_service import RankingService
from services.recommendation_ai_service import RecommendationAIService
from bson import ObjectId

class RecommendationService:
    @staticmethod
    async def generate_feed_for_user(user: dict) -> list[dict]:
        """
        Main logic for 4-Phase AI Discovery Engine:
        1. Phase 1: Pruning / Vector Search
        2. Phase 2: Filtering Layer
        3. Phase 3: AI Semantic Evaluation (Gemini)
        4. Phase 4: Master Formula & Ranking
        """
        
        # 1. Build Query for Vector DB
        interests = user.get("interests", [])
        skills = user.get("skills", [])
        hobbies = user.get("hobbies", [])
        
        query_parts = interests + skills + hobbies
        query_text = " ".join(query_parts)
        if not query_text.strip():
            query_text = "college events" # fallback
            
        # 2. Semantic Search (Phase 1: Pruning - get top 30 candidates)
        try:
            candidates = EmbeddingService.search_similar_events(query_text, n_results=30)
        except Exception as e:
            print(f"Vector search failed: {e}")
            candidates = []
            
        # Fetch candidate details from MongoDB
        if not candidates:
            cursor = event_collection.find({"registration_open": True}).limit(30)
            candidate_ids = []
            candidate_events = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                candidate_events.append(doc)
            
            # Mock candidate distances for fallback
            candidates = [{"event_id": e["_id"], "distance": 1.0} for e in candidate_events]
        else:
            candidate_ids = [ObjectId(c["event_id"]) for c in candidates if ObjectId.is_valid(c["event_id"])]
            
            cursor = event_collection.find({"_id": {"$in": candidate_ids}, "registration_open": True})
            candidate_events = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                candidate_events.append(doc)

        # 3. Filter Layer & Phase 3 (AI Evaluation)
        user_college = user.get("college_name", "").lower()
        wants_intercollege = user.get("intercollege_preference", True)
        
        ranked_feed = []
        for event in candidate_events:
            # Phase 2: Filtering Layer
            event_college = event.get("location_name", "").lower()
            event_is_intercollege = event.get("intercollege", True)
            
            if not wants_intercollege:
                if user_college not in event_college:
                    continue
            
            if not event_is_intercollege:
                if user_college not in event_college:
                    continue

            # Get ChromaDB distance
            distance = 1.0
            for c in candidates:
                if c["event_id"] == event["_id"]:
                    distance = c["distance"]
                    break
            
            # Convert cosine distance (0 to 2) to similarity score (0 to 1)
            chroma_semantic_score = max(0.0, 1.0 - (distance / 2.0))
            
            # Phase 3: AI Semantic Evaluation
            ai_eval = await RecommendationAIService.evaluate_event(user, event)
            ai_semantic_score = ai_eval.get("semantic_score", 0.5)
            personalized_reason = ai_eval.get("reason", "This event matches your profile.")
            
            # Combine Semantic Scores (40% Vector DB, 60% Gemini AI)
            final_semantic = (chroma_semantic_score * 0.4) + (ai_semantic_score * 0.6)
            
            # Phase 4: Rank
            final_score = RankingService.calculate_final_score(event, user, final_semantic)
            
            event["recommendation_score"] = round(final_score, 3)
            event["personalized_reason"] = personalized_reason
            
            ranked_feed.append(event)
            
        # 5. Sort by recommendation score descending
        ranked_feed.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        return ranked_feed
