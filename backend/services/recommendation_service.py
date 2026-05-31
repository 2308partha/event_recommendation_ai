from database.db import event_collection
from services.embedding_service import EmbeddingService
from services.ranking_service import RankingService
from bson import ObjectId

class RecommendationService:
    @staticmethod
    async def generate_feed_for_user(user: dict) -> list[dict]:
        """
        Main logic for Step 6-11:
        1. Build semantic query from user profile
        2. Semantic Search in Vector DB -> Candidate Events
        3. Fetch candidate details from MongoDB
        4. Apply final ranking
        5. Return sorted feed
        """
        
        # 1. Build Query
        interests = user.get("interests", [])
        skills = user.get("skills", [])
        hobbies = user.get("hobbies", [])
        
        query_parts = interests + skills + hobbies
        query_text = " ".join(query_parts)
        if not query_text.strip():
            query_text = "college events" # fallback
            
        # 2. Semantic Search (Get top 30 candidates)
        try:
            candidates = EmbeddingService.search_similar_events(query_text, n_results=30)
        except Exception as e:
            print(f"Vector search failed: {e}")
            candidates = []
            
        # If vector search fails or is empty, fallback to basic MongoDB query
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
            # 3. Fetch full event documents for candidates from MongoDB
            candidate_ids = [ObjectId(c["event_id"]) for c in candidates if ObjectId.is_valid(c["event_id"])]
            
            cursor = event_collection.find({"_id": {"$in": candidate_ids}, "registration_open": True})
            candidate_events = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                candidate_events.append(doc)

        # 4. Filter & Rank
        user_college = user.get("college_name", "").lower()
        wants_intercollege = user.get("intercollege_preference", True)
        
        ranked_feed = []
        for event in candidate_events:
            # Filtering Layer
            event_college = event.get("location_name", "").lower()
            event_is_intercollege = event.get("intercollege", True)
            
            if not wants_intercollege:
                # If user only wants their college, event location must contain user college
                if user_college not in event_college:
                    continue
            
            if not event_is_intercollege:
                # If event is strictly not intercollege, only students from that college can see it
                if user_college not in event_college:
                    continue

            # Find semantic distance from vector search results
            distance = 1.0 # Default max distance (lowest similarity)
            for c in candidates:
                if c["event_id"] == event["_id"]:
                    distance = c["distance"]
                    break
            
            # Convert cosine distance (0 to 2) to similarity score (0 to 1)
            # distance 0 -> score 1
            # distance 2 -> score 0
            semantic_score = max(0.0, 1.0 - (distance / 2.0))
            
            # Rank
            final_score = RankingService.calculate_final_score(event, user, semantic_score)
            
            event["recommendation_score"] = final_score
            ranked_feed.append(event)
            
        # 5. Sort by recommendation score descending
        ranked_feed.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        return ranked_feed
