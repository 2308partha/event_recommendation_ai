# main.py
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorDatabase

# Ensure local environment variables and credentials (GEMINI_API_KEY) are loaded right at bootup
load_dotenv()

# Import your database core injection provider directly from your root file
from database import get_db

# Import all routers from partha and coder branches
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router
from routes.event_routes import router as event_router
from routes.registration_routes import router as registration_router
from routes.recommendation_router import router as recommendation_router
from routes.chat_router import router as chat_router

app = FastAPI(
    title="College Event Manager AI Backend",
    description="Nexus AI Centralized Event Discovery Platform",
    version="1.0.0"
)

# Configure essential standard CORS rules for seamless frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes from both branches
app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
app.include_router(event_router, prefix="/api", tags=["Events"])
app.include_router(registration_router, prefix="/api", tags=["Registrations"])
app.include_router(recommendation_router)
app.include_router(chat_router)


# ─── DEVELOPMENT UTILITY ROUTES ───────────────────────────────────

@app.post("/api/v1/events/seed-mock-data", status_code=status.HTTP_201_CREATED, tags=["Development Utilities"])
async def seed_mock_data(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Development Utility Endpoint.
    Seeds your MongoDB cluster with sample users and events tailored 
    to validate your LangChain recommendation engine logic.
    """
    try:
        # 1. Clear existing test artifacts to prevent document duplication conflicts
        await db["users"].delete_many({})
        await db["events"].delete_many({})

        # 2. Build explicit naive timestamps to guarantee mathematical operations inside phase2 work perfectly
        future_deadline = datetime.utcnow() + timedelta(days=2)
        extended_date = datetime.utcnow() + timedelta(days=5)

        # 3. Seed a Mock Student User Profile matching your structural architecture layouts
        mock_user = {
            "_id": "mock_user_12345",  # Baseline mock user ID used by your recommendation route
            "name": "Sourav Sen",
            "email": "souravsen6378@gmail.com",
            "branch": "Mathematics and Computing",
            "class_of": 2028,
            "skills": ["C++", "Python", "React", "FastAPI", "Data Structures"],
            "interests": ["Generative AI", "Competitive Programming", "Web Development", "Hackathons"],
            "friends_ids": ["peer_user_99", "peer_user_88"],
            "registered_events": [],
            "coordinates": [87.2913, 23.5477],  # NIT Durgapur Base Geo-Coordinates
            "coins": 120,
            "badges": ["Beta Explorer"],
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(mock_user)

        # 4. Seed Structured Events (Varying host institute rankings, tags, and registrations)
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
                "registered_participants": ["peer_user_99", "peer_user_88"],  # 2 of your friends are attending!
                "registration_deadline": future_deadline,
                "event_date": extended_date,
                "is_open": True,
                "created_at": datetime.utcnow()
            },
            {
                "title": "Advanced Data Structures & Competitive Meetup",
                "description": "Mastering complex graph matrices and algorithmic tree pruning strategies using optimized standard C++ paradigms.",
                "host_college": "IIT Kharagpur",
                "nirf_ranking": 6,  # Elite Top 10 NIRF institution tier!
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

        # 5. Enforce Geospatial 2dsphere indexing right after document creation
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


# ─── CORE LIFECYCLE PING ──────────────────────────────────────────

@app.get("/", tags=["System Lifecycle"])
async def root_ping():
    """
    Simple status verification endpoint.
    """
    return {
        "status": "online", 
        "engine": "Nexus AI Core Recommendation System Running"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Calculate the exact directory path where your server code lives
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True,
        # ─── EXTRA CAREFUL PATH EXCLUSIONS ──────────────────────────────────
        # Instead of generic wildcards, we explicitly name the directory trees
        reload_excludes=[
            "*.pyc", 
            "*_db", 
            "chroma_db", 
            "chroma_db/*", 
            ".venv/*", 
            "__pycache__/*"
        ],
        # Tell Uvicorn explicitly to focus its watch eyes only on your code subfolders
        reload_dirs=[
            os.path.join(base_dir, "routes"),
            os.path.join(base_dir, "chatbot"),
            os.path.join(base_dir, "recommendation")
        ]
    )
