import asyncio
from services.ai_service import AIService
from dotenv import load_dotenv

load_dotenv()

async def test_ai():
    user_data = {
        "full_name": "Test User",
        "college_name": "Test College",
        "organization": "Test Org",
        "department": "CS",
        "post": "President",
        "mobile_no": "1234567890",
        "club_note": "None"
    }
    # using a dummy image (just a tiny valid pixel or empty bytes if it doesn't crash)
    # Actually let's use a real small image or just text if it allows it.
    # We can just read an image or create a dummy one.
    image_bytes = b"dummy image bytes"
    mime_type = "image/jpeg"
    
    result = await AIService.analyze_id_card(user_data, image_bytes, mime_type)
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(test_ai())
