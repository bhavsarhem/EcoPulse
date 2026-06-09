import os
import time
from services.bigquery_pipeline import BigQueryPipeline

def test_pipeline_local_persistence():
    pipeline = BigQueryPipeline()
    # Force use of local storage for test reliability
    pipeline.use_bq = False
    
    test_scan = {
        "scan_id": "test-pipeline-scan-123",
        "user_id": "dev-test-pipeline-user",
        "scan_timestamp": "2026-06-08T12:00:00Z",
        "scan_type": "meal",
        "items": [
            {"name": "Apples", "estimated_quantity": "500g", "co2e_kg": 0.2, "confidence": "high", "category": "food", "data_source": "IPCC_database"}
        ],
        "total_co2e_kg": 0.2,
        "green_alternatives": [],
        "carbon_tier": "low",
        "explanation": "Low carbon impact apples."
    }
    
    # Save scan
    assert pipeline.save_scan_result(test_scan) is True
    
    # Retrieve scan
    history = pipeline.get_user_scans("dev-test-pipeline-user")
    assert len(history) >= 1
    matched = [s for s in history if s["scan_id"] == "test-pipeline-scan-123"]
    assert len(matched) == 1
    assert matched[0]["total_co2e_kg"] == 0.2
    
    # Delete scan
    assert pipeline.delete_scan("dev-test-pipeline-user", "test-pipeline-scan-123") is True
    
    # Retrieve again
    history_after = pipeline.get_user_scans("dev-test-pipeline-user")
    matched_after = [s for s in history_after if s["scan_id"] == "test-pipeline-scan-123"]
    assert len(matched_after) == 0
