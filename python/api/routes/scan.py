from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status, Request
from typing import List, Literal
from api.middleware.auth_guard import get_current_user
from api.middleware.rate_limiter import check_rate_limit
from services.image_preprocessor import preprocess_image
from services.gemini_client import GeminiClient
from services.bigquery_pipeline import BigQueryPipeline
from models.scan_result import ScanResult

router = APIRouter()
gemini_client = GeminiClient()
db_pipeline = BigQueryPipeline()

@router.post("/scan", response_model=ScanResult)
async def scan_image(
    request: Request,
    file: UploadFile = File(...),
    scan_type: Literal["meal", "receipt", "product_label"] = Form("meal"),
    user_id: str = Depends(get_current_user)
):
    # 1. Enforce rate limit
    check_rate_limit(user_id)
    
    # 2. Validate MIME type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPEG, PNG, and WEBP are supported."
        )
        
    try:
        # Read contents
        contents = await file.read()
        
        # 3. Magic bytes validation (optional validation check)
        # JPEG: FF D8 FF
        # PNG: 89 50 4E 47
        # WEBP: RIFF (first 4 bytes)
        if len(contents) < 4:
            raise HTTPException(status_code=400, detail="Invalid image file.")
            
        # 4. Preprocess Image
        processed_bytes = preprocess_image(contents)
        
        # 5. Analyze image with Gemini
        analysis = gemini_client.analyze_image(processed_bytes, scan_type)
        
        # Check safety analysis result
        if not analysis.get("is_safe", True):
            device_id = request.headers.get("X-Device-Id")
            if user_id:
                db_pipeline.block_entity(user_id, reason="NSFW/Inappropriate content upload")
            if device_id:
                db_pipeline.block_entity(device_id, reason="NSFW/Inappropriate content upload")
                
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inappropriate or NSFW content detected. This account and device have been permanently blocked."
            )
            
        # Fill in user metadata
        analysis["user_id"] = user_id
        
        # 6. Save in pipeline (BigQuery or local)
        db_pipeline.save_scan_result(analysis)
        
        return analysis
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to scan image due to an internal server error."
        )

@router.get("/history", response_model=List[ScanResult])
async def get_history(user_id: str = Depends(get_current_user)):
    try:
        scans = db_pipeline.get_user_scans(user_id)
        return scans
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve history due to an internal server error."
        )

@router.delete("/history/{scan_id}")
async def delete_history(scan_id: str, user_id: str = Depends(get_current_user)):
    try:
        success = db_pipeline.delete_scan(user_id, scan_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan record not found or unauthorized to delete."
            )
        return {"status": "success", "message": "Scan record deleted."}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete record due to an internal server error."
        )
