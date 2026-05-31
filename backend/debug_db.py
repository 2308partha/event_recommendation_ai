import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_url = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(mongo_url)
try:
    db = client.get_default_database()
except Exception:
    db = client["campus_event_ai"]

async def run():
    print("Database:", db.name)
    my_regs = await db["registrations"].find({"user_id": "mock_user_12345"}).to_list(100)
    print("My Regs:", my_regs)
    better = await db["registrations"].find({"user_id": {"$ne": "mock_user_12345"}}).to_list(100)
    print("Other Regs:", better)
    
    users = await db["users"].find({"clerk_user_id": "peer_user_99"}).to_list(100)
    print("Users:", users)

asyncio.run(run())
