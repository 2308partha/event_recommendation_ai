from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_student_role, verify_admin_role
from models.registration_model import RegistrationCreateModel, RegistrationUpdateModel
from controllers.registration_controller import (
    create_registration_controller,
    get_my_registrations_controller,
    get_event_attendees_controller,
    update_registration_status_controller
)

router = APIRouter()

# ---------------------------------------------------------
# 🔓 STUDENT ROUTES
# ---------------------------------------------------------

# 1. Register for an event (or register a team)
@router.post("/registrations")
async def register_for_event_route(
    registration_data: RegistrationCreateModel,
    clerk_user = Depends(verify_student_role)
):
    return await create_registration_controller(registration_data, clerk_user)

# 2. Get my registration history (including events friends registered me for)
@router.get("/registrations/me")
async def my_registrations_route(
    clerk_user = Depends(verify_student_role)
):
    return await get_my_registrations_controller(clerk_user)


# ---------------------------------------------------------
# 🔒 ADMIN ROUTES
# ---------------------------------------------------------

# 3. View all attendees for a specific event
@router.get("/admin/events/{event_id}/registrations")
async def get_attendees_route(
    event_id: str,
    clerk_user = Depends(verify_admin_role)
):
    return await get_event_attendees_controller(event_id, clerk_user)

# 4. Update a student's status (Approve/Reject) or mark as attended
@router.patch("/admin/registrations/{registration_id}")
async def update_registration_route(
    registration_id: str,
    update_data: RegistrationUpdateModel,
    clerk_user = Depends(verify_admin_role)
):
    return await update_registration_status_controller(registration_id, update_data, clerk_user)