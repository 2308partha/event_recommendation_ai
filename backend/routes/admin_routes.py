from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import json
from middleware.auth_middleware import verify_clerk_token
from controllers.admin_controller import create_admin, verify_admin, get_admin
from models.admin_model import AdminRequestModel, AdminResponseModel

router = APIRouter()

@router.post("/admin")
async def register_admin_route(clerk_user = Depends(verify_clerk_token)):
    return await create_admin(clerk_user)

@router.put("/verify")
async def verify_admin_route(
    request_data: str = Form(...),
    id_card: UploadFile = File(...),
    clerk_user = Depends(verify_clerk_token)
) -> AdminResponseModel:
    try:
        data_dict = json.loads(request_data)
        parsed_request_data = AdminRequestModel(**data_dict)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid request data: {e}")

    return await verify_admin(
        clerk_user=clerk_user,
        request_data=parsed_request_data,
        id_card=id_card
    ) 

@router.get("/admin")
async def get_admin_route(clerk_user = Depends(verify_clerk_token)):
    return await get_admin(clerk_user)

# Assuming you have an analytics service
from services.analytics_service import AnalyticsService

@router.get("/admin/analytics")
async def get_admin_analytics_route(clerk_user = Depends(verify_clerk_token)):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    clerk_user_id = claims.get("sub")
    return await AnalyticsService.get_admin_dashboard_metrics(clerk_user_id)