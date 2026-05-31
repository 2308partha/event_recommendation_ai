import asyncio
from database.db import user_collection, event_collection
from services.recommendation_service import RecommendationService

async def test():
    user = await user_collection.find_one()
    if not user:
        print("No user found!")
        return
    print('User:', user.get('email'))
    
    events = await event_collection.find({}).to_list(None)
    print("Total events in DB:", len(events))
    
    feed = await RecommendationService.generate_feed_for_user(user)
    print('Feed count:', len(feed))
    for f in feed:
        print(f" - {f.get('title')} | Score: {f.get('recommendation_score')}")

if __name__ == "__main__":
    asyncio.run(test())
