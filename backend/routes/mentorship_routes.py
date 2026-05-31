from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

class MentorSlot(BaseModel):
    id: str
    mentor_name: str
    mentor_skills: List[str]
    time: str
    cost_karma: int
    available: bool

# Mock database
SLOTS = [
    MentorSlot(id="m1", mentor_name="Alice (Senior Backend Dev)", mentor_skills=["Python", "FastAPI", "System Design"], time=(datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"), cost_karma=50, available=True),
    MentorSlot(id="m2", mentor_name="Bob (Hackathon Winner)", mentor_skills=["React", "Tailwind", "Pitching"], time=(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d %H:%M"), cost_karma=40, available=True),
]

@router.get("/slots", response_model=List[MentorSlot])
async def get_slots():
    return [s for s in SLOTS if s.available]

@router.post("/book/{slot_id}")
async def book_slot(slot_id: str):
    for s in SLOTS:
        if s.id == slot_id:
            if s.available:
                s.available = False
                return {"message": f"Successfully booked {s.mentor_name}'s office hours! 50 Karma points deducted.", "slot": s}
            else:
                return {"error": "Slot already booked"}
    return {"error": "Slot not found"}
