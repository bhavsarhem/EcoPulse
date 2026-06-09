from services.gemini_client import GeminiClient

def test_gemini_client_mock_mode():
    client = GeminiClient()
    client.mock_mode = True # Force mock mode
    
    # Test meal type
    res = client.analyze_image(b"dummy_bytes", "meal")
    assert "scan_id" in res
    assert res["scan_type"] == "meal"
    assert len(res["items"]) > 0
    assert "total_co2e_kg" in res
    assert "carbon_tier" in res
    assert "green_alternatives" in res
    
    # Test receipt type
    res_receipt = client.analyze_image(b"dummy_bytes", "receipt")
    assert res_receipt["scan_type"] == "receipt"
    
    # Test label type
    res_label = client.analyze_image(b"dummy_bytes", "product_label")
    assert res_label["scan_type"] == "product_label"
