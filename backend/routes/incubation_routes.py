from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random

router = APIRouter()

class IncubationRequest(BaseModel):
    project_name: str
    description: str

class IncubationResponse(BaseModel):
    status: str
    pitch_deck: str
    aws_credits: str
    vc_visible: bool

@router.post("/start", response_model=IncubationResponse)
async def start_incubation(request: IncubationRequest):
    # Mock AI Pitch Deck Generation
    mock_pitch_deck = f"""# Pitch Deck: {request.project_name}

## 1. The Problem
Current solutions are outdated and do not leverage the latest AI technology.

## 2. The Solution
{request.description}

## 3. Market Size
TAM: $10B+.

## 4. Business Model
B2B SaaS with a freemium student tier.

## 5. Why Now?
The time is right to disrupt this space.
"""

    return IncubationResponse(
        status="success",
        pitch_deck=mock_pitch_deck,
        aws_credits="$1,000 Activate Credits Granted",
        vc_visible=True
    )
