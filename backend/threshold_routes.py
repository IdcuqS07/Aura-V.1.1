from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from threshold_proof_service import ThresholdProofService

router = APIRouter()

class ThresholdProofRequest(BaseModel):
    wallet_address: str
    github_verified: bool = False
    twitter_verified: bool = False
    wallet_age_days: int = 0
    transaction_count: int = 0
    threshold: int = 50

class ThresholdProofResponse(BaseModel):
    proof_hash: str
    is_valid: bool
    threshold: int
    nullifier: str
    message: str

@router.post("/threshold/generate", response_model=ThresholdProofResponse)
async def generate_threshold_proof(request: ThresholdProofRequest):
    """Generate ZK proof that user score >= threshold"""
    
    user_data = {
        'wallet_address': request.wallet_address,
        'github_verified': request.github_verified,
        'twitter_verified': request.twitter_verified,
        'wallet_age_days': request.wallet_age_days,
        'transaction_count': request.transaction_count,
        'timestamp': datetime.now().isoformat()
    }
    
    proof = ThresholdProofService.generate_proof(user_data, request.threshold)
    
    if not proof:
        raise HTTPException(status_code=500, detail="Failed to generate proof")
    
    message = "Score meets threshold" if proof['is_valid'] else "Score below threshold"
    
    return ThresholdProofResponse(
        proof_hash=proof['proof_hash'],
        is_valid=proof['is_valid'],
        threshold=proof['threshold'],
        nullifier=proof['nullifier'],
        message=message
    )

@router.post("/threshold/verify")
async def verify_threshold_proof(proof_hash: str, nullifier: str, threshold: int):
    """Verify a threshold proof"""
    
    is_valid = ThresholdProofService.verify_proof(proof_hash, nullifier, threshold)
    
    return {
        "verified": is_valid,
        "proof_hash": proof_hash,
        "threshold": threshold
    }

@router.get("/threshold/score/{wallet_address}")
async def calculate_score(
    wallet_address: str,
    github_verified: bool = False,
    twitter_verified: bool = False,
    wallet_age_days: int = 0,
    transaction_count: int = 0
):
    """Calculate user score (for testing only - not ZK)"""
    
    user_data = {
        'github_verified': github_verified,
        'twitter_verified': twitter_verified,
        'wallet_age_days': wallet_age_days,
        'transaction_count': transaction_count
    }
    
    score = ThresholdProofService.calculate_score(user_data)
    
    return {
        "wallet_address": wallet_address,
        "total_score": score,
        "breakdown": {
            "github": 30 if github_verified else 0,
            "twitter": 20 if twitter_verified else 0,
            "wallet_age": min(25, wallet_age_days // 10),
            "transactions": min(25, transaction_count // 5)
        },
        "max_score": 100
    }
