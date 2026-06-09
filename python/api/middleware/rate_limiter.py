import time
from fastapi import HTTPException
from collections import defaultdict
from typing import List

# In-memory history store: {user_id: [timestamps]}
scan_history = defaultdict(list)

def check_rate_limit(user_id: str):
    """
    Enforces a rate limit of:
    - 20 scans per hour
    - 200 scans per day
    """
    now = time.time()
    user_scans = scan_history[user_id]
    
    # Filter scans within the last 24 hours (86400 seconds)
    user_scans = [t for t in user_scans if now - t < 86400]
    scan_history[user_id] = user_scans
    
    # Check daily limit
    if len(user_scans) >= 200:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded: Max 200 scans per day."
        )
        
    # Check hourly limit (3600 seconds)
    hourly_scans = [t for t in user_scans if now - t < 3600]
    if len(hourly_scans) >= 20:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded: Max 20 scans per hour."
        )
        
    # Record current scan
    scan_history[user_id].append(now)
