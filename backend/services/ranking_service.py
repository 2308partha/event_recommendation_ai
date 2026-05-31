from datetime import datetime

class RankingService:
    @staticmethod
    def calculate_final_score(event: dict, user: dict, semantic_score: float) -> float:
        """
        Calculate final recommendation score for an event for a specific user.
        Formula:
          final_score =
          semantic_similarity * 0.4 +
          interest_score * 0.2 +
          behavior_score * 0.15 +
          distance_score * 0.1 +
          trending_score * 0.1 +
          recency_score * 0.05
        """
        score = 0.0
        
        # 1. Semantic Similarity (from Vector DB distances, inverted so closer = higher score)
        # Assuming semantic_score is already normalized between 0 and 1, where 1 is identical.
        # Note: ChromaDB cosine distance: 0 is identical, 2 is opposite.
        # We will assume recommendation_service converts distance to a 0-1 similarity score.
        score += semantic_score * 0.40
        
        # 2. Interest Score
        user_interests = set([i.lower() for i in user.get("interests", [])])
        user_skills = set([s.lower() for s in user.get("skills", [])])
        user_hobbies = set([h.lower() for h in user.get("hobbies", [])])
        
        event_tags = set([t.lower() for t in event.get("tags", [])])
        event_cat = event.get("category", "").lower()
        
        interest_match = 0.0
        if event_cat in user_interests or event_cat in user.get("preferred_categories", []):
            interest_match += 0.5
            
        common_tags = event_tags.intersection(user_interests.union(user_skills).union(user_hobbies))
        if len(common_tags) > 0:
            interest_match += min(0.5, len(common_tags) * 0.1) # Max 0.5 from tags
            
        score += interest_match * 0.20
        
        # 3. Behavior Score (Stubbed: normally this looks at past attendance)
        # If event category matches their frequently attended categories
        behavior_score = 0.5 # Default medium behavior score until we aggregate past registrations
        score += behavior_score * 0.15
        
        # 4. Distance Score (Simplification: if same city, high score. Else low score)
        distance_score = 0.0
        user_loc = user.get("location_name", "").lower()
        event_loc = event.get("location_name", "").lower()
        if user_loc and event_loc and (user_loc in event_loc or event_loc in user_loc):
            distance_score = 1.0
        score += distance_score * 0.10
        
        # 5. Trending Score
        trending_score = min(1.0, event.get("registration_count", 0) / 100.0)
        score += trending_score * 0.10
        
        # 6. Recency Score (Happening sooner = higher score)
        recency_score = 0.0
        try:
            start_date = datetime.fromisoformat(event.get("start_date", "").replace("Z", "+00:00"))
            days_until = (start_date - datetime.utcnow()).days
            if days_until < 0:
                recency_score = 0.0 # already passed
            elif days_until <= 7:
                recency_score = 1.0 # This week
            elif days_until <= 30:
                recency_score = 0.5 # This month
            else:
                recency_score = 0.2
        except:
            pass
            
        score += recency_score * 0.05
        
        return score
