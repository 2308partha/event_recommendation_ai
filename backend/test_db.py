import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_url = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(mongo_url)
db = client.get_default_database() if client.get_default_database() else client["test"]

async def run():
    docs = await db["registrations"].find().to_list(length=100)
    print(docs)

asyncio.run(run())
