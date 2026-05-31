import asyncio
from datetime import datetime, timedelta, timezone
from database.db import event_collection
from services.embedding_service import EmbeddingService

async def seed_events():
    print("Cleaning old events...")
    # Optional: Clear existing events
    # await event_collection.delete_many({})
    
    now = datetime.now(timezone.utc)
    
    mock_events = [
        {
            "title": "National GenAI Hackathon 2026",
            "description": "An intense 48-hour buildathon focusing on building agentic structures and custom LLM interfaces. Bring your ideas to life and win exciting prizes!",
            "tags": ["AI", "Python", "Hackathon", "Machine Learning", "Generative AI"],
            "category": "Technology",
            "club": "AI/ML Club",
            "start_date": now + timedelta(days=10),
            "end_date": now + timedelta(days=12),
            "registration_deadline": now + timedelta(days=5),
            "is_team_event": True,
            "max_team_size": 4,
            "location_name": "Main Auditorium, NIT Durgapur",
            "mode": "offline",
            "intercollege": True,
            "created_by": "system_admin",
            "created_at": now,
            "registration_open": True,
            "registration_count": 120,
            "attendance_count": 0,
            "trending_score": 0.9
        },
        {
            "title": "React Mastery Workshop",
            "description": "Learn advanced React concepts including Hooks, Context API, and state management libraries like Redux. Perfect for web developers looking to level up.",
            "tags": ["Web Development", "React", "JavaScript", "Frontend"],
            "category": "Workshop",
            "club": "Web Dev Society",
            "start_date": now + timedelta(days=2),
            "end_date": now + timedelta(days=2),
            "registration_deadline": now + timedelta(hours=24), # High FOMO
            "is_team_event": False,
            "max_team_size": 1,
            "location_name": "Computer Lab 3",
            "mode": "offline",
            "intercollege": False,
            "created_by": "system_admin",
            "created_at": now,
            "registration_open": True,
            "registration_count": 45,
            "attendance_count": 0,
            "trending_score": 0.5
        },
        {
            "title": "Global Cyber Security Summit",
            "description": "Join cybersecurity experts from around the world to discuss the latest threats, vulnerabilities, and defense mechanisms.",
            "tags": ["Cybersecurity", "Networking", "Hacking", "InfoSec"],
            "category": "Conference",
            "club": "CyberSec Club",
            "start_date": now + timedelta(days=20),
            "end_date": now + timedelta(days=21),
            "registration_deadline": now + timedelta(days=15),
            "is_team_event": False,
            "max_team_size": 1,
            "location_name": "Virtual",
            "mode": "online",
            "intercollege": True,
            "created_by": "system_admin",
            "created_at": now,
            "registration_open": True,
            "registration_count": 500,
            "attendance_count": 0,
            "trending_score": 0.95
        },
        {
            "title": "Competitive Programming Showdown",
            "description": "Test your algorithmic skills against the best coders. Problems range from easy arrays to complex dynamic programming.",
            "tags": ["C++", "Algorithms", "Data Structures", "Competitive Programming"],
            "category": "Competition",
            "club": "Coding Ninjas",
            "start_date": now + timedelta(days=7),
            "end_date": now + timedelta(days=7),
            "registration_deadline": now + timedelta(days=4),
            "is_team_event": True,
            "max_team_size": 3,
            "location_name": "Library Tech Center",
            "mode": "offline",
            "intercollege": True,
            "created_by": "system_admin",
            "created_at": now,
            "registration_open": True,
            "registration_count": 210,
            "attendance_count": 0,
            "trending_score": 0.8
        },
        {
            "title": "Design Systems Deep Dive",
            "description": "A comprehensive look at building robust design systems using Figma and translating them into reusable code components.",
            "tags": ["UI/UX", "Design", "Figma", "Frontend"],
            "category": "Workshop",
            "club": "Design Hub",
            "start_date": now + timedelta(days=14),
            "end_date": now + timedelta(days=14),
            "registration_deadline": now + timedelta(days=10),
            "is_team_event": False,
            "max_team_size": 1,
            "location_name": "Design Studio 2",
            "mode": "offline",
            "intercollege": False,
            "created_by": "system_admin",
            "created_at": now,
            "registration_open": True,
            "registration_count": 60,
            "attendance_count": 0,
            "trending_score": 0.6
        }
    ]

    print(f"Seeding {len(mock_events)} events into MongoDB...")
    for event_data in mock_events:
        # Insert into Mongo
        result = await event_collection.insert_one(event_data.copy())
        event_id = str(result.inserted_id)
        
        print(f"Inserted: {event_data['title']} ({event_id})")
        
        # Generate and save Chroma DB Embedding
        # EmbeddingService expects dictionary
        event_data["_id"] = event_id
        EmbeddingService.upsert_event_embedding(event_id, event_data)
        print(f"   Generated Vector Embedding for {event_id}")

    print("Seeding complete! You should now see recommendations in your feed.")

if __name__ == "__main__":
    asyncio.run(seed_events())
