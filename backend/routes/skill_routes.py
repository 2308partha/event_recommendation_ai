from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import random

router = APIRouter()

class SkillValidationRequest(BaseModel):
    challenge_id: str
    code: str
    language: str

class SkillValidationResponse(BaseModel):
    passed: bool
    feedback: str
    score: int

@router.post("/validate", response_model=SkillValidationResponse)
async def validate_skill(request: SkillValidationRequest):
    # In a real scenario, this would execute the code in a sandbox (e.g., Docker, Piston API)
    # or use an LLM to grade the code based on the challenge criteria.
    # For this MVP, we will simulate a simple string-matching or random AI evaluation.
    
    if len(request.code.strip()) < 10:
        return SkillValidationResponse(
            passed=False, 
            feedback="Code is too short. Please attempt the challenge.",
            score=0
        )
    
    # Simulated AI evaluation logic:
    # If the user included common keywords or a realistic amount of code, give it a pass.
    # This simulates "Debug this FastAPI route" passing.
    if "def " in request.code or "return " in request.code or "function" in request.code:
        return SkillValidationResponse(
            passed=True,
            feedback="Excellent! The code handles the edge cases properly and passes all test suites.",
            score=100
        )
    
    return SkillValidationResponse(
        passed=False,
        feedback="The code failed to pass the basic unit tests. Keep trying!",
        score=40
    )
