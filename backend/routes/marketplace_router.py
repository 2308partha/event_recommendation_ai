from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from database.db import db
from middleware.auth_middleware import verify_admin_role
from bson import ObjectId

router = APIRouter()

@router.get("/recommendations/{event_id}")
async def get_marketplace_recommendations(
    event_id: str,
    clerk_user = Depends(verify_admin_role)
):
    """
    AI Marketplace Engine:
    Fetches the specified Event, reads its requirements and budget,
    and returns a tailored list of matching Service Providers.
    """
    try:
        # 1. Fetch Event
        event = await db["events"].find_one({"_id": ObjectId(event_id)})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
            
        required_resources = event.get("required_resources", [])
        event_budget = event.get("budget", 0)
        
        if not required_resources:
            return {"matches": []}
            
        # 2. Query Providers
        # We look for providers whose provider_type is in the required list
        cursor = db["providers"].find({
            "provider_type": {"$in": required_resources}
        })
        providers = await cursor.to_list(None)
        
        matches = []
        for p in providers:
            p["_id"] = str(p["_id"])
            
            # 3. Simple Mock "AI Match Algorithm"
            # In a real app this could use ChromaDB/LangChain. Here we use heuristics.
            match_score = 100.0
            
            # Penalize if their min_budget is higher than the event budget
            if p.get("min_budget", 0) > event_budget:
                match_score -= 30.0
                
            # Bonus for high trust score
            match_score += (p.get("trust_score", 80) / 100) * 10
            
            # Cap at 99%
            match_score = min(99.0, match_score)
            
            p["ai_match_score"] = round(match_score, 1)
            
            # Provide an AI reasoning sentence
            if match_score >= 90:
                p["ai_reason"] = f"Perfect match! This {p['provider_type']} fits your budget and has exceptional ratings."
            elif match_score >= 70:
                p["ai_reason"] = f"Good alternative. Highly reliable but might be slightly premium for your budget."
            else:
                p["ai_reason"] = f"Available, but budget mismatch or lower trust score."
                
            matches.append(p)
            
        # Sort by match score descending
        matches.sort(key=lambda x: x["ai_match_score"], reverse=True)
        
        return {"matches": matches}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
