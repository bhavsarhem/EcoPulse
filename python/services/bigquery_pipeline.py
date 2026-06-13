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
        self.blocked_table = "blocked_entities"
        
        # Blocklist cache settings
        self.blocked_cache = set()
        self.last_cache_update = 0
        self.cache_ttl = 60 # seconds
        self.blocklist_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "blocklist.json")
        os.makedirs(os.path.dirname(self.blocklist_file), exist_ok=True)
        if not os.path.exists(self.blocklist_file):
            with open(self.blocklist_file, "w") as f:
                json.dump([], f)
        
        if self.use_bq:
            try:
                self.client = bigquery.Client(project=os.getenv("GCP_PROJECT_ID"))
                self.create_dataset_and_table_if_not_exists()
            except Exception as e:
                print(f"Failed to initialize BQ Client: {e}. Falling back to local storage.")
                self.use_bq = False
        
        ensure_db_exists()

    def create_dataset_and_table_if_not_exists(self):
        """Auto-creates the BigQuery dataset and table if they do not exist."""
        try:
            # 1. Create dataset if not exists
            dataset_id = f"{self.client.project}.{self.dataset}"
            try:
                self.client.get_dataset(dataset_id)
            except Exception:
                dataset = bigquery.Dataset(dataset_id)
                dataset.location = os.getenv("VERTEX_AI_LOCATION", "US")
                self.client.create_dataset(dataset, timeout=30)
                print(f"Created BigQuery dataset {dataset_id} in {dataset.location}")
                
            # 2. Create table if not exists
            table_id = f"{dataset_id}.{self.table}"
            try:
                self.client.get_table(table_id)
            except Exception:
                schema = [
                    bigquery.SchemaField("scan_id", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("user_id", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("scan_timestamp", "TIMESTAMP", mode="REQUIRED"),
                    bigquery.SchemaField("scan_type", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("total_co2e_kg", "FLOAT", mode="REQUIRED"),
                    bigquery.SchemaField("carbon_tier", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("items", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("image_gcs_uri", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("model_version", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("green_alternatives", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("explanation", "STRING", mode="NULLABLE"),
                ]
                table = bigquery.Table(table_id, schema=schema)
                self.client.create_table(table, timeout=30)
                print(f"Created BigQuery table {table_id}")
                
            # 3. Create blocked_entities table if not exists
            blocked_table_id = f"{dataset_id}.{self.blocked_table}"
            try:
                self.client.get_table(blocked_table_id)
            except Exception:
                blocked_schema = [
                    bigquery.SchemaField("entity_id", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("blocked_at", "TIMESTAMP", mode="REQUIRED"),
                    bigquery.SchemaField("reason", "STRING", mode="NULLABLE"),
                ]
                blocked_table = bigquery.Table(blocked_table_id, schema=blocked_schema)
                self.client.create_table(blocked_table, timeout=30)
                print(f"Created BigQuery table {blocked_table_id}")
        except Exception as e:
            print(f"Failed to auto-create BigQuery schema: {e}")


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
                    "model_version": os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
                    "green_alternatives": json.dumps(result.get("green_alternatives", [])),
                    "explanation": result.get("explanation", "")
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
                    SELECT scan_id, user_id, scan_timestamp, scan_type, total_co2e_kg, carbon_tier, items, image_gcs_uri, green_alternatives, explanation
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
                    items_str = row["items"]
                    items_data = json.loads(items_str) if isinstance(items_str, str) else (items_str if items_str else [])
                    
                    alternatives_str = row["green_alternatives"]
                    alternatives_data = json.loads(alternatives_str) if isinstance(alternatives_str, str) else (alternatives_str if alternatives_str else [])
                    
                    explanation_str = row["explanation"] or ""
                    
                    ts = row["scan_timestamp"]
                    ts_str = ts.isoformat() if hasattr(ts, "isoformat") else str(ts)
                    
                    results.append({
                        "scan_id": row["scan_id"],
                        "user_id": row["user_id"],
                        "scan_timestamp": ts_str,
                        "scan_type": row["scan_type"],
                        "total_co2e_kg": row["total_co2e_kg"],
                        "carbon_tier": row["carbon_tier"],
                        "items": items_data,
                        "image_gcs_uri": row["image_gcs_uri"],
                        "green_alternatives": alternatives_data,
                        "explanation": explanation_str
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

    def block_entity(self, entity_id: str, reason: str = "NSFW Content"):
        """Permanently blocks a user ID or device ID."""
        if not entity_id:
            return
            
        self.blocked_cache.add(entity_id)
        
        # Save to BigQuery
        if self.use_bq:
            try:
                table_ref = f"{self.client.project}.{self.dataset}.{self.blocked_table}"
                import time
                row = {
                    "entity_id": entity_id,
                    "blocked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "reason": reason
                }
                self.client.insert_rows_json(table_ref, [row])
            except Exception as e:
                print(f"BigQuery block_entity insertion failed: {e}")
                
        # Save to local blocklist.json
        try:
            import time
            with open(self.blocklist_file, "r+") as f:
                blocks = json.load(f)
                if not any(b.get("entity_id") == entity_id for b in blocks):
                    blocks.append({
                        "entity_id": entity_id,
                        "blocked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "reason": reason
                    })
                    f.seek(0)
                    json.dump(blocks, f, indent=2)
                    f.truncate()
        except Exception as e:
            print(f"Failed to write to local blocklist: {e}")

    def is_entity_blocked(self, entity_id: str) -> bool:
        """Checks if a user ID or device ID is blocked."""
        if not entity_id:
            return False
            
        import time
        current_time = time.time()
        
        if current_time - self.last_cache_update > self.cache_ttl:
            self.refresh_blocked_cache()
            
        return entity_id in self.blocked_cache

    def refresh_blocked_cache(self):
        """Reloads the list of blocked entities from BigQuery or local storage."""
        import time
        new_cache = set()
        
        if self.use_bq:
            try:
                query = f"SELECT entity_id FROM `{self.client.project}.{self.dataset}.{self.blocked_table}`"
                query_job = self.client.query(query)
                for row in query_job:
                    new_cache.add(row["entity_id"])
                self.blocked_cache = new_cache
                self.last_cache_update = time.time()
                return
            except Exception as e:
                print(f"BigQuery blocklist query failed: {e}. Reading from local blocklist.")
                
        try:
            with open(self.blocklist_file, "r") as f:
                blocks = json.load(f)
                for b in blocks:
                    new_cache.add(b.get("entity_id"))
            self.blocked_cache = new_cache
            self.last_cache_update = time.time()
        except Exception as e:
            print(f"Failed to read from local blocklist: {e}")
