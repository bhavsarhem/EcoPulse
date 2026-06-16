import os
os.environ["MOCK_MODE"] = "true"

import io
import hmac
import hashlib
import time
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "snapcarbon-backend"}

def test_scan_endpoint_unauthorized():
    # Calling scan without Authorization header
    response = client.post(
        "/api/scan",
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 401

def test_scan_endpoint_success_mock():
    # Force mock mode in test environment
    os.environ["MOCK_MODE"] = "true"
    token = "dev-user-test"
    timestamp = str(int(time.time() * 1000))
    internal_secret = os.getenv("INTERNAL_API_SECRET", "ecopulse_signature_key_2026_06_11_secure")
    
    # Calculate HMAC signature
    message = f"{token}:{timestamp}".encode("utf-8")
    signature = hmac.new(
        internal_secret.encode("utf-8"),
        message,
        hashlib.sha256
    ).hexdigest()
    
    response = client.post(
        "/api/scan",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Signature": signature,
            "X-Timestamp": timestamp
        },
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["scan_type"] == "meal"
    assert len(data["items"]) > 0
    assert "total_co2e_kg" in data
    assert "carbon_tier" in data
    assert "green_alternatives" in data

def test_scan_endpoint_invalid_signature():
    # Calling scan with invalid signature
    token = "dev-user-test"
    timestamp = str(int(time.time() * 1000))
    response = client.post(
        "/api/scan",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Signature": "invalid_sig",
            "X-Timestamp": timestamp
        },
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid request signature"

def test_scan_endpoint_expired_timestamp():
    # Calling scan with expired timestamp
    token = "dev-user-test"
    timestamp = str(int((time.time() - 600) * 1000)) # 10 minutes ago
    internal_secret = os.getenv("INTERNAL_API_SECRET", "ecopulse_signature_key_2026_06_11_secure")
    
    # Calculate HMAC signature
    message = f"{token}:{timestamp}".encode("utf-8")
    signature = hmac.new(
        internal_secret.encode("utf-8"),
        message,
        hashlib.sha256
    ).hexdigest()
    
    response = client.post(
        "/api/scan",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Signature": signature,
            "X-Timestamp": timestamp
        },
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 401
    assert "Request timestamp expired" in response.json()["detail"]

def test_scan_endpoint_rate_limiting():
    # Set a user-id for rate limiting test
    token = "rate-limit-user"
    internal_secret = os.getenv("INTERNAL_API_SECRET", "ecopulse_signature_key_2026_06_11_secure")
    
    from api.middleware.rate_limiter import scan_history
    # Artificially populate scan history to reach 20 scans per hour limit
    scan_history[f"dev-{token}"] = [time.time()] * 20
    
    timestamp = str(int(time.time() * 1000))
    message = f"{token}:{timestamp}".encode("utf-8")
    signature = hmac.new(
        internal_secret.encode("utf-8"),
        message,
        hashlib.sha256
    ).hexdigest()
    
    response = client.post(
        "/api/scan",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Signature": signature,
            "X-Timestamp": timestamp
        },
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]
    
    # Clear rate limit history for that user so it doesn't leak to other tests
    scan_history[f"dev-{token}"].clear()

def test_scan_endpoint_blocked_user():
    token = "blocked-user-test"
    internal_secret = os.getenv("INTERNAL_API_SECRET", "ecopulse_signature_key_2026_06_11_secure")
    
    # Block the user in the database pipeline
    from api.middleware.auth_guard import db_pipeline
    db_pipeline.block_entity(f"dev-{token}", reason="Test Block")
    
    timestamp = str(int(time.time() * 1000))
    message = f"{token}:{timestamp}".encode("utf-8")
    signature = hmac.new(
        internal_secret.encode("utf-8"),
        message,
        hashlib.sha256
    ).hexdigest()
    
    response = client.post(
        "/api/scan",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Signature": signature,
            "X-Timestamp": timestamp
        },
        data={"scan_type": "meal"},
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 403
    assert "permanently blocked" in response.json()["detail"]
    
    # Clean up local blocklist.json file if needed
    try:
        import json
        with open(db_pipeline.blocklist_file, "w") as f:
            json.dump([], f)
        db_pipeline.blocked_cache.clear()
        db_pipeline.last_cache_update = 0
    except:
        pass
