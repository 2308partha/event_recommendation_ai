from fastapi import APIRouter, Depends, status, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.db import db
from middleware.auth_middleware import verify_clerk_token

async def get_db():
    yield db

router = APIRouter(tags=["Peer Networking"])

@router.get("/mentors", status_code=status.HTTP_200_OK)
async def get_recommended_mentors(
    user_id: str = "mock_user_12345",
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Finds peers who participated in the same events as the user
    but achieved a higher performance score.
    """
    try:
        clerk_user_id = user_id

        # 1. Get the current user's registrations where they have a performance score
        my_registrations = await db["registrations"].find({
            "user_id": clerk_user_id,
            "performance_score": {"$ne": None}
        }).to_list(length=100)

        if not my_registrations:
            return {"success": True, "count": 0, "data": []}

        # Create a mapping of event_id -> my_score
        my_event_scores = {reg["event_id"]: reg["performance_score"] for reg in my_registrations}
        event_ids = list(my_event_scores.keys())

        # 2. Find other users in the SAME events
        # We can construct an $or query to check this efficiently
        or_conditions = []
        for event_id in event_ids:
            or_conditions.append({
                "event_id": event_id
            })

        if not or_conditions:
            return {"success": True, "count": 0, "data": []}

        all_peer_registrations = await db["registrations"].find({
            "user_id": {"$ne": clerk_user_id},
            "$or": or_conditions
        }).to_list(length=500)

        # 3. Aggregate unique peers and categorize them
        peer_events_map = {} # peer_user_id -> list of event_ids they participated in
        peer_mentorship_map = {} # peer_user_id -> list of event_ids they outperformed in
        
        for reg in all_peer_registrations:
            uid = reg["user_id"]
            eid = reg["event_id"]
            peer_score = reg.get("performance_score") or 0.0
            
            if uid not in peer_events_map:
                peer_events_map[uid] = []
                peer_mentorship_map[uid] = []
                
            peer_events_map[uid].append(eid)
            if peer_score > my_event_scores.get(eid, 0):
                peer_mentorship_map[uid].append(eid)

        if not peer_events_map:
            return {"success": True, "count": 0, "data": []}

        # 4. Fetch the peer user profiles and the event titles
        peer_user_ids = list(peer_events_map.keys())
        peers_cursor = db["users"].find({"clerk_user_id": {"$in": peer_user_ids}})
        peers = await peers_cursor.to_list(length=100)

        events_cursor = db["events"].find({"_id": {"$in": [__import__("bson").ObjectId(eid) for eid in event_ids]}})
        events = await events_cursor.to_list(length=100)
        event_title_map = {str(evt["_id"]): evt["title"] for evt in events}

        # 5. Format the final response
        results = []
        for peer in peers:
            uid = peer.get("clerk_user_id")
            outperformed_eids = peer_mentorship_map.get(uid, [])
            participated_eids = peer_events_map.get(uid, [])
            
            is_mentor = len(outperformed_eids) > 0
            
            event_list_ids = outperformed_eids if is_mentor else participated_eids
            shared_events = [event_title_map.get(eid, "Unknown Event") for eid in event_list_ids]
            
            results.append({
                "id": uid,
                "name": peer.get("name"),
                "email": peer.get("email"),
                "image_url": peer.get("image_url", "https://api.dicebear.com/7.x/avataaars/svg?seed=" + peer.get("name", "User")),
                "branch": peer.get("branch", "Unknown Branch"),
                "skills": peer.get("skills", []),
                "shared_events": shared_events,
                "is_mentor": is_mentor
            })

        return {
            "success": True,
            "count": len(results),
            "data": results
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Peer matching algorithm failed: {str(e)}"
        )
