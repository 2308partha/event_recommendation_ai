from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token
from models.event_model import EventCreateModel
from controllers.event_controller import (
    create_event_controller,
    get_all_events_controller,
    get_event_by_id_controller
)

router = APIRouter()

@router.post("/events")
async def create_event_route(
    event_data: EventCreateModel,
    clerk_user = Depends(verify_clerk_token)
):
    return await create_event_controller(event_data, clerk_user)

@router.get("/events")
async def get_all_events_route():
    # Publicly accessible list of all events (or we can secure it if needed)
    return await get_all_events_controller()

@router.get("/events/{event_id}")
async def get_event_route(event_id: str):
    return await get_event_by_id_controller(event_id)
