import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(mongo_uri)
db = client.get_database("campus_event_ai")

user = db.users.find_one({})
if not user:
    print("No user found in the remote database. Please sign in on the frontend first.")
    exit(1)

clerk_id = user.get("clerk_user_id")
user_name = user.get("name")
print(f"Seeding analytics for user: {user_name} ({clerk_id})")

events = list(db.events.find().limit(6))
if len(events) < 5:
    print("Not enough events to build a good graph. Inserting some mock events...")
    mock_events = []
    for i in range(6 - len(events)):
        mock_events.append({
            "title": f"Mock Tech Event {i+1}",
            "host_college": "NIT Durgapur",
            "is_open": True,
            "created_at": datetime.utcnow()
        })
    result = db.events.insert_many(mock_events)
    events.extend(list(db.events.find({"_id": {"$in": result.inserted_ids}})))

# Delete existing registrations to reset graph
db.registrations.delete_many({"user_id": clerk_id})

mock_registrations = []
base_date = datetime.utcnow() - timedelta(days=50)

scores = [65.0, 72.5, 68.0, 85.0, 88.5, 94.0] 

for i, event in enumerate(events[:6]):
    reg_date = base_date + timedelta(days=i*8)
    
    mock_registrations.append({
        "user_id": clerk_id,
        "event_id": str(event["_id"]),
        "status": "approved",
        "performance_score": scores[i],
        "registered_at": reg_date,
        "created_at": reg_date
    })

db.registrations.insert_many(mock_registrations)
print(f"Successfully injected {len(mock_registrations)} historical performance records into remote Atlas DB!")
