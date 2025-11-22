"""
Caching layer for The Graph queries
Reduces API calls and improves performance
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
import hashlib

# In-memory cache (use Redis in production)
_cache: Dict[str, Dict[str, Any]] = {}

# Cache TTL settings (in seconds)
CACHE_TTL = {
    "badges": 300,        # 5 minutes
    "passport": 180,      # 3 minutes
    "score_history": 600, # 10 minutes
    "defi_activity": 300, # 5 minutes
    "global_stats": 120,  # 2 minutes
    "high_scores": 600    # 10 minutes
}

def _generate_cache_key(prefix: str, params: Dict) -> str:
    """Generate cache key from prefix and parameters"""
    params_str = json.dumps(params, sort_keys=True)
    params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
    return f"{prefix}:{params_hash}"

def get_cached(key: str) -> Optional[Any]:
    """Get value from cache if not expired"""
    if key not in _cache:
        return None
    
    entry = _cache[key]
    if datetime.now() > entry["expires_at"]:
        del _cache[key]
        return None
    
    return entry["data"]

def set_cached(key: str, data: Any, ttl: int):
    """Store value in cache with TTL"""
    _cache[key] = {
        "data": data,
        "expires_at": datetime.now() + timedelta(seconds=ttl),
        "cached_at": datetime.now()
    }

def invalidate_cache(pattern: str = None):
    """Invalidate cache entries matching pattern"""
    if pattern is None:
        _cache.clear()
        return
    
    keys_to_delete = [k for k in _cache.keys() if pattern in k]
    for key in keys_to_delete:
        del _cache[key]

async def cached_query(cache_type: str, params: Dict, query_func):
    """Execute query with caching"""
    cache_key = _generate_cache_key(cache_type, params)
    
    # Check cache
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data
    
    # Execute query
    data = await query_func()
    
    # Store in cache
    ttl = CACHE_TTL.get(cache_type, 300)
    set_cached(cache_key, data, ttl)
    
    return data

def get_cache_stats() -> Dict:
    """Get cache statistics"""
    now = datetime.now()
    active_entries = sum(1 for e in _cache.values() if now <= e["expires_at"])
    
    return {
        "total_entries": len(_cache),
        "active_entries": active_entries,
        "expired_entries": len(_cache) - active_entries,
        "cache_types": list(set(k.split(":")[0] for k in _cache.keys()))
    }
