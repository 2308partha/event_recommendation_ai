from fastapi import APIRouter, Depends, Body
from middleware.auth_middleware import verify_clerk_token
from models.user_model import UserUpdateModel, UserCreateModel
from controllers.user_controller import (
    create_user_controller,
    get_user_controller,
    update_user_controller
)

router = APIRouter()

@router.post("/user")
async def create_user_route(clerk_user = Depends(verify_clerk_token)):
    return await create_user_controller(clerk_user)

@router.get("/user")
async def get_user_route(clerk_user = Depends(verify_clerk_token)):
    return await get_user_controller(clerk_user)

@router.put("/user")
async def update_user_route(
    update_data: UserUpdateModel,
    clerk_user = Depends(verify_clerk_token)
):
    return await update_user_controller(clerk_user, update_data)