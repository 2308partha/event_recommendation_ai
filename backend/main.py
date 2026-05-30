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
#from routes.feed_routes import router as feed_router
from routes.registration_routes import router as registration_router

app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
app.include_router(event_router, prefix="/api", tags=["Events"])
#app.include_router(feed_router, prefix="/api", tags=["Feed"])
app.include_router(registration_router, prefix="/api", tags=["Registrations"])