import os
from dotenv import load_dotenv
load_dotenv()
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Optional

class IDAnalysisResult(BaseModel):
    is_valid: bool
    extracted_name: Optional[str]
    extracted_registration_number: Optional[str]
    confidence_score: float
    reason: str
    is_admin: bool

client = genai.Client()
res = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=['Respond with dummy data.'],
    config=types.GenerateContentConfig(
        response_mime_type='application/json',
        response_schema=IDAnalysisResult
    )
)
print(repr(res.text))
