import urllib.request
import json

try:
    url = "http://localhost:8000/api/v1/github-feed/events/recommendations"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    print(f"Success: {data.get('success')}")
    print(f"Count: {data.get('count')}")
except Exception as e:
    print(f"Error: {e}")
