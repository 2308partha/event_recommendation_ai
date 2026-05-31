# main.py
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorDatabase

# Ensure local environment variables and credentials are loaded right at bootup
load_dotenv()

# Import database core injection provider
from database.db import db

# Import all routers from both branches
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router
from routes.event_routes import router as event_router
from routes.incubation_routes import router as incubation_router
from routes.bounty_routes import router as bounty_router
from routes.mentorship_routes import router as mentorship_router
from routes.hacker_room_routes import router as hacker_room_router
from routes.registration_routes import router as registration_router
from routes.skill_routes import router as skill_router
from routes.venue_routes import router as venue_router
from routes.marketplace_router import router as marketplace_router
from routes.networking_router import router as networking_router
from routes.recommendation_router import router as github_rec_router
from routes.chat_router import router as github_chat_router

app = FastAPI(
    title="College Event Manager AI Backend",
    description="Nexus AI Centralized Event Discovery Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Yield DB dependency
async def get_db():
    yield db

@app.get("/")
async def home():
    return {
        "status": "online",
        "message": "Backend Running",
        "engine": "Nexus AI Core Recommendation System Running"
    }

# ── Register all routes ──────────────────────────────────────────
app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
app.include_router(event_router, prefix="/api", tags=["Events"])
app.include_router(incubation_router, prefix="/api/incubator", tags=["Incubator"])
app.include_router(bounty_router, prefix="/api/bounties", tags=["Bounties"])
app.include_router(mentorship_router, prefix="/api/mentorship", tags=["Mentorship"])
app.include_router(hacker_room_router, prefix="/api/hacker-rooms", tags=["Hacker Rooms"])
app.include_router(registration_router, prefix="/api", tags=["Registrations"])
app.include_router(skill_router, prefix="/api/skills", tags=["Skills"])
app.include_router(venue_router, prefix="/api/venues", tags=["Venues"])
app.include_router(marketplace_router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(networking_router, prefix="/api/networking", tags=["Networking"])

# Coder Branch Discovery and Chatbot Routers
app.include_router(github_rec_router, prefix="/api/v1/github-feed", tags=["Github Feed"])
app.include_router(github_chat_router, prefix="/api/v1/github-feed", tags=["Github Chatbot"])


# ─── DEVELOPMENT UTILITY ROUTES ───────────────────────────────────

@app.post("/api/v1/events/seed-mock-data", status_code=status.HTTP_201_CREATED, tags=["Development Utilities"])
async def seed_mock_data(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Development Utility Endpoint.
    Seeds your MongoDB cluster with sample users and events tailored 
    to validate your LangChain recommendation engine logic.
    """
    try:
        await db["users"].delete_many({})
        await db["events"].delete_many({})

        future_deadline = datetime.utcnow() + timedelta(days=2)
        extended_date = datetime.utcnow() + timedelta(days=5)

        mock_user = {
            "_id": "mock_user_12345",
            "name": "Sourav Sen",
            "email": "souravsen6378@gmail.com",
            "branch": "Mathematics and Computing",
            "class_of": 2028,
            "skills": ["C++", "Python", "React", "FastAPI", "Data Structures"],
            "interests": ["Generative AI", "Competitive Programming", "Web Development", "Hackathons"],
            "friends_ids": ["peer_user_99", "peer_user_88"],
            "registered_events": [],
            "coordinates": [87.2913, 23.5477],
            "coins": 120,
            "badges": ["Beta Explorer"],
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(mock_user)

        mock_events = [
            {
                "title": "National GenAI Hackathon 2026",
                "description": "An intense 48-hour buildathon focusing on building agentic RAG structures and custom LLM interfaces using LangChain frameworks.",
                "host_college": "NIT Durgapur",
                "nirf_ranking": 43,
                "is_intercollege": True,
                "location_name": "Main Auditorium, NIT Durgapur",
                "location_geo": {"type": "Point", "coordinates": [87.2915, 23.5480]},
                "tags": ["Generative AI", "Python", "Hackathons", "LangChain"],
                "registration_count": 87,
                "registered_participants": ["peer_user_99", "peer_user_88"],
                "registration_deadline": future_deadline,
                "event_date": extended_date,
                "is_open": True,
                "created_at": datetime.utcnow()
            },
            {
                "title": "Advanced Data Structures & Competitive Meetup",
                "description": "Mastering complex graph matrices and algorithmic tree pruning strategies using optimized standard C++ paradigms.",
                "host_college": "IIT Kharagpur",
                "nirf_ranking": 6,
                "is_intercollege": True,
                "location_name": "IIT KGP Campus",
                "location_geo": {"type": "Point", "coordinates": [87.3100, 22.3100]},
                "tags": ["C++", "Competitive Programming", "Algorithms"],
                "registration_count": 240,
                "registered_participants": ["peer_user_77"],
                "registration_deadline": future_deadline,
                "event_date": extended_date,
                "is_open": True,
                "created_at": datetime.utcnow()
            }
        ]
        await db["events"].insert_many(mock_events)
        await db["events"].create_index([("location_geo", "2dsphere")])

        return {
            "success": True, 
            "message": "Database tracking state successfully seeded and geospatial index created!"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanly seed development artifacts: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True,
        reload_excludes=[
            "*.pyc", 
            "*_db", 
            "chroma_db", 
            "chroma_db/*", 
            ".venv/*", 
            "__pycache__/*"
        ],
        reload_dirs=[
            os.path.join(base_dir, "routes"),
            os.path.join(base_dir, "chatbot"),
            os.path.join(base_dir, "recommendation")
        ]
    )
