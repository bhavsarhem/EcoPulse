import io
import hmac
import hashlib
import time
import os
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
