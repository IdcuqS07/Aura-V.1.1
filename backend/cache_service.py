"""
Cache Service using Redis
Caches API responses, user data, and analytics
"""

import redis
import json
import hashlib
from typing import Optional, Callable, Any
from functools import wraps
import os

class CacheService:
    """Redis-based caching service"""
    
    def __init__(self, redis_url: str = None):
        self.redis = redis.from_url(redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/2"))
        self.default_ttl = 300  # 5 minutes
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    def set(self, key: str, value: Any, ttl: int = None):
        """Set cached value"""
        self.redis.setex(key, ttl or self.default_ttl, json.dumps(value))
    
    def delete(self, key: str):
        """Delete cached value"""
        self.redis.delete(key)
    
    def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching pattern"""
        for key in self.redis.scan_iter(pattern):
            self.redis.delete(key)
    
    def cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        key_data = f"{prefix}:{':'.join(map(str, args))}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()

# Decorator for caching function results
def cached(prefix: str, ttl: int = 300):
    """Cache decorator"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = CacheService()
            cache_key = cache.cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Specific cache managers
class UserCache:
    """User-specific caching"""
    
    def __init__(self):
        self.cache = CacheService()
    
    def get_passport(self, wallet_address: str) -> Optional[dict]:
        """Get cached passport"""
        return self.cache.get(f"passport:{wallet_address}")
    
    def set_passport(self, wallet_address: str, passport: dict, ttl: int = 600):
        """Cache passport data"""
        self.cache.set(f"passport:{wallet_address}", passport, ttl)
    
    def get_badges(self, wallet_address: str) -> Optional[list]:
        """Get cached badges"""
        return self.cache.get(f"badges:{wallet_address}")
    
    def set_badges(self, wallet_address: str, badges: list, ttl: int = 300):
        """Cache badges"""
        self.cache.set(f"badges:{wallet_address}", badges, ttl)
    
    def invalidate_user(self, wallet_address: str):
        """Invalidate all user cache"""
        self.cache.invalidate_pattern(f"*:{wallet_address}")

class AnalyticsCache:
    """Analytics caching"""
    
    def __init__(self):
        self.cache = CacheService()
    
    def get_global_stats(self) -> Optional[dict]:
        """Get cached global stats"""
        return self.cache.get("analytics:global")
    
    def set_global_stats(self, stats: dict, ttl: int = 60):
        """Cache global stats (1 minute)"""
        self.cache.set("analytics:global", stats, ttl)
    
    def get_onchain_data(self) -> Optional[dict]:
        """Get cached on-chain data"""
        return self.cache.get("analytics:onchain")
    
    def set_onchain_data(self, data: dict, ttl: int = 30):
        """Cache on-chain data (30 seconds)"""
        self.cache.set("analytics:onchain", data, ttl)

class APICache:
    """API response caching"""
    
    def __init__(self):
        self.cache = CacheService()
    
    def get_api_response(self, endpoint: str, params: dict) -> Optional[dict]:
        """Get cached API response"""
        key = self.cache.cache_key(f"api:{endpoint}", **params)
        return self.cache.get(key)
    
    def set_api_response(self, endpoint: str, params: dict, response: dict, ttl: int = 300):
        """Cache API response"""
        key = self.cache.cache_key(f"api:{endpoint}", **params)
        self.cache.set(key, response, ttl)

cache_service = CacheService()
user_cache = UserCache()
analytics_cache = AnalyticsCache()
api_cache = APICache()
