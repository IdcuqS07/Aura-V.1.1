"""
API Key Management Routes
Endpoints for creating, listing, and managing API keys
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["API Key Management"])

# In-memory storage (for demo without MongoDB)
api_keys_storage = {}

# Tier configurations
TIER_CONFIG = {
    "free": {
        "rate_limit": 100,
        "price": 0,
        "name": "Free"
    },
    "pro": {
        "rate_limit": 1000,
        "price": 29,
        "name": "Pro"
    },
    "enterprise": {
        "rate_limit": 10000,
        "price": 199,
        "name": "Enterprise"
    }
}


class CreateAPIKeyRequest(BaseModel):
    tier: str
    user_id: str


class APIKeyResponse(BaseModel):
    success: bool
    api_key: str
    tier: str
    rate_limit: int
    message: str


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(request: CreateAPIKeyRequest):
    """
    Generate new API key
    
    Tiers:
    - free: 100 requests/day
    - pro: 1,000 requests/day
    - enterprise: 10,000 requests/day
    """
    try:
        # Validate tier
        if request.tier not in TIER_CONFIG:
            raise HTTPException(400, f"Invalid tier. Must be one of: {list(TIER_CONFIG.keys())}")
        
        # Generate API key
        api_key = f"aura_sk_{secrets.token_hex(16)}"
        
        tier_info = TIER_CONFIG[request.tier]
        
        # Store API key
        api_keys_storage[api_key] = {
            "api_key": api_key,
            "tier": request.tier,
            "user_id": request.user_id,
            "rate_limit": tier_info["rate_limit"],
            "requests_used": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_used": None
        }
        
        logger.info(f"API key generated for user {request.user_id}, tier: {request.tier}")
        
        return {
            "success": True,
            "api_key": api_key,
            "tier": request.tier,
            "rate_limit": tier_info["rate_limit"],
            "message": f"{tier_info['name']} API key generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating API key: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/admin/api-keys")
async def list_api_keys():
    """
    List all API keys
    
    In production, this should be admin-only and filter by user
    """
    try:
        keys = list(api_keys_storage.values())
        
        return {
            "success": True,
            "api_keys": keys,
            "total": len(keys)
        }
        
    except Exception as e:
        logger.error(f"Error listing API keys: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/api-keys/{user_id}")
async def get_user_api_keys(user_id: str):
    """Get API keys for specific user"""
    try:
        user_keys = [
            key for key in api_keys_storage.values()
            if key["user_id"] == user_id
        ]
        
        return {
            "success": True,
            "api_keys": user_keys,
            "total": len(user_keys)
        }
        
    except Exception as e:
        logger.error(f"Error getting user API keys: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.delete("/api-keys/{api_key}")
async def revoke_api_key(api_key: str):
    """Revoke/deactivate an API key"""
    try:
        if api_key not in api_keys_storage:
            raise HTTPException(404, "API key not found")
        
        # Deactivate instead of delete (for audit trail)
        api_keys_storage[api_key]["is_active"] = False
        api_keys_storage[api_key]["revoked_at"] = datetime.now(timezone.utc).isoformat()
        
        logger.info(f"API key revoked: {api_key}")
        
        return {
            "success": True,
            "message": "API key revoked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking API key: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/api-keys/stats/{api_key}")
async def get_api_key_stats(api_key: str):
    """Get usage statistics for an API key"""
    try:
        if api_key not in api_keys_storage:
            raise HTTPException(404, "API key not found")
        
        key_data = api_keys_storage[api_key]
        
        usage_percent = (key_data["requests_used"] / key_data["rate_limit"]) * 100
        remaining = key_data["rate_limit"] - key_data["requests_used"]
        
        return {
            "success": True,
            "stats": {
                "api_key": api_key,
                "tier": key_data["tier"],
                "requests_used": key_data["requests_used"],
                "rate_limit": key_data["rate_limit"],
                "remaining": remaining,
                "usage_percent": round(usage_percent, 2),
                "is_active": key_data["is_active"],
                "created_at": key_data["created_at"],
                "last_used": key_data["last_used"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting API key stats: {str(e)}")
        raise HTTPException(500, detail=str(e))


# Helper function to verify API key (used by public_api_routes)
async def verify_api_key(api_key: str) -> dict:
    """Verify API key and return key info"""
    if api_key not in api_keys_storage:
        raise HTTPException(403, "Invalid API key")
    
    key_data = api_keys_storage[api_key]
    
    if not key_data["is_active"]:
        raise HTTPException(403, "API key has been revoked")
    
    return key_data


async def check_rate_limit(api_key: str):
    """Check if API key has exceeded rate limit"""
    key_data = api_keys_storage[api_key]
    
    if key_data["requests_used"] >= key_data["rate_limit"]:
        raise HTTPException(429, "Rate limit exceeded. Upgrade your plan or wait for reset.")
    
    return True


async def increment_usage(api_key: str):
    """Increment API key usage counter"""
    if api_key in api_keys_storage:
        api_keys_storage[api_key]["requests_used"] += 1
        api_keys_storage[api_key]["last_used"] = datetime.now(timezone.utc).isoformat()


# Export storage for use in other modules
def get_api_keys_storage():
    return api_keys_storage
