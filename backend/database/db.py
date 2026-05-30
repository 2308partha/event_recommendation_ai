from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import (
    DATABASE_URL
)

client = AsyncIOMotorClient(DATABASE_URL)


# DATABASE

db = client["event_recommendation_ai"]


# COLLECTIONS

event_collection = db["events"]
user_collection = db["users"]
admin_collection = db["admins"]
registration_collection = db["registrations"]
verification_collection = db["verifications"]
