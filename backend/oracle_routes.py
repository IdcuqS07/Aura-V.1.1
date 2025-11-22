"""
AI Risk Oracle API Routes
Aura Protocol's flagship feature
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

from ai_risk_oracle import ai_oracle

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/oracle", tags=["AI Risk Oracle"])


# ============ MODELS ============

class RiskAssessmentRequest(BaseModel):
    wallet_address: str


class LendingRecommendationRequest(BaseModel):
    wallet_address: str
    loan_amount: float


# ============ ROUTES ============

@router.post("/risk-score")
async def get_risk_score(request: RiskAssessmentRequest):
    """
    Get AI-powered risk assessment for a user
    
    This is Aura Protocol's flagship feature - AI Risk Oracle
    """
    from server import db
    
    try:
        # Get user data
        passport = await db.passports.find_one(
            {"wallet_address": request.wallet_address},
            {"_id": 0}
        )
        
        if not passport:
            raise HTTPException(404, "Passport not found. Complete PoH verification first.")
        
        # Get badge count
        badge_count = await db.badges.count_documents(
            {"wallet_address": request.wallet_address}
        )
        
        # Prepare data for AI model
        user_data = {
            'poh_score': passport.get('poh_score', 0),
            'badge_count': badge_count,
            'onchain_activity': passport.get('onchain_activity', 0),
            'credit_score': passport.get('credit_score', 0),
            'account_age_days': 30,  # TODO: Calculate from issued_at
            'score_history': [passport.get('credit_score', 0)]  # TODO: Get history
        }
        
        # Get AI prediction
        prediction = ai_oracle.predict_risk_score(user_data)
        
        # Store prediction in database
        prediction_doc = {
            "wallet_address": request.wallet_address,
            "prediction": prediction,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.risk_predictions.insert_one(prediction_doc)
        
        logger.info(f"Risk score predicted for {request.wallet_address}: {prediction['risk_score']}")
        
        return {
            "success": True,
            "wallet_address": request.wallet_address,
            "prediction": prediction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Risk score error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.post("/lending-recommendation")
async def get_lending_recommendation(request: LendingRecommendationRequest):
    """
    Get AI-powered lending recommendation
    
    Use case: DeFi lending protocols
    """
    from server import db
    
    try:
        # Get passport
        passport = await db.passports.find_one(
            {"wallet_address": request.wallet_address},
            {"_id": 0}
        )
        
        if not passport:
            raise HTTPException(404, "Passport not found")
        
        # Get badge count
        badge_count = await db.badges.count_documents(
            {"wallet_address": request.wallet_address}
        )
        
        # Prepare data
        user_data = {
            'poh_score': passport.get('poh_score', 0),
            'badge_count': badge_count,
            'onchain_activity': passport.get('onchain_activity', 0),
            'credit_score': passport.get('credit_score', 0),
            'account_age_days': 30,
            'score_history': [passport.get('credit_score', 0)]
        }
        
        # Get risk prediction
        prediction = ai_oracle.predict_risk_score(user_data)
        
        # Get lending recommendation
        recommendation = ai_oracle.get_lending_recommendation(
            prediction['risk_score'],
            request.loan_amount
        )
        
        return {
            "success": True,
            "wallet_address": request.wallet_address,
            "loan_amount_requested": request.loan_amount,
            "risk_assessment": prediction,
            "lending_recommendation": recommendation
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lending recommendation error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/risk-history/{wallet_address}")
async def get_risk_history(wallet_address: str, limit: int = 10):
    """Get historical risk predictions for a user"""
    from server import db
    
    try:
        predictions = await db.risk_predictions.find(
            {"wallet_address": wallet_address},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {
            "success": True,
            "wallet_address": wallet_address,
            "predictions": predictions,
            "count": len(predictions)
        }
        
    except Exception as e:
        logger.error(f"Risk history error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.get("/stats")
async def get_oracle_stats():
    """Get AI Risk Oracle statistics"""
    from server import db
    
    try:
        total_predictions = await db.risk_predictions.count_documents({})
        
        # Risk distribution
        pipeline = [
            {"$group": {
                "_id": "$prediction.risk_level",
                "count": {"$sum": 1}
            }}
        ]
        risk_dist = await db.risk_predictions.aggregate(pipeline).to_list(10)
        risk_distribution = {item['_id']: item['count'] for item in risk_dist}
        
        return {
            "success": True,
            "total_predictions": total_predictions,
            "risk_distribution": risk_distribution,
            "model_version": "1.0.0",
            "model_type": "rule-based"
        }
        
    except Exception as e:
        logger.error(f"Oracle stats error: {str(e)}")
        raise HTTPException(500, detail=str(e))
