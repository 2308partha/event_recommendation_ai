import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from controllers.user_controller import get_user_analytics_controller
from database.db import user_collection

async def main():
    user = await user_collection.find_one({})
    if user:
        clerk_id = user.get("clerk_user_id")
        print(f"Testing with user: {clerk_id}")
        mock_clerk_user = {"sub": clerk_id}
        try:
            res = await get_user_analytics_controller(mock_clerk_user)
            print("SUCCESS:")
            print(res)
        except Exception as e:
            print("ERROR:")
            print(e)
    else:
        print("No users found in database.")

if __name__ == "__main__":
    asyncio.run(main())
