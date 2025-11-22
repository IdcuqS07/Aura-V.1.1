from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
import secrets

API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

# Demo API keys (fallback)
VALID_API_KEYS = {
    "demo_key_12345": {"name": "Demo User", "rate_limit": 100},
    "premium_key_67890": {"name": "Premium User", "rate_limit": 1000}
}

# Import db from server to avoid duplicate connections
db = None

def set_db(database):
    global db
    db = database

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    """Verify API key for Proof-as-a-Service"""
    # Check database first
    if db is not None:
        key_info = await db.api_keys.find_one({"api_key": api_key, "is_active": True})
        if key_info:
            # Increment usage counter
            await db.api_keys.update_one(
                {"api_key": api_key},
                {"$inc": {"requests_used": 1}}
            )
            return {"name": key_info.get("tier"), "rate_limit": key_info.get("rate_limit")}
    
    # Fallback to demo keys
    if api_key in VALID_API_KEYS:
        return VALID_API_KEYS[api_key]
    
    raise HTTPException(status_code=403, detail="Invalid API key")

async def verify_api_key_public(db, api_key: str):
    """Verify API key for public API (no Security dependency)"""
    # Check database
    key_info = await db.api_keys.find_one({"api_key": api_key, "is_active": True})
    if key_info:
        return key_info
    
    # Fallback to demo keys
    if api_key in VALID_API_KEYS:
        return {"tier": "demo", "rate_limit": VALID_API_KEYS[api_key]["rate_limit"], "requests_used": 0}
    
    raise HTTPException(status_code=403, detail="Invalid API key")

async def check_rate_limit(db, api_key_info):
    """Check if API key has exceeded rate limit"""
    requests_used = api_key_info.get("requests_used", 0)
    rate_limit = api_key_info.get("rate_limit", 100)
    
    if requests_used >= rate_limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Upgrade your plan for more requests.")
    
    return True

def generate_api_key(tier: str = "free") -> str:
    """Generate new API key"""
    return f"aura_{tier}_{secrets.token_urlsafe(8).lower()}"
