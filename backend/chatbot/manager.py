# chatbot/manager.py
import json
import os
from redis import Redis
from langchain_core.messages import messages_from_dict, messages_to_dict

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = Redis.from_url(redis_url, decode_responses=True)

def get_redis_chat_history(session_id: str) -> list:
    redis_key = f"nexus_chat:{session_id}"
    saved_data = redis_client.get(redis_key)
    if not saved_data: return []
    try:
        return messages_from_dict(json.loads(saved_data))
    except Exception:
        return []

def save_redis_chat_history(session_id: str, history: list):
    redis_key = f"nexus_chat:{session_id}"
    if len(history) > 10:
        history = history[-10:]
    dict_messages = messages_to_dict(history)
    redis_client.set(redis_key, json.dumps(dict_messages), ex=86400)