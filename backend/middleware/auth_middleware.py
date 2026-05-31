from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import (
    AuthenticateRequestOptions
)

from config.settings import (
    CLERK_SECRET_KEY
)

clerk_sdk = Clerk(
    bearer_auth=CLERK_SECRET_KEY
)

# This tells Swagger UI that we need a Bearer token
security = HTTPBearer()

async def verify_clerk_token(
    request: Request,
    token_auth: HTTPBearer = Security(security)
):

    request_state = clerk_sdk.authenticate_request(
        request,
        AuthenticateRequestOptions(
            authorized_parties=[
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5175"
            ]
        )
    )

    if not request_state.is_signed_in:
        reason = request_state.reason.value[1] if hasattr(request_state.reason, "value") else str(request_state.reason)
        print(f"CLERK AUTH REJECTED: {reason}")
        raise HTTPException(
            status_code=401,
            detail=f"Unauthorized: {reason}"
        )

    request.state.user = request_state.payload

    return request_state.payload
# 🔒 THE NEW ADMIN LOCK
async def verify_admin_role(clerk_user = Depends(verify_clerk_token)):
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    
    # 🔴 ADD THESE 3 LINES TO DEBUG
    print(f"\n=== DEBUG TOKEN CLAIMS ===")
    print(claims)
    print(f"==========================\n")

    metadata = claims.get("metadata", {})

    if metadata.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Admin access required to perform this action."
        )

    return clerk_user
# 🔒 THE NEW STUDENT LOCK
async def verify_student_role(clerk_user = Depends(verify_clerk_token)):
    """
    Checks if the user's publicMetadata contains the student role.
    Blocks Admins and Unregistered users.
    """
    claims = clerk_user if isinstance(clerk_user, dict) else getattr(clerk_user, "claims", {})
    metadata = claims.get("metadata", {})

    if metadata.get("role") != "student":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Only students can access the global event feed."
        )

    return clerk_user