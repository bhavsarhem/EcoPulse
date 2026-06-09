from services.carbon_estimator import (
    parse_quantity_to_kg_or_units,
    estimate_item_co2e,
    calculate_tier
)

def test_parse_quantity_to_kg_or_units():
    assert parse_quantity_to_kg_or_units("200g") == 0.2
    assert parse_quantity_to_kg_or_units("2 kg") == 2.0
    assert parse_quantity_to_kg_or_units("1 unit") == 1.0
    assert parse_quantity_to_kg_or_units("500 ml") == 0.5
    assert parse_quantity_to_kg_or_units("1.5 L") == 1.5

def test_estimate_item_co2e():
    # Exact match
    assert estimate_item_co2e("beef", "1kg", "food") == 27.0
    # Substring match
    assert estimate_item_co2e("Raw Beef Cubes", "200g", "food") == 5.4 # 27.0 * 0.2
    # Fallback by category
    assert estimate_item_co2e("Unknown Exotic Fruit", "1kg", "food") == 2.5 # food category fallback is 2.5

def test_calculate_tier():
    assert calculate_tier(0.5) == "low"
    assert calculate_tier(3.0) == "medium"
    assert calculate_tier(12.0) == "high"
    assert calculate_tier(20.0) == "very_high"
