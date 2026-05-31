from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from middleware.auth_middleware import verify_clerk_token
from models.venue_model import VenueProviderRequestModel, VenueRequestCreateModel
from controllers.venue_controller import (
    verify_venue_provider_controller,
    create_venue_request_controller,
    get_open_venue_requests_controller,
    get_my_venue_requests_controller,
    accept_venue_request_controller
)

router = APIRouter()

# ----------------------------
# VENUE PROVIDER VERIFICATION
# ----------------------------

@router.put("/verify-provider")
async def verify_venue_provider(
    id_card: UploadFile = File(...),
    institution_name: str = Form(...),
    address: str = Form(...),
    contact_email: str = Form(...),
    contact_phone: str = Form(...),
    current_user=Depends(verify_clerk_token)
):
    try:
        contents = await id_card.read()
        mime_type = id_card.content_type
        
        request_data = VenueProviderRequestModel(
            institution_name=institution_name,
            address=address,
            contact_email=contact_email,
            contact_phone=contact_phone
        )
        
        return await verify_venue_provider_controller(request_data, contents, mime_type, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# VENUE MARKETPLACE REQUESTS
# ----------------------------

@router.post("/requests")
async def create_venue_request(
    request_data: VenueRequestCreateModel,
    current_user=Depends(verify_clerk_token)
):
    return await create_venue_request_controller(request_data, current_user)

@router.get("/requests")
async def get_open_venue_requests():
    return await get_open_venue_requests_controller()

@router.get("/my-requests")
async def get_my_venue_requests(
    current_user=Depends(verify_clerk_token)
):
    return await get_my_venue_requests_controller(current_user)

@router.post("/requests/{request_id}/accept")
async def accept_venue_request(
    request_id: str,
    current_user=Depends(verify_clerk_token)
):
    return await accept_venue_request_controller(request_id, current_user)
