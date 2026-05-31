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

def _safe_str(val) -> str:
    return str(val or "").replace("{", "").replace("}", "").strip()[:300]

def _build_prompt(user_data: dict) -> str:
    organiser_type = user_data.get('organiser_type', 'college')
    
    if organiser_type == 'college':
        org_check = f"2. college_match: Does the ID card visibly mention the claimed college '{_safe_str(user_data.get('college_name'))}'?"
        status_check = "3. year_valid: Does the ID card indicate they are a current student with a year of studying in 3rd or final year (e.g., not expired)?"
        extra_checks = ""
    elif organiser_type == 'venue_provider':
        org_check = f"2. college_match: Does the document/ID visibly mention the claimed venue institution '{_safe_str(user_data.get('organization'))}'?"
        status_check = "3. year_valid: Does this look like an official, valid document belonging to the institution?"
        extra_checks = """
        Also, evaluate the following for the Venue Provider:
        5. capacity_check: Does the document or any provided images indicate this is a legitimate physical venue? (Return True if yes)
        6. trust_score: Assign an integer between 0 and 100 representing how confident you are this is a real, high-quality venue provider.
        """
    else:
        org_check = f"2. college_match: Does the ID card visibly mention the claimed company/organization '{_safe_str(user_data.get('company_name') or user_data.get('organization'))}'?"
        status_check = "3. year_valid: Does the ID card appear to be a valid, unexpired professional/employee ID?"
        extra_checks = ""

    return f"""
    You are an advanced AI validation and fraud-detection assistant for a marketplace verification system.
    The user claims:
      - Account Type: '{organiser_type}'
      - Name: '{_safe_str(user_data.get('full_name'))}'
      - Organization/College: '{_safe_str(user_data.get('organization'))}'
      - Position/Designation: '{_safe_str(user_data.get('post') or user_data.get('designation'))}'
      
    Analyze the provided images and perform STRICT validations.
    Check the following and return true/false for each:
    1. name_match: Is the name on the document reasonably similar to the claimed name? (If no name is claimed or required, assume true)
    {org_check}
    {status_check}
    4. is_authentic: Does the document look genuine (no obvious photoshop/digital alteration)?
    {extra_checks}
    
    If ANY of the core checks (1-4) are false, set "is_valid" to false and provide a clear "reason".
    If ALL core checks are true, set "is_valid" to true and set reason to "Approved".
    """

def _parse_ai_response(ai_text: str) -> dict:
    default = {
        "raw_text": ai_text,
        "reason": "Could not parse AI response.",
        "is_valid": False,
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
            "raw_text": ai_text,
            "reason": data.get("reason", "No reason provided."),
            "is_valid": bool(data.get("is_valid", False)),
            "extracted": {
                "name_match": data.get("name_match", False),
                "college_match": data.get("college_match", False),
                "year_valid": data.get("year_valid", False),
                "is_authentic": data.get("is_authentic", False),
                "trust_score": data.get("trust_score", 80),
                "capacity_check": data.get("capacity_check", True)
            },
        }
    except Exception as e:
        print(f"\n=== JSON PARSE ERROR ===")
        print(f"Error: {e}")
        print(f"Raw AI Text: {ai_text}")
        print(f"========================\n")
        return default

class AIService:

    @staticmethod
    async def analyze_id_card(
        user_data: dict, image_bytes: bytes, mime_type: str
    ) -> dict:
        if not _client:
            return {
                "is_valid": False,
                "reason": "AI service not configured — missing GEMINI_API_KEY.",
                "raw_text": "",
            }

        prompt = _build_prompt(user_data)

        from pydantic import BaseModel
        from typing import Optional
        
        # CHANGED: We now ask for Booleans instead of Strings to bypass the PII filter!
        class IDAnalysisResult(BaseModel):
            name_match: bool
            college_match: bool
            year_valid: bool
            is_authentic: bool
            is_valid: bool
            reason: str
            capacity_check: Optional[bool] = None
            trust_score: Optional[int] = None

        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            types.Part.from_text(text=prompt)
        ]

        max_retries = 3
        ai_text = ""
        
        for attempt in range(max_retries):
            try:
                response = await _client.aio.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=0.1,          
                        max_output_tokens=1024,
                        response_mime_type="application/json",
                        response_schema=IDAnalysisResult,
                        # Using BLOCK_NONE which is the official SDK parameter for turning filters off completely
                        safety_settings=[
                            types.SafetySetting(
                                category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                                threshold=types.HarmBlockThreshold.BLOCK_NONE,
                            ),
                            types.SafetySetting(
                                category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                                threshold=types.HarmBlockThreshold.BLOCK_NONE,
                            ),
                            types.SafetySetting(
                                category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold=types.HarmBlockThreshold.BLOCK_NONE,
                            ),
                            types.SafetySetting(
                                category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                                threshold=types.HarmBlockThreshold.BLOCK_NONE,
                            ),
                        ]
                    ),
                )
                ai_text = response.text
                break 
                
            except Exception as e:
                error_msg = str(e)
                
                if "503" in error_msg or "429" in error_msg:
                    if attempt < max_retries - 1:
                        print(f"AI server busy. Retrying... (Attempt {attempt + 1})")
                        await asyncio.sleep(2)
                        continue 
                
                return {
                    "is_valid": False,
                    "reason": f"AI service error: {error_msg}",
                    "raw_text": "",
                }

        print("=== AI RESPONSE ===")
        print(ai_text)
        print("===================")

        return _parse_ai_response(ai_text)