from pydantic import BaseModel
from typing import List, Literal, Optional
from models.carbon_item import CarbonItem

class GreenAlternative(BaseModel):
    swap: str
    savings_co2e_kg: float
    reason: str

class ScanResult(BaseModel):
    scan_id: str
    user_id: str
    scan_timestamp: str
    scan_type: Literal['meal', 'receipt', 'product_label']
    items: List[CarbonItem]
    total_co2e_kg: float
    green_alternatives: List[GreenAlternative]
    carbon_tier: Literal['low', 'medium', 'high', 'very_high']
    explanation: str
    image_gcs_uri: Optional[str] = None
