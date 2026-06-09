import os
import json
from typing import List, Dict, Any

try:
    from google.cloud import bigquery
    HAS_BIGQUERY = True
except ImportError:
    HAS_BIGQUERY = False

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "scans.json")

def ensure_db_exists():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)

class BigQueryPipeline:
    def __init__(self):
        self.use_bq = HAS_BIGQUERY and os.getenv("GCP_PROJECT_ID") is not None
        self.dataset = os.getenv("BQ_DATASET", "ecopulse")
        self.table = "scan_results"
        
        if self.use_bq:
            try:
                self.client = bigquery.Client(project=os.getenv("GCP_PROJECT_ID"))
            except Exception as e:
                print(f"Failed to initialize BQ Client: {e}. Falling back to local storage.")
                self.use_bq = False
        
        ensure_db_exists()

    def save_scan_result(self, result: Dict[str, Any]) -> bool:
        """Saves a scan result. Fallback to local file if BQ is unavailable."""
        if self.use_bq:
            try:
                table_ref = f"{self.client.project}.{self.dataset}.{self.table}"
                # Format JSON values for items
                row = {
                    "scan_id": result["scan_id"],
                    "user_id": result["user_id"],
                    "scan_timestamp": result["scan_timestamp"],
                    "scan_type": result["scan_type"],
                    "total_co2e_kg": float(result["total_co2e_kg"]),
                    "carbon_tier": result["carbon_tier"],
                    "items": json.dumps(result["items"]),
                    "image_gcs_uri": result.get("image_gcs_uri", ""),
                    "model_version": os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
                }
                errors = self.client.insert_rows_json(table_ref, [row])
                if not errors:
                    return True
                print(f"BigQuery insert errors: {errors}")
            except Exception as e:
                print(f"BigQuery insertion failed: {e}. Falling back to local storage.")
        
        # Local JSON persistence fallback
        try:
            with open(DB_FILE, "r+") as f:
                scans = json.load(f)
                scans.append(result)
                f.seek(0)
                json.dump(scans, f, indent=2)
                f.truncate()
            return True
        except Exception as e:
            print(f"Failed to write to local DB: {e}")
            return False

    def get_user_scans(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves scan history for a user."""
        if self.use_bq:
            try:
                query = f"""
                    SELECT scan_id, user_id, scan_timestamp, scan_type, total_co2e_kg, carbon_tier, items, image_gcs_uri
                    FROM `{self.client.project}.{self.dataset}.{self.table}`
                    WHERE user_id = @user_id
                    ORDER BY scan_timestamp DESC
                """
                job_config = bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("user_id", "STRING", user_id)
                    ]
                )
                query_job = self.client.query(query, job_config=job_config)
                results = []
                for row in query_job:
                    results.append({
                        "scan_id": row.scan_id,
                        "user_id": row.user_id,
                        "scan_timestamp": row.scan_timestamp.isoformat() if hasattr(row.scan_timestamp, "isoformat") else str(row.scan_timestamp),
                        "scan_type": row.scan_type,
                        "total_co2e_kg": row.total_co2e_kg,
                        "carbon_tier": row.carbon_tier,
                        "items": json.loads(row.items) if isinstance(row.items, str) else row.items,
                        "image_gcs_uri": row.image_gcs_uri
                    })
                return results
            except Exception as e:
                print(f"BigQuery query failed: {e}. Reading from local storage.")
                
        # Local storage fallback
        try:
            with open(DB_FILE, "r") as f:
                scans = json.load(f)
            # Filter and sort
            filtered = [s for s in scans if s.get("user_id") == user_id]
            filtered.sort(key=lambda s: s.get("scan_timestamp", ""), reverse=True)
            return filtered
        except Exception as e:
            print(f"Failed to read from local DB: {e}")
            return []

    def delete_scan(self, user_id: str, scan_id: str) -> bool:
        """Deletes a specific scan from history."""
        if self.use_bq:
            try:
                query = f"""
                    DELETE FROM `{self.client.project}.{self.dataset}.{self.table}`
                    WHERE user_id = @user_id AND scan_id = @scan_id
                """
                job_config = bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                        bigquery.ScalarQueryParameter("scan_id", "STRING", scan_id)
                    ]
                )
                self.client.query(query, job_config=job_config).result()
                return True
            except Exception as e:
                print(f"BigQuery delete failed: {e}. Deleting from local storage.")
                
        # Local storage fallback
        try:
            with open(DB_FILE, "r") as f:
                scans = json.load(f)
            original_len = len(scans)
            scans = [s for s in scans if not (s.get("user_id") == user_id and s.get("scan_id") == scan_id)]
            
            with open(DB_FILE, "w") as f:
                json.dump(scans, f, indent=2)
                
            return len(scans) < original_len
        except Exception as e:
            print(f"Failed to delete in local DB: {e}")
            return False
