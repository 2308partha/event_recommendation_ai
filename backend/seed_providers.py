import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models.provider_model import ProviderModel, ProviderServiceModel
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "campus_network")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

mock_providers = [
    {
        "name": "LensFlare Studios",
        "provider_type": "Vendor",
        "category": "Photography",
        "city": "Durgapur",
        "contact_email": "hello@lensflare.com",
        "description": "Premium event photography and videography with drones.",
        "banner_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
        "is_verified": True,
        "trust_score": 92.5,
        "total_completed_bookings": 45,
        "average_rating": 4.8,
        "min_budget": 5000,
        "services": [
            {"service_name": "Event Photography (1 Day)", "description": "2 photographers, unlimited raw + 100 edited.", "starting_price": 5000},
            {"service_name": "Cinematic Aftermovie", "description": "3-minute 4K recap video.", "starting_price": 8000}
        ]
    },
    {
        "name": "TechTrove EdTech",
        "provider_type": "Sponsor",
        "category": "Technology",
        "city": "Remote",
        "contact_email": "sponsorships@techtrove.io",
        "description": "We sponsor college hackathons and provide free cloud credits.",
        "banner_url": "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800",
        "is_verified": True,
        "trust_score": 98.0,
        "total_completed_bookings": 120,
        "average_rating": 4.9,
        "min_budget": 0, # Sponsors give money, not take
        "services": [
            {"service_name": "Title Sponsorship", "description": "1L INR + 50 Cloud Credits. Needs logo on main stage.", "starting_price": 100000},
            {"service_name": "Swag Partner", "description": "Free T-shirts for all winners.", "starting_price": 0}
        ]
    },
    {
        "name": "NIT Durgapur Main Auditorium",
        "provider_type": "Venue",
        "category": "Auditorium",
        "city": "Durgapur",
        "contact_email": "admin@nitdgp.ac.in",
        "description": "Massive 2000-seater AC auditorium with stage lighting and dual projectors.",
        "banner_url": "https://images.unsplash.com/photo-1507676184212-d0c30a597a1f?auto=format&fit=crop&q=80&w=800",
        "is_verified": True,
        "trust_score": 95.0,
        "total_completed_bookings": 300,
        "average_rating": 4.5,
        "min_budget": 20000,
        "max_capacity": 2000,
        "services": [
            {"service_name": "Full Day Booking", "description": "9 AM to 9 PM usage.", "starting_price": 25000}
        ]
    },
    {
        "name": "SoundWave Rentals",
        "provider_type": "Vendor",
        "category": "Sound & Lighting",
        "city": "Durgapur",
        "contact_email": "soundwave@gmail.com",
        "description": "JBL Line Array systems and stage lighting.",
        "banner_url": "https://images.unsplash.com/photo-1516280440504-45ea078ffa9f?auto=format&fit=crop&q=80&w=800",
        "is_verified": False,
        "trust_score": 80.0,
        "total_completed_bookings": 12,
        "average_rating": 4.0,
        "min_budget": 10000,
        "services": [
            {"service_name": "Basic PA System", "description": "2 Speakers + 2 Mics.", "starting_price": 4000},
            {"service_name": "Concert Setup", "description": "Line array, subs, monitors, mixing console.", "starting_price": 25000}
        ]
    },
    {
        "name": "Dr. Arindam Ghosh",
        "provider_type": "Speaker",
        "category": "Artificial Intelligence",
        "city": "Remote",
        "contact_email": "arindam.ai@gmail.com",
        "description": "Ex-Google AI Researcher. Speaks about LLMs and Agentic AI.",
        "banner_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
        "is_verified": True,
        "trust_score": 99.0,
        "total_completed_bookings": 25,
        "average_rating": 5.0,
        "min_budget": 0,
        "services": [
            {"service_name": "Keynote Speech", "description": "45-minute remote session on GenAI.", "starting_price": 0}
        ]
    }
]

async def seed():
    await db["providers"].drop()
    
    docs = []
    for p in mock_providers:
        # Validate via Pydantic
        model = ProviderModel(**p)
        docs.append(model.model_dump())
        
    await db["providers"].insert_many(docs)
    print(f"Successfully inserted {len(docs)} mock marketplace providers!")

if __name__ == "__main__":
    asyncio.run(seed())
