import io
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
    # Calling scan with a mock dev user token (triggering local mock mode)
    response = client.post(
        "/api/scan",
        headers={"Authorization": "Bearer dev-user-test"},
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
