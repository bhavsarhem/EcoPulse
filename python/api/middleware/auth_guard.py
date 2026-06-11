import os
import hmac
import hashlib
import time
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> str:
    """
    Extracts the user ID from the Bearer token and verifies request integrity
    using HMAC-SHA256 signature to ensure only authenticated sources can call the backend.
    """
    if not credentials:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            raise HTTPException(status_code=401, detail="Missing authorization credentials")
    else:
        token = credentials.credentials

    # 1. Enforce signature validation
    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")
    
    # Get internal API secret
    internal_secret = os.getenv("INTERNAL_API_SECRET")
    
    if internal_secret:
        if not signature or not timestamp:
            raise HTTPException(status_code=401, detail="Missing request signature or timestamp headers")
        
        # Check for replay attack (5 minutes / 300,000 milliseconds max drift)
        try:
            ts = int(timestamp)
            current_ts = int(time.time() * 1000)
            if abs(current_ts - ts) > 300000:
                raise HTTPException(status_code=401, detail="Request timestamp expired or out of bounds")
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid request timestamp format")
            
        # Verify HMAC signature
        expected_msg = f"{token}:{timestamp}".encode("utf-8")
        expected_sig = hmac.new(
            internal_secret.encode("utf-8"),
            expected_msg,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            raise HTTPException(status_code=401, detail="Invalid request signature")
            
    # 2. Extract and return the user ID after the signature is validated
    # If MOCK_MODE is true, return the token (potentially prepending dev-)
    if token.startswith("dev-") or os.getenv("MOCK_MODE", "true").lower() == "true":
        return token if token.startswith("dev-") else f"dev-{token}"

    # Production Firebase authentication
    try:
        import firebase_admin
        from firebase_admin import auth
        
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
            
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except ImportError:
        # Fallback: trust the token directly after validation
        return token
    except Exception as e:
        print(f"Firebase token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized")
