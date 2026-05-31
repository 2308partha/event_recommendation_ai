from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Event Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {"message": "Backend Running"}

# ── Routes ──────────────────────────────────────────
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router
from routes.event_routes import router as event_router
from routes.incubation_routes import router as incubation_router
from routes.bounty_routes import router as bounty_router
from routes.mentorship_routes import router as mentorship_router
from routes.hacker_room_routes import router as hacker_room_router
#from routes.feed_routes import router as feed_router
from routes.registration_routes import router as registration_router
from routes.skill_routes import router as skill_router
from routes.venue_routes import router as venue_router

app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
app.include_router(event_router, prefix="/api", tags=["Events"])
app.include_router(incubation_router, prefix="/api/incubator", tags=["Incubator"])
app.include_router(bounty_router, prefix="/api/bounties", tags=["Bounties"])
app.include_router(mentorship_router, prefix="/api/mentorship", tags=["Mentorship"])
app.include_router(hacker_room_router, prefix="/api/hacker-rooms", tags=["Hacker Rooms"])
#app.include_router(feed_router, prefix="/api", tags=["Feed"])
app.include_router(registration_router, prefix="/api", tags=["Registrations"])
app.include_router(skill_router, prefix="/api/skills", tags=["Skills"])
app.include_router(venue_router, prefix="/api/venues", tags=["Venues"])

from routes.recommendation_router import router as github_rec_router
from routes.chat_router import router as github_chat_router

app.include_router(github_rec_router, prefix="/api/v1/github-feed", tags=["Github Feed"])
app.include_router(github_chat_router, prefix="/api/v1/github-feed", tags=["Github Chatbot"])