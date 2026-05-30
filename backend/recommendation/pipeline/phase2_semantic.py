import os
import math
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.output_parsers import JsonOutputParser
from recommendation.chains.prompt_templates import recommendation_prompt
from datetime import timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

# 1. Initialize our sharing embedding model to map vectors cleanly
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

# 2. Bind to your persistent, local vector database store
vectorstore = Chroma(
    collection_name="campus_events",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)

def calculate_fomo_score(deadline: datetime) -> float:
    """Computes an exponential decay curve for impending deadlines (FOMO)."""
    naive_deadline = deadline.replace(tzinfo=None)
    hours_left = (naive_deadline - datetime.now(timezone.utc).replace(tzinfo=None)).total_seconds() / 3600.0
    if hours_left <= 0: return 0.0
    return math.exp(-hours_left / 48.0)

def get_nirf_score(ranking: int) -> float:
    """Tiered host institutional reputation score scaler."""
    if ranking <= 20: return 1.0
    if ranking <= 50: return 0.8
    if ranking <= 100: return 0.5
    return 0.1

async def evaluate_candidates_with_ai(db: AsyncIOMotorDatabase, user_profile: dict, candidates: list, is_intra: bool = False) -> list:
    """
    Phase 2 & 3: Combines localized ChromaDB vector similarity with 
    Gemini structured output parsing via LangChain.
    """
    # Initialize your Chat Model setup
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    chain = recommendation_prompt | llm | JsonOutputParser()
    
    # Construct a string representation of the student profile for vector matching
    student_profile_str = f"Branch: {user_profile.get('branch', '')}. Skills: {', '.join(user_profile.get('skills', []))}. Interests: {', '.join(user_profile.get('interests', []))}"
    
    # Fetch semantic similarity metrics from your local ChromaDB
    matched_docs = vectorstore.similarity_search_with_relevance_scores(student_profile_str, k=10)
    
    vector_score_map = {}
    for doc, score in matched_docs:
        ev_id = doc.metadata.get("event_id")
        if ev_id:
            vector_score_map[str(ev_id)] = max(0.0, min(1.0, score))
            
    # --- Past Registrations & Teammate Extraction ---
    registered_event_ids = user_profile.get("registered_events", [])
    past_tags = set()
    past_teammates = set(user_profile.get("friends_ids", [])) # Start with friends
    
    if registered_event_ids:
        # Fetch details of past registered events
        past_events = await db["events"].find({"_id": {"$in": registered_event_ids}}).to_list(None)
        for pe in past_events:
            for tag in pe.get("tags", []):
                past_tags.add(tag)
            # If it was a team event, add participants as teammates
            if pe.get("is_team_event") or len(pe.get("registered_participants", [])) > 1:
                for p_id in pe.get("registered_participants", []):
                    if p_id != user_profile.get("_id"):
                        past_teammates.add(p_id)
                        
    # --- NIRF JSON Loading (Placeholder for when file is provided) ---
    nirf_cache = {}
    json_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "nirf_data.json")
    if os.path.exists(json_path):
        try:
            import json
            with open(json_path, "r") as f:
                nirf_cache = json.load(f)
        except Exception:
            pass
            
    scored_packages = []
    
    for event in candidates:
        event_id_str = str(event.get("_id"))
        
        # 1. Base Semantic Vector Score
        chroma_semantic_score = vector_score_map.get(event_id_str, 0.5)
        
        # 2. Collaborative Teammate Score
        event_participants = set(event.get("registered_participants", []))
        teammates_attending = list(past_teammates & event_participants)
        social_score = min(len(teammates_attending) / 3.0, 1.0) # Max score if 3+ teammates attend
        
        # 3. FOMO Score
        fomo = calculate_fomo_score(event["registration_deadline"])
        
        # 4. NIRF Score
        host_college = event.get("host_college", "Unknown")
        ranking = nirf_cache.get(host_college, event.get("nirf_ranking", 999))
        nirf = get_nirf_score(ranking)
        
        # 5. History / Department Matching Score
        event_tags = set(event.get("tags", []))
        overlap_tags = past_tags & event_tags
        history_score = min(len(overlap_tags) / 3.0, 1.0) # Max if 3+ overlapping tags
        # Boost if user branch overlaps with tags
        if user_profile.get("branch") and any(user_profile.get("branch").lower() in tag.lower() for tag in event_tags):
            history_score = min(history_score + 0.3, 1.0)
        
        try:
            ai_payload = await chain.ainvoke({
                "branch": user_profile.get("branch", "General"),
                "skills": ", ".join(user_profile.get("skills", [])),
                "interests": ", ".join(user_profile.get("interests", [])),
                "event_title": event["title"],
                "event_description": event["description"],
                "event_tags": ", ".join(event_tags),
                "host_college": host_college,
                "friends_attending_count": len(teammates_attending)
            })
            final_semantic_metric = (chroma_semantic_score * 0.4) + (ai_payload.get("semantic_score", 0.5) * 0.6)
            reason_text = ai_payload.get("reason", "Highly trending inside your branch.")
            
        except Exception:
            final_semantic_metric = chroma_semantic_score
            reason_text = "Matches your technical development roadmap based on historical data."
            
        scored_packages.append({
            "event_data": event,
            "semantic_score": final_semantic_metric,
            "reason": reason_text,
            "fomo_score": fomo,
            "nirf_score": nirf,
            "social_score": social_score,
            "history_score": history_score
        })
        
    return scored_packages