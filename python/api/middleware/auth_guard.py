import os
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> str:
    """
    Extracts the user ID from the Bearer token.
    Supports Firebase token verification and a simple Developer mock fallback.
    """
    if not credentials:
        # Fallback to checking header manually
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            raise HTTPException(status_code=401, detail="Missing authorization credentials")
    else:
        token = credentials.credentials
        
    # Mock authentication override
    if token.startswith("dev-") or os.getenv("MOCK_MODE", "true").lower() == "true":
        # Returns the part after "dev-" or a default dev user
        user_id = token if token.startswith("dev-") else f"dev-{token}"
        return user_id

    # Production Firebase authentication
    try:
        import firebase_admin
        from firebase_admin import auth
        
        # Initialize firebase if not already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
            
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception as e:
        print(f"Firebase token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")
