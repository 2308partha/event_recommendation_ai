from datetime import datetime, timezone
import math

class RankingService:
    @staticmethod
    def calculate_fomo_score(deadline_str: str) -> float:
        """Computes an exponential decay curve for impending deadlines (FOMO)."""
        if not deadline_str:
            return 0.0
        try:
            deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
            # Make naive for simple subtraction
            naive_deadline = deadline.replace(tzinfo=None)
            hours_left = (naive_deadline - datetime.utcnow()).total_seconds() / 3600.0
            
            if hours_left <= 0: 
                return 0.0
            return math.exp(-hours_left / 48.0) # Peaks as hours_left approaches 0
        except Exception:
            return 0.0

    @staticmethod
    def calculate_final_score(event: dict, user: dict, semantic_score: float) -> float:
        """
        Phase 4 Master Formula
        Calculate final recommendation score for an event for a specific user.
        Formula (Weights):
          Semantic (Chroma + AI) : 40%
          History/Interest       : 20%
          FOMO Score             : 20%
          Distance Score         : 10%
          Trending Score         : 10%
        """
        score = 0.0
        
        # 1. Semantic Similarity (40%)
        # semantic_score is passed in from RecommendationService (Chroma vector + Gemini AI)
        score += semantic_score * 0.40
        
        # 2. History/Interest Score (20%)
        user_interests = set([i.lower() for i in user.get("interests", [])])
        user_skills = set([s.lower() for s in user.get("skills", [])])
        user_hobbies = set([h.lower() for h in user.get("hobbies", [])])
        
        event_tags = set([t.lower() for t in event.get("tags", [])])
        event_cat = event.get("category", "").lower()
        user_branch = user.get("department", "").lower()
        
        interest_match = 0.0
        # Category match gives base score
        if event_cat in user_interests or event_cat in user.get("preferred_categories", []):
            interest_match += 0.4
            
        # Tag overlaps add to it
        common_tags = event_tags.intersection(user_interests.union(user_skills).union(user_hobbies))
        if len(common_tags) > 0:
            interest_match += min(0.4, len(common_tags) * 0.1)
            
        # Boost if user's branch/department is mentioned in tags
        if user_branch and any(user_branch in tag for tag in event_tags):
            interest_match += 0.2
            
        score += min(1.0, interest_match) * 0.20
        
        # 3. FOMO Score (20%)
        fomo_score = RankingService.calculate_fomo_score(event.get("registration_deadline", ""))
        score += fomo_score * 0.20
        
        # 4. Distance Score (10%)
        # Simplification: if same city/college, high score
        distance_score = 0.0
        user_loc = user.get("location_name", "").lower()
        event_loc = event.get("location_name", "").lower()
        if user_loc and event_loc and (user_loc in event_loc or event_loc in user_loc):
            distance_score = 1.0
        score += distance_score * 0.10
        
        # 5. Trending Score (10%)
        # Higher registrations = more trending
        trending_score = min(1.0, event.get("registration_count", 0) / 100.0)
        score += trending_score * 0.10
        
        return score
