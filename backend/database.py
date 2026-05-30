# database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Global client cache pointer
_mongo_client = None

def get_motor_client():
    """Lazily initializes and caches the asynchronous Motor client connection."""
    global _mongo_client
    if _mongo_client is None:
        mongo_url = os.getenv("MONGODB_URL")
        if not mongo_url:
            raise ValueError("MONGODB_URL environment variable is missing from your .env file!")
        _mongo_client = AsyncIOMotorClient(mongo_url)
    return _mongo_client

async def get_db():
    """
    FastAPI Dependency Injector Generator.
    Yields the database instance safely to your routing contexts.
    """
    client = get_motor_client()
    
    # Safely extract default database name out of URI or fall back to your app collection
    try:
        db = client.get_default_database()
    except Exception:
        db = None
        
    if db is None:
        db = client["test"]  # Make sure this matches where your seed_data.py pushed records!
        
    yield db