# chatbot/manager.py
import json
import os
from redis import Redis
from langchain_core.messages import messages_from_dict, messages_to_dict

# In-memory fallback
_in_memory_cache = {}
_use_redis = False

try:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = Redis.from_url(redis_url, decode_responses=True)
    redis_client.ping()
    _use_redis = True
except Exception as e:
    print(f"Redis not available, using in-memory cache. Error: {e}")

def get_redis_chat_history(session_id: str) -> list:
    redis_key = f"nexus_chat:{session_id}"
    
    if _use_redis:
        try:
            saved_data = redis_client.get(redis_key)
            if not saved_data: return []
            return messages_from_dict(json.loads(saved_data))
        except Exception:
            return []
    else:
        saved_data = _in_memory_cache.get(redis_key)
        if not saved_data: return []
        return messages_from_dict(json.loads(saved_data))

def save_redis_chat_history(session_id: str, history: list):
    redis_key = f"nexus_chat:{session_id}"
    if len(history) > 10:
        history = history[-10:]
    dict_messages = messages_to_dict(history)
    
    if _use_redis:
        try:
            redis_client.set(redis_key, json.dumps(dict_messages), ex=86400)
        except Exception:
            pass
    else:
        _in_memory_cache[redis_key] = json.dumps(dict_messages)