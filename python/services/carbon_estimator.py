import re
from typing import Literal

# Static lookup of CO2e per kg or per unit for common items (in kg CO2e)
CARBON_LOOKUP = {
    # Food (per kg)
    "beef": 27.0,
    "lamb": 39.0,
    "cheese": 13.5,
    "pork": 12.1,
    "turkey": 10.9,
    "chicken": 6.9,
    "fish": 5.4,
    "eggs": 4.8,
    "rice": 2.7,
    "milk": 1.9,
    "bread": 0.9,
    "tofu": 2.0,
    "vegetables": 0.5,
    "potato": 0.3,
    "apple": 0.4,
    "banana": 0.8,
    "coffee": 1.2,
    
    # Transport (per km)
    "car_petrol": 0.18,
    "car_diesel": 0.17,
    "car_electric": 0.05,
    "bus": 0.08,
    "train": 0.04,
    "flight_short": 0.25,
    "flight_long": 0.15,
    
    # Goods / Packaging
    "plastic_bottle": 0.1,
    "paper_bag": 0.05,
    "aluminum_can": 0.15,
    "glass_bottle": 0.2,
    "t-shirt": 6.0,
    "jeans": 15.0,
    "laptop": 250.0,
    "smartphone": 60.0
}

def parse_quantity_to_kg_or_units(quantity_str: str) -> float:
    """Helper to convert strings like '200g', '2 kg', '1 unit' to a float factor."""
    clean_str = quantity_str.lower().strip()
    
    # Extract number
    match_num = re.search(r"([0-9]*\.?[0-9]+)", clean_str)
    if not match_num:
        return 1.0
    val = float(match_num.group(1))
    
    if "kg" in clean_str or "kilogram" in clean_str:
        return val
    elif "g" in clean_str or "gram" in clean_str:
        return val / 1000.0
    elif "ml" in clean_str or "milliliter" in clean_str:
        return val / 1000.0
    elif "l" in clean_str or "liter" in clean_str:
        return val
    elif "km" in clean_str or "kilometer" in clean_str:
        return val
    
    return val

def estimate_item_co2e(name: str, quantity_str: str, category: str) -> float:
    """Estimates CO2e for an item using name matching or category averages."""
    factor = parse_quantity_to_kg_or_units(quantity_str)
    name_lower = name.lower()
    
    # Check exact match
    if name_lower in CARBON_LOOKUP:
        return CARBON_LOOKUP[name_lower] * factor
        
    # Check substring matches
    for key, co2_val in CARBON_LOOKUP.items():
        if key in name_lower or name_lower in key:
            return co2_val * factor
            
    # Category fallbacks
    if category == "food":
        return 2.5 * factor
    elif category == "transport":
        return 0.15 * factor
    elif category == "goods":
        return 1.2 * factor
    elif category == "energy":
        return 0.5 * factor
        
    return 1.0 * factor

def calculate_tier(total_co2e: float) -> Literal['low', 'medium', 'high', 'very_high']:
    if total_co2e <= 1.0:
        return 'low'
    elif total_co2e <= 5.0:
        return 'medium'
    elif total_co2e <= 15.0:
        return 'high'
    else:
        return 'very_high'
