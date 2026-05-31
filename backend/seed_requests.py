from pymongo import MongoClient
import datetime
from config.settings import DATABASE_URL

DB_NAME = "event_recommendation_ai"

def seed_requests():
    client = MongoClient(DATABASE_URL)
    db = client[DB_NAME]
    venue_request_collection = db["venue_requests"]

    # Clear existing open requests to avoid duplicates on multiple runs
    venue_request_collection.delete_many({"status": "open", "organizer_id": "mock_org_id"})

    requests_data = [
        {
            "organizer_id": "mock_org_id",
            "organizer_name": "Web3 Builders Community",
            "event_title": "Global Web3 Hackathon",
            "expected_date": "2026-07-20",
            "expected_capacity": 300,
            "requirements": "Need a spacious venue with uninterrupted high-speed internet and power backups.",
            "target_budget": 5000,
            "city": "Austin",
            "status": "open",
            "created_at": str(datetime.datetime.utcnow()),
            "accepted_by_provider_id": None,
            "venue_name": None
        },
        {
            "organizer_id": "mock_org_id",
            "organizer_name": "Design Innovators Club",
            "event_title": "UX/UI Design Sprint 2026",
            "expected_date": "2026-08-10",
            "expected_capacity": 150,
            "requirements": "Looking for a well-lit studio space, round tables, and large whiteboards.",
            "target_budget": 2000,
            "city": "New York",
            "status": "open",
            "created_at": str(datetime.datetime.utcnow()),
            "accepted_by_provider_id": None,
            "venue_name": None
        },
        {
            "organizer_id": "mock_org_id",
            "organizer_name": "AI Researchers Network",
            "event_title": "Annual Machine Learning Symposium",
            "expected_date": "2026-09-05",
            "expected_capacity": 800,
            "requirements": "Require a massive auditorium with premium sound system and VIP lounges.",
            "target_budget": 20000,
            "city": "Seattle",
            "status": "open",
            "created_at": str(datetime.datetime.utcnow()),
            "accepted_by_provider_id": None,
            "venue_name": None
        }
    ]

    result = venue_request_collection.insert_many(requests_data)
    print(f"Successfully seeded {len(result.inserted_ids)} mock requests!")

if __name__ == "__main__":
    seed_requests()
