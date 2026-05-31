import os
import json
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

_client: genai.Client | None = (
    genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
)

def _build_recommendation_prompt(user_profile: dict, event: dict) -> str:
    branch = user_profile.get("department", "General")
    skills = ", ".join(user_profile.get("skills", []))
    interests = ", ".join(user_profile.get("interests", []))
    
    event_title = event.get("title", "")
    event_description = event.get("description", "")
    event_tags = ", ".join(event.get("tags", []))
    host_college = event.get("location_name", "Unknown")

    return f"""
    You are an advanced AI Event Discovery Engine. 
    Analyze the following event for the specific student profile and return a JSON object.

    Student Profile:
    - Branch/Department: {branch}
    - Skills: {skills}
    - Interests: {interests}

    Event Details:
    - Title: {event_title}
    - Host/Location: {host_college}
    - Tags: {event_tags}
    - Description: {event_description}

    Task:
    1. Calculate a semantic_score (float between 0.0 and 1.0) on how relevant this event is for the student's career, networking, and technical growth.
    2. Provide a short, exciting personalized reason (max 2 sentences) addressing the user directly (e.g., "Since you love Python...").

    Respond ONLY in valid JSON matching this schema:
    {{
        "semantic_score": float,
        "reason": "string"
    }}
    """

def _parse_ai_response(ai_text: str) -> dict:
    default = {
        "semantic_score": 0.5,
        "reason": "This event matches your general profile."
    }
    
    try:
        if not ai_text:
            return default
            
        start_idx = ai_text.find('{')
        end_idx = ai_text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            clean_text = ai_text[start_idx:end_idx + 1]
        else:
            clean_text = ai_text

        data = json.loads(clean_text)
        
        return {
            "semantic_score": float(data.get("semantic_score", 0.5)),
            "reason": str(data.get("reason", default["reason"]))
        }
    except Exception as e:
        print(f"\n=== JSON PARSE ERROR in Recommendation ===")
        print(f"Error: {e}")
        print(f"Raw AI Text: {ai_text}")
        print(f"==========================================\n")
        return default

class RecommendationAIService:
    @staticmethod
    async def evaluate_event(user_profile: dict, event: dict) -> dict:
        if not _client:
            return {
                "semantic_score": 0.5,
                "reason": "AI service not configured — missing GEMINI_API_KEY."
            }

        prompt = _build_recommendation_prompt(user_profile, event)

        from pydantic import BaseModel
        class EventAnalysisResult(BaseModel):
            semantic_score: float
            reason: str

        contents = [
            types.Part.from_text(text=prompt)
        ]

        max_retries = 3
        ai_text = ""
        
        for attempt in range(max_retries):
            try:
                # Use a background thread or async generation if possible, but genai is generally blocking or has an async client
                # Since _client.aio is available in ai_service.py, we use it here.
                response = await _client.aio.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=0.2,          
                        max_output_tokens=256,
                        response_mime_type="application/json",
                        response_schema=EventAnalysisResult,
                    ),
                )
                ai_text = response.text
                break 
                
            except Exception as e:
                error_msg = str(e)
                if "503" in error_msg or "429" in error_msg:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2)
                        continue 
                return {
                    "semantic_score": 0.5,
                    "reason": f"AI service error: {error_msg}"
                }

        return _parse_ai_response(ai_text)
