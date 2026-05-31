from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token, verify_admin_role, verify_student_role
from models.bounty_model import BountyCreateModel
from controllers.bounty_controller import (
    create_bounty_controller,
    get_open_bounties_controller,
    get_admin_bounties_controller,
    apply_bounty_controller,
    approve_applicant_controller,
    complete_bounty_controller
)

router = APIRouter()

# 🔓 STUDENTS & ADMINS: Get all open bounties
@router.get("/")
async def get_bounties_route():
    # We could add auth here but previously it was open in frontend
    return await get_open_bounties_controller()

# 🔓 ALL USERS: Create a Bounty
@router.post("/")
async def create_bounty_route(
    bounty_data: BountyCreateModel,
    clerk_user = Depends(verify_clerk_token)
):
    return await create_bounty_controller(bounty_data, clerk_user)

# 🔒 ADMIN ONLY: Get bounties created by this admin
@router.get("/admin")
async def get_my_bounties_route(
    clerk_user = Depends(verify_admin_role)
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_id = claims.get("sub")
    return await get_admin_bounties_controller(admin_id)

# 🔒 ANY USER: Apply for a bounty
@router.post("/{bounty_id}/apply")
async def apply_bounty_route(
    bounty_id: str,
    clerk_user = Depends(verify_clerk_token)
):
    return await apply_bounty_controller(bounty_id, clerk_user)

# 🔒 BOUNTY CREATOR: Approve an applicant
@router.post("/{bounty_id}/approve/{applicant_id}")
async def approve_applicant_route(
    bounty_id: str,
    applicant_id: str,
    clerk_user = Depends(verify_clerk_token)
):
    return await approve_applicant_controller(bounty_id, applicant_id, clerk_user)

# 🔒 ADMIN ONLY: Mark bounty as complete
@router.post("/{bounty_id}/complete")
async def complete_bounty_route(
    bounty_id: str,
    clerk_user = Depends(verify_admin_role)
):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    admin_id = claims.get("sub")
    return await complete_bounty_controller(bounty_id, admin_id)
