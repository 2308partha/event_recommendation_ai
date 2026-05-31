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
bounty_collection = db["bounties"]
venue_provider_collection = db["venue_providers"]
venue_request_collection = db["venue_requests"]
