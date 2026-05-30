from utils.geocoding import calculate_distance_score

async def apply_master_formula(scored_packages: list, user_profile: dict, is_intra: bool = False) -> list:
    """
    Phase 4 Master Formula: Merges semantic AI logic with real-world metrics.
    Re-balanced to heavily favor semantic search and collaborative filtering (teammates).
    """
    final_feed = []
    
    # User requested high percentage for semantic and collaborative filtering
    W_SEMANTIC = 0.40   # 40%
    W_SOCIAL = 0.25     # 25% (Collaborative Teammate Filtering)
    W_HISTORY = 0.15    # 15% (Past registrations/department overlap)
    W_FOMO = 0.10       # 10%
    W_DISTANCE = 0.05   # 5%
    W_NIRF = 0.05       # 5%
    
    user_coords = user_profile.get("coordinates")
    user_loc_name = user_profile.get("location_name")
    
    for pkg in scored_packages:
        event = pkg["event_data"]
        
        # For intra-college, distance score is maxed out since it's the same campus
        if is_intra:
            distance_score = 1.0 
        else:
            event_coords = event.get("location_geo", {}).get("coordinates")
            event_loc_name = event.get("location_name")
            distance_score = await calculate_distance_score(user_coords, event_coords, user_loc_name, event_loc_name)
            
        final_score = (
            (pkg.get("semantic_score", 0) * W_SEMANTIC) +
            (pkg.get("social_score", 0) * W_SOCIAL) +
            (pkg.get("history_score", 0) * W_HISTORY) +
            (pkg.get("fomo_score", 0) * W_FOMO) +
            (distance_score * W_DISTANCE) +
            (pkg.get("nirf_score", 0) * W_NIRF)
        )
        
        event["_id"] = str(event["_id"])  # Cast ObjectID safely for JSON processing
        event["recommendation_score"] = round(final_score, 3)
        event["personalized_reason"] = pkg["reason"]
        
        final_feed.append(event)
        
    # Sort descending based on our final structural calculation score
    final_feed.sort(key=lambda x: x["recommendation_score"], reverse=True)
    return final_feed