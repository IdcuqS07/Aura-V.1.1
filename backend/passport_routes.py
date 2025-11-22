"""
Credit Passport Routes
Endpoints: /passport/create, /passport/get, /passport/update, /passport/score
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import logging

from credit_scoring import credit_scoring_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/passport", tags=["Credit Passport"])


# ============ MODELS ============

class CreatePassportRequest(BaseModel):
    user_id: str
    wallet_address: str


class UpdatePassportRequest(BaseModel):
    user_id: str


# ============ ROUTES ============

@router.post("/create")
async def create_passport(request: CreatePassportRequest):
    from server import db
    """
    Create Credit Passport for user
    
    Process:
    1. Check if passport exists
    2. Fetch user data (PoH, badges)
    3. Calculate credit score
    4. Store passport
    5. Mint NFT (TODO: integrate contract)
    """
    try:
        # Check existing passport
        existing = await db.passports.find_one({"user_id": request.user_id})
        if existing:
            raise HTTPException(400, "Passport already exists")
        
        # Get user data for scoring
        user_data = await credit_scoring_service.get_user_data_for_scoring(db, request.user_id)
        
        # Calculate credit score
        score_result = credit_scoring_service.calculate_credit_score(
            poh_score=user_data["poh_score"],
            badge_count=user_data["badge_count"],
            onchain_activity=user_data["onchain_activity"],
            reputation=user_data["reputation"]
        )
        
        # Create passport
        passport = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "wallet_address": request.wallet_address,
            "passport_id": f"PASS-{uuid.uuid4().hex[:12].upper()}",
            "credit_score": score_result["credit_score"],
            "grade": score_result["grade"],
            "risk_level": score_result["risk_level"],
            "breakdown": score_result["breakdown"],
            "poh_score": user_data["poh_score"],
            "badge_count": user_data["badge_count"],
            "onchain_activity": user_data["onchain_activity"],
            "reputation": user_data["reputation"],
            "soulbound_token_id": None,  # TODO: mint NFT
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
        await db.passports.insert_one(passport)
        
        logger.info(f"Passport created for {request.user_id} with score {score_result['credit_score']}")
        
        return {
            "success": True,
            "passport_id": passport["passport_id"],
            "credit_score": passport["credit_score"],
            "grade": passport["grade"],
            "risk_level": passport["risk_level"],
            "message": "Credit Passport created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Passport creation error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/{user_id}")
async def get_passport(user_id: str):
    from server import db
    """Get user's Credit Passport"""
    try:
        passport = await db.passports.find_one({"user_id": user_id})
        if not passport:
            raise HTTPException(404, "Passport not found")
        
        # Remove MongoDB _id
        passport.pop("_id", None)
        
        return {
            "success": True,
            "passport": passport
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get passport error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.put("/update")
async def update_passport(request: UpdatePassportRequest):
    from server import db
    """
    Update Credit Passport score
    
    Recalculates score based on latest data
    """
    try:
        # Check passport exists
        passport = await db.passports.find_one({"user_id": request.user_id})
        if not passport:
            raise HTTPException(404, "Passport not found")
        
        # Get latest user data
        user_data = await credit_scoring_service.get_user_data_for_scoring(db, request.user_id)
        
        # Recalculate score
        score_result = credit_scoring_service.calculate_credit_score(
            poh_score=user_data["poh_score"],
            badge_count=user_data["badge_count"],
            onchain_activity=user_data["onchain_activity"],
            reputation=user_data["reputation"]
        )
        
        # Update passport
        await db.passports.update_one(
            {"user_id": request.user_id},
            {"$set": {
                "credit_score": score_result["credit_score"],
                "grade": score_result["grade"],
                "risk_level": score_result["risk_level"],
                "breakdown": score_result["breakdown"],
                "poh_score": user_data["poh_score"],
                "badge_count": user_data["badge_count"],
                "onchain_activity": user_data["onchain_activity"],
                "reputation": user_data["reputation"],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Passport updated for {request.user_id} - new score: {score_result['credit_score']}")
        
        return {
            "success": True,
            "credit_score": score_result["credit_score"],
            "grade": score_result["grade"],
            "risk_level": score_result["risk_level"],
            "message": "Passport updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Passport update error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/score/{user_id}")
async def calculate_score(user_id: str):
    from server import db
    """
    Calculate credit score without saving
    
    Useful for preview before creating passport
    """
    try:
        # Get user data
        user_data = await credit_scoring_service.get_user_data_for_scoring(db, user_id)
        
        # Calculate score
        score_result = credit_scoring_service.calculate_credit_score(
            poh_score=user_data["poh_score"],
            badge_count=user_data["badge_count"],
            onchain_activity=user_data["onchain_activity"],
            reputation=user_data["reputation"]
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "poh_score": user_data["poh_score"],
            "badge_count": user_data["badge_count"],
            "onchain_activity": user_data["onchain_activity"],
            "credit_score": score_result["credit_score"],
            "grade": score_result["grade"],
            "risk_level": score_result["risk_level"],
            "breakdown": score_result["breakdown"]
        }
        
    except Exception as e:
        logger.error(f"Score calculation error: {str(e)}")
        raise HTTPException(500, detail=str(e))
