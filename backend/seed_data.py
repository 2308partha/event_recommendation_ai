# seed_data.py
import asyncio
import os
from datetime import datetime, timedelta
import chromadb
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Ensure environment variables are loaded immediately
load_dotenv()

async def run_standalone_seeder():
    print("🚀 Initializing standalone database seeding sequence...")
    
    # 1. Establish direct connection to MongoDB Atlas using your environment URI
    mongo_url = os.getenv("MONGODB_URL")
    if not mongo_url:
        print("❌ Error: MONGODB_URL is missing from your .env configuration file.")
        return
        
    mongo_client = AsyncIOMotorClient(mongo_url)
    
    # Explicitly extract the default database name from your connection URI string safely
    try:
        db = mongo_client.get_default_database()
    except Exception:
        db = None
        
    # If no default database name was specified in the MONGODB_URL string, fallback safely
    if db is None:
        db = mongo_client["test"]  # Matches your application's fallback database namespace
    
    try:
        # 2. Clear old test instances to guarantee clean indices
        print("🧹 Purging old users and events documents from MongoDB Atlas...")
        await db["users"].delete_many({})
        await db["events"].delete_many({})
        
        # 3. Setup Local Persistent ChromaDB
        print("📦 Connecting to local persistent ChromaDB collection...")
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        collection = chroma_client.get_or_create_collection(name="campus_events")
        
        # Safely remove old test vector registrations if present
        existing_chroma = collection.get(ids=["id_1", "id_2"])
        if existing_chroma["ids"]:
            collection.delete(ids=existing_chroma["ids"])
            print("🗑️ Cleared stale vector chunks from ChromaDB.")

        # ─── GEOSPATIAL INDEX CREATION ────────────────────────────────
        print("🌐 Creating 2dsphere index on events.location_geo in MongoDB Atlas...")
        await db["events"].create_index([("location_geo", "2dsphere")])
        # ──────────────────────────────────────────────────────────────

        # 4. Generate synchronized cross-database matching tracking IDs
        event_one_id = ObjectId()
        event_two_id = ObjectId()

        future_deadline = datetime.utcnow() + timedelta(days=2)
        extended_date = datetime.utcnow() + timedelta(days=5)

        # 5. Build and insert your active Student Profile
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
            "coordinates": [87.2913, 23.5477],  # Base geo anchoring (NIT Durgapur)
            "coins": 120,
            "badges": ["Beta Explorer"],
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(mock_user)
        print("👤 MongoDB Atlas: Successfully injected Student Profile.")

        # 6. Build and insert core test events
        mock_events = [
            {
                "_id": event_one_id,
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
                "_id": event_two_id,
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
        print("📅 MongoDB Atlas: Successfully injected structural Event records with 2dsphere indexing.")

        # 7. Generate Embeddings and Seed ChromaDB via import tracking
        print("🧠 Invoking Gemini Embeddings engine to tokenize contextual targets...")
        from recommendation.pipeline.phase2_semantic import embeddings
        
        # Format rich documents incorporating all structured fields for the RAG engine to retrieve
        deadline_str = future_deadline.strftime('%B %d, %Y')
        event_date_str = extended_date.strftime('%B %d, %Y')

        mock_texts = [
            f"Event Title: National GenAI Hackathon 2026.\n"
            f"Host Institution: NIT Durgapur (NIRF Ranking: 43).\n"
            f"Event Scope: Inter-College event open to all outside students.\n"
            f"Location: Main Auditorium, NIT Durgapur.\n"
            f"Description: An intense 48-hour buildathon focusing on building agentic RAG structures and custom LLM interfaces using LangChain frameworks.\n"
            f"Registration Deadline: {deadline_str}.\n"
            f"Event Date: {event_date_str}.\n"
            f"Pricing: Free entry.\n"
            f"Team Size: 2 to 4 members.\n"
            f"Registration Process: Eligible students can register directly on the campus portal dashboard by clicking the 'Register Now' button. +50 wallet coins are awarded upon successful registration.",
            
            f"Event Title: Advanced Data Structures & Competitive Meetup.\n"
            f"Host Institution: IIT Kharagpur (NIRF Ranking: 6).\n"
            f"Location: Vikramshila Hall, IIT KGP Campus.\n"
            f"Description: Mastering complex graph matrices and algorithmic tree pruning strategies using optimized standard C++ paradigms.\n"
            f"Registration Deadline: {deadline_str}.\n"
            f"Event Date: {event_date_str}.\n"
            f"Pricing: Free entry.\n"
            f"Team Size: Individual participation only.\n"
            f"Registration Process: Register directly on the campus portal dashboard by clicking the 'Register Now' button. Unlocks peer coding meetups."
        ]
        
        # Generates mathematical vectors directly from the Gemini API
        raw_embeddings = [embeddings.embed_query(text) for text in mock_texts]
        
        # Add values cleanly into the local disk storage database blocks
        collection.add(
            documents=mock_texts,
            embeddings=raw_embeddings,
            metadatas=[{"event_id": str(event_one_id)}, {"event_id": str(event_two_id)}],
            ids=["id_1", "id_2"]
        )
        print("🧠 ChromaDB: Successfully written localized search vector tensors.")
        print("\n✨ SUCCESS: Hybrid database layer data synchronization complete!")

    except Exception as e:
        import traceback
        print("\n❌ CRITICAL: Seeding loop aborted due to execution block failure.")
        traceback.print_exc()
    finally:
        # Close connection tracking cleanly
        mongo_client.close()

if __name__ == "__main__":
    # Execute the event loop explicitly
    asyncio.run(run_standalone_seeder())