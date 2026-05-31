from pymongo import MongoClient
import datetime
from config.settings import DATABASE_URL

DB_NAME = "event_recommendation_ai"

def seed_admin_events():
    client = MongoClient(DATABASE_URL)
    db = client[DB_NAME]
    
    # Get the first available admin to assign these events to
    admin = db["admins"].find_one({})
    admin_id = admin["clerk_user_id"] if admin else "mock_admin_id"
    
    print(f"Seeding events for admin ID: {admin_id}")

    # Clear previously seeded mock events for this script to be idempotent
    db["events"].delete_many({"created_by": admin_id, "title": {"$regex": "^Mock:"}})

    now = datetime.datetime.utcnow()

    mock_events = [
        {
            "title": "Mock: Web3 Hackathon 2026",
            "description": "Join the ultimate Web3 building experience with top developers.",
            "tags": ["Web3", "Blockchain", "Hackathon"],
            "category": "Hackathon",
            "club": "Blockchain Society",
            "start_date": now + datetime.timedelta(days=30),
            "end_date": now + datetime.timedelta(days=32),
            "registration_deadline": now + datetime.timedelta(days=20),
            "is_team_event": True,
            "max_team_size": 4,
            "location_name": "Main Tech Hub",
            "mode": "offline",
            "intercollege": True,
            "budget": 5000,
            "expected_attendees": 500,
            "required_resources": ["Venue", "Sponsor"],
            "created_by": admin_id,
            "created_at": now,
            "registration_open": True,
            "registration_count": 150,
            "attendance_count": 0,
            "trending_score": 85.5
        },
        {
            "title": "Mock: Annual Tech Symposium",
            "description": "Our biggest event of the year featuring AI, Cloud, and Cybersecurity talks.",
            "tags": ["AI", "Tech", "Symposium"],
            "category": "Conference",
            "club": "Tech Innovators",
            "start_date": now - datetime.timedelta(days=2),
            "end_date": now + datetime.timedelta(days=2),
            "registration_deadline": now - datetime.timedelta(days=10),
            "is_team_event": False,
            "max_team_size": 1,
            "location_name": "Grand Auditorium",
            "mode": "offline",
            "intercollege": True,
            "budget": 15000,
            "expected_attendees": 800,
            "required_resources": ["Vendor", "Speaker"],
            "created_by": admin_id,
            "created_at": now - datetime.timedelta(days=60),
            "registration_open": False,
            "registration_count": 850,
            "attendance_count": 820,
            "trending_score": 98.2
        },
        {
            "title": "Mock: Intro to React Workshop",
            "description": "Learn the basics of React and frontend web development.",
            "tags": ["React", "Frontend", "Workshop"],
            "category": "Workshop",
            "club": "Web Dev Club",
            "start_date": now - datetime.timedelta(days=30),
            "end_date": now - datetime.timedelta(days=29),
            "registration_deadline": now - datetime.timedelta(days=35),
            "is_team_event": False,
            "max_team_size": 1,
            "location_name": "Lab 4B",
            "mode": "offline",
            "intercollege": False,
            "budget": 500,
            "expected_attendees": 50,
            "required_resources": [],
            "created_by": admin_id,
            "created_at": now - datetime.timedelta(days=90),
            "registration_open": False,
            "registration_count": 60,
            "attendance_count": 45,
            "trending_score": 40.0
        },
        {
            "title": "Mock: Future Founders Pitch Deck",
            "description": "Pitch your startup idea to a panel of VC judges.",
            "tags": ["Startup", "Pitch", "Business"],
            "category": "Competition",
            "club": "Entrepreneurship Cell",
            "start_date": now + datetime.timedelta(days=15),
            "end_date": now + datetime.timedelta(days=15),
            "registration_deadline": now + datetime.timedelta(days=5),
            "is_team_event": True,
            "max_team_size": 3,
            "location_name": "Startup Incubator Hall",
            "mode": "offline",
            "intercollege": True,
            "budget": 2000,
            "expected_attendees": 100,
            "required_resources": ["Sponsor"],
            "created_by": admin_id,
            "created_at": now - datetime.timedelta(days=10),
            "registration_open": True,
            "registration_count": 35,
            "attendance_count": 0,
            "trending_score": 60.5
        }
    ]

    result = db["events"].insert_many(mock_events)
    print(f"Successfully seeded {len(result.inserted_ids)} mock events for the admin dashboard!")

if __name__ == "__main__":
    seed_admin_events()
