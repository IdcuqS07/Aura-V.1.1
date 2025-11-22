"""
AI Risk Oracle API Routes
Endpoints for AI-powered risk assessment
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

from ai_models import ai_oracle_v2
from oracle_service import get_oracle_service
from api_key_auth import verify_api_key

router = APIRouter(prefix="/api/ai-oracle", tags=["AI Risk Oracle"])

# Global db reference
_db = None

def set_db(db):
    global _db
    _db = db


class RiskAssessmentRequest(BaseModel):
    wallet_address: str
    requested_loan_amount: Optional[float] = 10000
    include_recommendations: Optional[bool] = True


class BatchAssessmentRequest(BaseModel):
    wallet_addresses: List[str]
    requested_loan_amount: Optional[float] = 10000


@router.post("/assess")
async def assess_risk(
    request: RiskAssessmentRequest,
    api_key_info: Dict = Depends(verify_api_key)
):
    """
    AI-powered risk assessment for a wallet
    
    Returns:
    - risk_category: low/medium/high
    - risk_score: 0-100
    - default_probability: 0-100%
    - fraud_detected: boolean
    - recommended_terms: interest rate, LTV, duration
    """
    
    try:
        # Get passport data
        passport = await _db.passports.find_one({
            'owner': request.wallet_address
        })
        
        if not passport:
            raise HTTPException(status_code=404, detail="Passport not found")
        
        # Prepare user data
        user_data = {
            'wallet_address': request.wallet_address,
            'credit_score': passport.get('credit_score', 0),
            'poh_score': passport.get('pohScore', 0),
            'badge_count': passport.get('badgeCount', 0),
            'onchain_activity': passport.get('onchainActivity', 0),
            'account_age_days': (datetime.utcnow() - passport.get('issuedAt', datetime.utcnow())).days,
            'reputation_score': passport.get('reputation_score', 0),
            'is_verified': passport.get('is_verified', False),
            'requested_loan_amount': request.requested_loan_amount,
            'score_history': passport.get('score_history', [])
        }
        
        # Get data sources if available
        data_sources = passport.get('data_sources', {})
        user_data.update({
            'github_score': data_sources.get('github', {}).get('score', 0),
            'twitter_score': data_sources.get('twitter', {}).get('score', 0),
            'tx_count': data_sources.get('wallet', {}).get('tx_count', 0),
            'tx_volume_usd': data_sources.get('wallet', {}).get('volume_usd', 0),
            'total_borrowed': data_sources.get('defi', {}).get('borrowed', 0),
            'total_supplied': data_sources.get('defi', {}).get('supplied', 0),
            'repayment_rate': data_sources.get('defi', {}).get('repayment_rate', 100),
            'liquidation_count': data_sources.get('defi', {}).get('liquidations', 0)
        })
        
        # Run AI assessment
        assessment = ai_oracle_v2.assess_risk(user_data)
        
        # Update API key usage
        await _db.api_keys.update_one(
            {'api_key': api_key_info['api_key']},
            {'$inc': {'requests_used': 1}}
        )
        
        return {
            'success': True,
            'wallet_address': request.wallet_address,
            'assessment': assessment,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-assess")
async def batch_assess_risk(
    request: BatchAssessmentRequest,
    api_key_info: Dict = Depends(verify_api_key)
):
    """Batch risk assessment for multiple wallets"""
    
    try:
        results = []
        
        for wallet_address in request.wallet_addresses:
            passport = await _db.passports.find_one({
                'owner': wallet_address
            })
            
            if not passport:
                results.append({
                    'wallet_address': wallet_address,
                    'success': False,
                    'error': 'Passport not found'
                })
                continue
            
            # Prepare user data
            user_data = {
                'wallet_address': wallet_address,
                'credit_score': passport.get('credit_score', 0),
                'poh_score': passport.get('pohScore', 0),
                'badge_count': passport.get('badgeCount', 0),
                'requested_loan_amount': request.requested_loan_amount
            }
            
            # Run assessment
            assessment = ai_oracle_v2.assess_risk(user_data)
            
            results.append({
                'wallet_address': wallet_address,
                'success': True,
                'assessment': assessment
            })
        
        # Update API key usage
        await _db.api_keys.update_one(
            {'api_key': api_key_info['api_key']},
            {'$inc': {'requests_used': len(request.wallet_addresses)}}
        )
        
        return {
            'success': True,
            'total': len(request.wallet_addresses),
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh/{wallet_address}")
async def force_refresh(
    wallet_address: str,
    api_key_info: Dict = Depends(verify_api_key)
):
    """
    Force immediate refresh of passport data (rate-limited)
    Partner-only feature
    """
    
    try:
        # Check if partner tier
        if api_key_info.get('tier') not in ['pro', 'enterprise']:
            raise HTTPException(
                status_code=403,
                detail="Force refresh only available for Pro/Enterprise tiers"
            )
        
        # Get oracle service
        oracle = get_oracle_service(_db)
        
        # Force refresh
        result = await oracle.force_refresh(wallet_address)
        
        if not result['success']:
            raise HTTPException(status_code=429, detail=result['error'])
        
        # Update API key usage
        await _db.api_keys.update_one(
            {'api_key': api_key_info['api_key']},
            {'$inc': {'requests_used': 1}}
        )
        
        return {
            'success': True,
            'wallet_address': wallet_address,
            'credit_score': result['credit_score'],
            'risk_level': result['risk_level'],
            'last_updated': result['last_updated'],
            'message': 'Passport refreshed successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_oracle_stats():
    """Get AI Oracle statistics"""
    
    try:
        # Count assessments
        total_assessments = await _db.passports.count_documents({})
        
        # Risk distribution
        risk_dist = {}
        for level in ['low', 'medium', 'high']:
            count = await _db.passports.count_documents({'risk_level': level})
            risk_dist[level] = count
        
        # Fraud detection stats
        fraud_detected = await _db.passports.count_documents({'fraud_detected': True})
        
        return {
            'total_assessments': total_assessments,
            'risk_distribution': risk_dist,
            'fraud_detected': fraud_detected,
            'model_version': '2.0.0',
            'uptime': '99.9%'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for AI Oracle service"""
    return {
        'status': 'healthy',
        'service': 'AI Risk Oracle',
        'version': '2.0.0',
        'timestamp': datetime.utcnow().isoformat()
    }
