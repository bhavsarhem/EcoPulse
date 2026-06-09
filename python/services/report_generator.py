from typing import Dict, Any, List
from datetime import datetime
from services.bigquery_pipeline import BigQueryPipeline
from models.user_report import UserReport, DailyDataPoint

# Standard daily average carbon footprint per person is ~13.0 kg CO2e (varies by region, using this as benchmark)
BENCHMARK_DAILY_CO2E = 13.0

class ReportGenerator:
    def __init__(self, pipeline: BigQueryPipeline):
        self.pipeline = pipeline

    def generate_monthly_report(self, user_id: str, month_str: str = None) -> UserReport:
        """
        Generates a summary report for a specific user and month (YYYY-MM).
        Defaults to current month if month_str is not provided.
        """
        if not month_str:
            month_str = datetime.now().strftime("%Y-%m")
            
        scans = self.pipeline.get_user_scans(user_id)
        
        # Filter scans for the specified month
        monthly_scans = []
        for s in scans:
            ts_str = s.get("scan_timestamp", "")
            try:
                # Expecting format like "2026-06-08T17:15:39Z" or ISO formats
                date_part = ts_str.split("T")[0]
                if date_part.startswith(month_str):
                    monthly_scans.append(s)
            except Exception:
                continue

        total_co2e = 0.0
        scan_count = len(monthly_scans)
        category_breakdown = {"food": 0.0, "transport": 0.0, "goods": 0.0, "energy": 0.0}
        total_savings = 0.0
        
        # Track daily totals
        daily_totals: Dict[str, float] = {}
        
        for s in monthly_scans:
            co2 = float(s.get("total_co2e_kg", 0.0))
            total_co2e += co2
            
            # Daily aggregation
            date_str = s.get("scan_timestamp", "").split("T")[0]
            daily_totals[date_str] = daily_totals.get(date_str, 0.0) + co2
            
            # Category breakdown
            for item in s.get("items", []):
                cat = item.get("category", "goods")
                val = float(item.get("co2e_kg", 0.0))
                if cat in category_breakdown:
                    category_breakdown[cat] += val
                else:
                    category_breakdown["goods"] += val
            
            # Savings aggregation (from recommendations)
            for alt in s.get("green_alternatives", []):
                total_savings += float(alt.get("savings_co2e_kg", 0.0))

        # Build daily history list sorted by date
        daily_history_points = []
        for d, val in sorted(daily_totals.items()):
            daily_history_points.append(DailyDataPoint(date=d, co2e_kg=round(val, 2)))
            
        # If no scans, fallback with empty
        if not daily_history_points:
            # Seed a single today point with 0
            today_str = datetime.now().strftime("%Y-%m-%d")
            daily_history_points.append(DailyDataPoint(date=today_str, co2e_kg=0.0))

        # Calculate percentage vs benchmark average
        # Benchmark monthly is: benchmark_daily * number of days recorded
        days_in_month = 30  # average
        user_daily_avg = total_co2e / max(len(daily_totals), 1)
        
        if total_co2e > 0:
            comparison = ((user_daily_avg - BENCHMARK_DAILY_CO2E) / BENCHMARK_DAILY_CO2E) * 100.0
        else:
            comparison = 0.0

        return UserReport(
            user_id=user_id,
            month=month_str,
            total_co2e_kg=round(total_co2e, 2),
            scan_count=scan_count,
            category_breakdown={k: round(v, 2) for k, v in category_breakdown.items()},
            savings_co2e_kg=round(total_savings, 2),
            comparison_vs_average_pct=round(comparison, 1),
            daily_history=daily_history_points
        )
