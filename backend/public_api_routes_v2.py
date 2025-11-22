"""
Public API Routes for Proof-as-a-Service (On-Chain Integrated)
Fetches real data from Polygon Amoy blockchain
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime, timezone
import logging
import hashlib

import api_key_routes

# Import on-chain analytics
try:
    from onchain_analytics import onchain_analytics
    ONCHAIN_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✓ On-chain integration available")
except Exception as e:
    ONCHAIN_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠ On-chain integration not available: {str(e)}")

router = APIRouter(prefix="/v1", tags=["Public API - On-Chain"])


# ============ MODELS ============

class ProofGenerateRequest(BaseModel):
    user_id: str
    wallet_address: str


class ProofVerifyRequest(BaseModel):
    proof_hash: str
    user_id: str


class PassportQueryRequest(BaseModel):
    wallet_address: str


# ============ HELPER FUNCTIONS ============

def generate_proof_hash(data: dict) -> str:
    """Generate proof hash from data"""
    proof_string = f"{data['wallet_address']}:{data.get('credit_score', 0)}:{datetime.now().isoformat()}"
    return hashlib.sha256(proof_string.encode()).hexdigest()


# ============ PUBLIC API ROUTES ============

@router.post("/proof/generate")
async def generate_proof_public(
    request: ProofGenerateRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Generate ZK proof for user
    
    Requires API key in header: X-API-Key
    Rate limit: Based on tier (100/1000/10000 per day)
    """
    try:
        # Verify API key and check rate limit
        api_key_info = await api_key_routes.verify_api_key(x_api_key)
        await api_key_routes.check_rate_limit(x_api_key)
        
        # Generate mock proof (in production, this would query real data)
        proof_data = {
            "wallet_address": request.wallet_address,
            "credit_score": 750,  # Mock data
            "risk_level": "low"
        }
        
        proof_hash = generate_proof_hash(proof_data)
        
        # Increment API usage
        await api_key_routes.increment_usage(x_api_key)
        
        logger.info(f"Proof generated for {request.user_id} via API key (tier: {api_key_info['tier']})")
        
        return {
            "success": True,
            "proof": {
                "proof_hash": proof_hash,
                "proof_type": "zk_credit_passport",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "is_valid": True,
                "metadata": {
                    "credit_score": proof_data["credit_score"],
                    "risk_level": proof_data["risk_level"]
                }
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proof generation error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.post("/proof/verify")
async def verify_proof_public(
    request: ProofVerifyRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Verify ZK proof
    
    Requires API key in header: X-API-Key
    """
    try:
        # Verify API key and check rate limit
        api_key_info = await api_key_routes.verify_api_key(x_api_key)
        await api_key_routes.check_rate_limit(x_api_key)
        
        # Verify proof (mock - always returns true for demo)
        is_valid = len(request.proof_hash) == 64  # Simple validation
        
        # Increment API usage
        await api_key_routes.increment_usage(x_api_key)
        
        logger.info(f"Proof verified for {request.user_id} via API key (tier: {api_key_info['tier']})")
        
        return {
            "success": True,
            "is_valid": is_valid,
            "proof_hash": request.proof_hash,
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proof verification error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.post("/passport/query")
async def query_passport_public(
    request: PassportQueryRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Query user's Credit Passport (On-Chain Data)
    
    Requires API key in header: X-API-Key
    Fetches real data from Polygon Amoy blockchain
    """
    try:
        # Verify API key and check rate limit
        api_key_info = await api_key_routes.verify_api_key(x_api_key)
        await api_key_routes.check_rate_limit(x_api_key)
        
        # Try to get on-chain data
        if ONCHAIN_AVAILABLE:
            try:
                passport_data = await onchain_analytics.get_user_passport(request.wallet_address)
                
                if "error" not in passport_data:
                    # On-chain data available
                    await api_key_routes.increment_usage(x_api_key)
                    
                    logger.info(f"Passport queried (ON-CHAIN) for {request.wallet_address} via API key (tier: {api_key_info['tier']})")
                    
                    return {
                        "success": True,
                        "passport": {
                            "passport_id": passport_data.get("passport_id"),
                            "wallet_address": request.wallet_address,
                            "credit_score": passport_data.get("credit_score"),
                            "poh_score": passport_data.get("poh_score"),
                            "badge_count": passport_data.get("badge_count"),
                            "onchain_activity": passport_data.get("onchain_activity"),
                            "issued_at": passport_data.get("issued_at"),
                            "last_updated": passport_data.get("last_updated"),
                            "data_source": "on-chain"
                        },
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
            except Exception as e:
                logger.warning(f"On-chain query failed, using mock data: {str(e)}")
        
        # Fallback to mock data
        passport_data = {
            "passport_id": 1,
            "wallet_address": request.wallet_address,
            "credit_score": 750,
            "grade": "Very Good",
            "risk_level": "low",
            "poh_score": 85,
            "badge_count": 3,
            "issued_at": "2025-01-01T00:00:00Z",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "data_source": "mock"
        }
        
        # Increment API usage
        await api_key_routes.increment_usage(x_api_key)
        
        logger.info(f"Passport queried (MOCK) for {request.wallet_address} via API key (tier: {api_key_info['tier']})")
        
        return {
            "success": True,
            "passport": passport_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Passport query error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/health")
async def health_check():
    """Public API health check"""
    return {
        "status": "healthy",
        "service": "Aura Protocol Public API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
