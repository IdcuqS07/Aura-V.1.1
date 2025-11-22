"""
Public API Routes for Proof-as-a-Service
Endpoints: /api/v1/proof/*, /api/v1/passport/*
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

from proof_service import ProofService
# Import from api_key_routes instead
import api_key_routes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["Public API"])


# ============ MODELS ============

class ProofGenerateRequest(BaseModel):
    user_id: str
    wallet_address: str


class ProofVerifyRequest(BaseModel):
    proof_hash: str
    user_id: str


class PassportQueryRequest(BaseModel):
    wallet_address: str


# ============ PUBLIC API ROUTES ============

@router.post("/proof/generate")
async def generate_proof_public(
    request: ProofGenerateRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Generate ZK proof for user
    
    Requires API key in header: X-API-Key
    Rate limit: 100/day (free), 1000/day (premium)
    """
    from server import db
    
    try:
        # Verify API key and check rate limit
        api_key_info = await verify_api_key_public(db, x_api_key)
        await check_rate_limit(db, api_key_info)
        
        # Get user data
        user = await db.users.find_one({"id": request.user_id})
        if not user:
            # Try wallet address
            passport = await db.passports.find_one({"wallet_address": request.wallet_address})
            if not passport:
                raise HTTPException(404, "User not found")
            user_data = passport
        else:
            user_data = user
        
        # Generate proof
        proof = ProofService.generate_proof({
            "wallet_address": request.wallet_address,
            "credit_score": user_data.get("credit_score", 0),
            "reputation_score": user_data.get("reputation", 0)
        })
        
        # Increment API usage
        await db.api_keys.update_one(
            {"api_key": x_api_key},
            {"$inc": {"requests_used": 1}}
        )
        
        logger.info(f"Proof generated for {request.user_id} via API key {api_key_info['tier']}")
        
        return {
            "success": True,
            "proof": proof,
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
    Rate limit: 100/day (free), 1000/day (premium)
    """
    from server import db
    
    try:
        # Verify API key and check rate limit
        api_key_info = await verify_api_key_public(db, x_api_key)
        await check_rate_limit(db, api_key_info)
        
        # Get user data
        user = await db.users.find_one({"id": request.user_id})
        if not user:
            passport = await db.passports.find_one({"user_id": request.user_id})
            if not passport:
                raise HTTPException(404, "User not found")
            user_data = passport
        else:
            user_data = user
        
        # Verify proof
        is_valid = ProofService.verify_proof(request.proof_hash, {
            "wallet_address": user_data.get("wallet_address", ""),
            "credit_score": user_data.get("credit_score", 0),
            "reputation_score": user_data.get("reputation", 0)
        })
        
        # Increment API usage
        await db.api_keys.update_one(
            {"api_key": x_api_key},
            {"$inc": {"requests_used": 1}}
        )
        
        logger.info(f"Proof verified for {request.user_id} via API key {api_key_info['tier']}")
        
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
    Query user's Credit Passport
    
    Requires API key in header: X-API-Key
    Rate limit: 100/day (free), 1000/day (premium)
    """
    from server import db
    
    try:
        # Verify API key and check rate limit
        api_key_info = await verify_api_key_public(db, x_api_key)
        await check_rate_limit(db, api_key_info)
        
        # Get passport
        passport = await db.passports.find_one(
            {"wallet_address": request.wallet_address},
            {"_id": 0}
        )
        
        if not passport:
            raise HTTPException(404, "Passport not found")
        
        # Increment API usage
        await db.api_keys.update_one(
            {"api_key": x_api_key},
            {"$inc": {"requests_used": 1}}
        )
        
        logger.info(f"Passport queried for {request.wallet_address} via API key {api_key_info['tier']}")
        
        return {
            "success": True,
            "passport": {
                "passport_id": passport.get("passport_id"),
                "credit_score": passport.get("credit_score"),
                "grade": passport.get("grade"),
                "risk_level": passport.get("risk_level"),
                "poh_score": passport.get("poh_score"),
                "badge_count": passport.get("badge_count"),
                "issued_at": passport.get("issued_at"),
                "last_updated": passport.get("last_updated")
            },
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
