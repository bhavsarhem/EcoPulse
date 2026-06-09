import os
import json
import random
import time
from typing import Dict, Any, List
from services.carbon_estimator import calculate_tier, estimate_item_co2e

try:
    import google.generativeai as genai
    from google.generativeai.types import GenerateContentResponse
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class GeminiClient:
    def __init__(self):
        self.mock_mode = os.getenv("MOCK_MODE", "true").lower() == "true"
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.project_id = os.getenv("GCP_PROJECT_ID")
        
        if not self.mock_mode and HAS_GENAI and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            self.mock_mode = True

    def analyze_image(self, image_bytes: bytes, scan_type: str) -> Dict[str, Any]:
        """
        Analyzes the image and returns carbon footprint data.
        In mock mode, returns pre-generated realistic data.
        """
        if self.mock_mode:
            # Simulate processing delay
            time.sleep(1.5)
            return self._generate_mock_response(scan_type)
            
        try:
            # Prepare prompts
            system_prompt = (
                "You are a certified carbon footprint analyst. Analyze the provided image carefully.\n"
                "Identify all visible food items, products, or purchase categories.\n"
                "For each item return:\n"
                "  - name (string)\n"
                "  - estimated_quantity (string, e.g. '200g', '1 unit')\n"
                "  - co2e_kg (float, kg CO2 equivalent)\n"
                "  - confidence ('high'|'medium'|'low')\n"
                "  - category ('food'|'transport'|'goods'|'energy')\n"
                "  - data_source ('IPCC_database'|'estimated'|'manufacturer')\n\n"
                "Also return:\n"
                "  - total_co2e_kg (float)\n"
                "  - scan_type ('meal'|'receipt'|'product_label')\n"
                "  - green_alternatives: array of {swap, savings_co2e_kg, reason}\n"
                "  - carbon_tier ('low'|'medium'|'high'|'very_high')\n"
                "  - explanation (2-3 sentences in simple language for a general audience)\n\n"
                "Respond ONLY in valid JSON. No markdown, no preamble."
            )
            
            # Call Gemini using generativeai SDK
            response = self.model.generate_content([
                system_prompt,
                {"mime_type": "image/jpeg", "data": image_bytes}
            ])
            
            cleaned_text = response.text.strip()
            # Handle markdown code blocks
            if cleaned_text.startswith("```"):
                lines = cleaned_text.split("\n")
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    cleaned_text = "\n".join(lines[1:-1]).strip()
                    
            data = json.loads(cleaned_text)
            
            # Post-validate items and fallback if needed
            validated_items = []
            total_co2e = 0.0
            for item in data.get("items", []):
                confidence = item.get("confidence", "medium")
                co2e = float(item.get("co2e_kg", 0.0))
                
                # If Gemini is unsure, fallback to local lookup calculation
                if confidence == "low" or co2e <= 0.0:
                    co2e = estimate_item_co2e(
                        item.get("name", ""),
                        item.get("estimated_quantity", "1 unit"),
                        item.get("category", "goods")
                    )
                    item["co2e_kg"] = co2e
                    item["data_source"] = "local_database_fallback"
                    item["confidence"] = "medium"
                    
                validated_items.append(item)
                total_co2e += co2e
                
            data["items"] = validated_items
            data["total_co2e_kg"] = round(total_co2e, 2)
            data["carbon_tier"] = calculate_tier(total_co2e)
            
            return data
            
        except Exception as e:
            print(f"Gemini live call error: {e}. Falling back to mock data.")
            return self._generate_mock_response(scan_type)

    def _generate_mock_response(self, scan_type: str) -> Dict[str, Any]:
        """Generates realistic responses for local execution/testing."""
        if scan_type == "meal":
            meals = [
                {
                    "items": [
                        {"name": "Beef Steak", "estimated_quantity": "250g", "co2e_kg": 6.75, "confidence": "high", "category": "food", "data_source": "IPCC_database"},
                        {"name": "Mashed Potato", "estimated_quantity": "150g", "co2e_kg": 0.15, "confidence": "medium", "category": "food", "data_source": "estimated"},
                        {"name": "Asparagus", "estimated_quantity": "100g", "co2e_kg": 0.08, "confidence": "high", "category": "food", "data_source": "IPCC_database"}
                    ],
                    "green_alternatives": [
                        {"swap": "Swap Beef for Grilled Salmon", "savings_co2e_kg": 5.4, "reason": "Salmon has a carbon footprint nearly 5x lower than beef per portion."},
                        {"swap": "Try Grilled Portobello Mushrooms", "savings_co2e_kg": 6.5, "reason": "A fully plant-based centerpiece reduces emissions by over 95%."}
                    ],
                    "explanation": "This meal is high in carbon due to the beef steak, which accounts for the vast majority of the emissions. Transitioning to poultry, fish, or plant-based proteins significantly lowers impact."
                },
                {
                    "items": [
                        {"name": "Avocado Toast", "estimated_quantity": "1 slice", "co2e_kg": 0.45, "confidence": "high", "category": "food", "data_source": "IPCC_database"},
                        {"name": "Poached Egg", "estimated_quantity": "1 unit", "co2e_kg": 0.25, "confidence": "high", "category": "food", "data_source": "IPCC_database"},
                        {"name": "Oat Milk Latte", "estimated_quantity": "300ml", "co2e_kg": 0.18, "confidence": "medium", "category": "food", "data_source": "estimated"}
                    ],
                    "green_alternatives": [
                        {"swap": "Swap imported Avocado for local Greens", "savings_co2e_kg": 0.2, "reason": "Sourcing locally grown toppings reduces transportation-related carbon emissions."}
                    ],
                    "explanation": "An excellent low-carbon option! The use of oat milk instead of dairy milk keeps the beverage footprint minimal. Avocado has moderate emissions due to transport water footprint."
                }
            ]
            selected = random.choice(meals)
        elif scan_type == "receipt":
            receipts = [
                {
                    "items": [
                        {"name": "Greek Yogurt 1kg", "estimated_quantity": "1 unit", "co2e_kg": 2.2, "confidence": "high", "category": "food", "data_source": "IPCC_database"},
                        {"name": "Organic Strawberries 500g", "estimated_quantity": "1 unit", "co2e_kg": 0.35, "confidence": "medium", "category": "food", "data_source": "estimated"},
                        {"name": "Sparkling Water (Glass Bottle)", "estimated_quantity": "3 units", "co2e_kg": 0.6, "confidence": "high", "category": "goods", "data_source": "estimated"}
                    ],
                    "green_alternatives": [
                        {"swap": "Buy canned or carton mineral water", "savings_co2e_kg": 0.4, "reason": "Glass packaging has high production and shipping weight carbon costs compared to aluminum or paper cartons."}
                    ],
                    "explanation": "This shopping trip has a moderate carbon impact. The dairy product (yogurt) and glass bottles are the primary drivers of the carbon total."
                }
            ]
            selected = random.choice(receipts)
        else: # product_label
            labels = [
                {
                    "items": [
                        {"name": "Leather Handbag", "estimated_quantity": "1 unit", "co2e_kg": 28.5, "confidence": "high", "category": "goods", "data_source": "manufacturer"},
                        {"name": "Cardboard Box Packaging", "estimated_quantity": "1 unit", "co2e_kg": 0.12, "confidence": "high", "category": "goods", "data_source": "estimated"}
                    ],
                    "green_alternatives": [
                        {"swap": "Opt for Recycled Vegan Leather", "savings_co2e_kg": 20.0, "reason": "Synthetic or plant-based recycled leathers emit up to 70% less CO2e during tanning and manufacturing than bovine leather."}
                    ],
                    "explanation": "Very high carbon footprint due to bovine leather tanning processes and livestock methane emissions. Choosing recycled fabrics or canvas is far more sustainable."
                }
            ]
            selected = random.choice(labels)

        items = selected["items"]
        total_co2e = round(sum(i["co2e_kg"] for i in items), 2)
        
        return {
            "scan_id": f"scan-{random.randint(100000, 999999)}",
            "scan_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "scan_type": scan_type,
            "items": items,
            "total_co2e_kg": total_co2e,
            "green_alternatives": selected["green_alternatives"],
            "carbon_tier": calculate_tier(total_co2e),
            "explanation": selected["explanation"]
        }
