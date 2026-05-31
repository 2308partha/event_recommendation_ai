from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token, verify_admin_role, verify_student_role
from models.event_model import EventCreateModel
from controllers.event_controller import (
    create_event_controller,
    get_all_events_controller,
    get_event_by_id_controller,
    get_admin_events_controller
)

router = APIRouter()

# 🔒 ADMIN ONLY: Create an Event
@router.post("/events")
async def create_event_route(
    event_data: EventCreateModel,
    clerk_user = Depends(verify_admin_role)
):
    return await create_event_controller(event_data, clerk_user)

# 🔒 ADMIN ONLY: Get events created by THIS admin
@router.get("/admin/events")
async def get_my_created_events_route(
    clerk_user = Depends(verify_admin_role)
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_id = claims.get("sub")
    return await get_admin_events_controller(admin_id)

# 🔓 ANY AUTHENTICATED USER: Get all events (Global Feed — admins + students both need this)
@router.get("/events")
async def get_all_events_route(clerk_user = Depends(verify_clerk_token)):
    return await get_all_events_controller()

# 🔓 EVERYONE: Get single event details (both students and admins need to see details)
@router.get("/events/{event_id}")
async def get_event_route(event_id: str, clerk_user = Depends(verify_clerk_token)):
    return await get_event_by_id_controller(event_id)