from pydantic import BaseModel
from typing import Literal

class CarbonItem(BaseModel):
    name: str
    estimated_quantity: str
    co2e_kg: float
    confidence: Literal['high', 'medium', 'low']
    category: Literal['food', 'transport', 'goods', 'energy']
    data_source: str
