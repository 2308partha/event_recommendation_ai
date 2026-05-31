import asyncio
from database.db import db
from recommendation.engine import RecommendationEngine
from pprint import pprint

async def run_test():
    try:
        print("Starting test...")
        # Assume a dummy user ID or None
        user_id = None
        feed = await RecommendationEngine.get_personalized_feed(db=db, user_id=user_id)
        print(f"Returned {len(feed)} items.")
        if feed:
            print("First item:", feed[0].get('title'))
            print("AI Reason:", feed[0].get('personalized_reason'))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_test())
