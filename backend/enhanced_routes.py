"""
Enhanced API Routes with Caching, Message Queue, and Reputation Engine
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging

# Try to import enhanced services, fallback if not available
try:
    from cache_service import user_cache, analytics_cache, cached
    CACHE_AVAILABLE = True
except ImportError:
    CACHE_AVAILABLE = False
    print("⚠️  Cache service not available, running without caching")

try:
    from message_queue import celery_app, MessageQueue, EventType
    QUEUE_AVAILABLE = True
except ImportError:
    QUEUE_AVAILABLE = False
    print("⚠️  Message queue not available, running in sync mode")

try:
    from reputation_engine import reputation_engine
    REPUTATION_AVAILABLE = True
except ImportError:
    REPUTATION_AVAILABLE = False
    print("⚠️  Reputation engine not available")

try:
    from feature_store import feature_store
    FEATURE_STORE_AVAILABLE = True
except ImportError:
    FEATURE_STORE_AVAILABLE = False
    print("⚠️  Feature store not available")

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v2", tags=["Enhanced API"])

# Models
class ReputationRequest(BaseModel):
    wallet_address: str

class TrustScoreRequest(BaseModel):
    wallet_address: str
    loan_amount: Optional[float] = None

# Database dependency
db = None
def set_db(database):
    global db
    db = database

# Status endpoint
@router.get("/status")
async def get_enhanced_status():
    """Get status of enhanced features"""
    return {
        "enhanced_features": {
            "cache": CACHE_AVAILABLE,
            "message_queue": QUEUE_AVAILABLE,
            "reputation_engine": REPUTATION_AVAILABLE,
            "feature_store": FEATURE_STORE_AVAILABLE
        },
        "mode": "full" if all([CACHE_AVAILABLE, QUEUE_AVAILABLE, REPUTATION_AVAILABLE, FEATURE_STORE_AVAILABLE]) else "fallback",
        "available_endpoints": {
            "passport_cached": True,
            "badges_cached": True,
            "reputation_calculate": REPUTATION_AVAILABLE,
            "trust_score": REPUTATION_AVAILABLE,
            "proof_async": QUEUE_AVAILABLE,
            "badge_mint_async": QUEUE_AVAILABLE,
            "analytics_cached": True,
            "cache_invalidate": CACHE_AVAILABLE,
            "events": QUEUE_AVAILABLE,
            "features": FEATURE_STORE_AVAILABLE
        }
    }

# Enhanced Routes
@router.get("/passport/{wallet_address}")
async def get_passport_cached(wallet_address: str):
    """Get passport with caching"""
    
    # Try cache first (if available)
    if CACHE_AVAILABLE:
        cached_passport = user_cache.get_passport(wallet_address)
        if cached_passport:
            return {"success": True, "passport": cached_passport, "source": "cache"}
    
    # Query database
    passport = await db.passports.find_one({"wallet_address": wallet_address})
    
    if not passport:
        raise HTTPException(404, "Passport not found")
    
    # Cache result (if available)
    passport['_id'] = str(passport['_id'])
    if CACHE_AVAILABLE:
        user_cache.set_passport(wallet_address, passport)
    
    return {"success": True, "passport": passport, "source": "database"}

@router.get("/badges/{wallet_address}")
async def get_badges_cached(wallet_address: str):
    """Get badges with caching"""
    
    # Try cache first (if available)
    if CACHE_AVAILABLE:
        cached_badges = user_cache.get_badges(wallet_address)
        if cached_badges:
            return {"success": True, "badges": cached_badges, "source": "cache"}
    
    # Query database
    badges = await db.badges.find({"wallet_address": wallet_address}).to_list(100)
    
    for badge in badges:
        badge['_id'] = str(badge['_id'])
    
    # Cache result (if available)
    if CACHE_AVAILABLE:
        user_cache.set_badges(wallet_address, badges)
    
    return {"success": True, "badges": badges, "count": len(badges), "source": "database"}

@router.post("/reputation/calculate")
async def calculate_reputation(request: ReputationRequest):
    """Calculate reputation score with feature store"""
    
    try:
        if not REPUTATION_AVAILABLE:
            raise HTTPException(503, "Reputation engine not available")
        
        # Get features from feature store
        features = {}
        if FEATURE_STORE_AVAILABLE:
            features = feature_store.get_user_features(request.wallet_address)
        
        # If no features, compute from raw data
        if not any(features.values()):
            raw_data = await db.enrollments.find_one({"wallet_address": request.wallet_address})
            if raw_data and FEATURE_STORE_AVAILABLE:
                features = feature_store.compute_and_store_features(
                    request.wallet_address,
                    {
                        'poh_score': raw_data.get('attestations', {}).get('score', 0),
                        'badge_count': await db.badges.count_documents({"wallet_address": request.wallet_address}),
                        'github_data': raw_data.get('raw_data', {}).get('github', {}),
                        'twitter_data': raw_data.get('raw_data', {}).get('twitter', {}),
                        'onchain_data': raw_data.get('raw_data', {}).get('onchain', {})
                    }
                )
        
        # Calculate reputation
        reputation = reputation_engine.calculate_reputation(request.wallet_address, db)
        
        return {
            "success": True,
            "reputation": reputation,
            "features": features
        }
        
    except Exception as e:
        logger.error(f"Reputation calculation error: {e}")
        raise HTTPException(500, str(e))

@router.post("/trust-score")
async def get_trust_score(request: TrustScoreRequest):
    """Get trust score for lending"""
    
    try:
        if not REPUTATION_AVAILABLE:
            raise HTTPException(503, "Reputation engine not available")
        
        trust_score = reputation_engine.calculate_trust_score(request.wallet_address, db)
        
        # Calculate loan recommendation if amount provided
        if request.loan_amount:
            max_loan = request.loan_amount * trust_score['lending_params']['max_loan_multiplier']
            trust_score['recommendation'] = {
                'requested_amount': request.loan_amount,
                'max_approved_amount': max_loan,
                'approved': max_loan >= request.loan_amount,
                'required_collateral': request.loan_amount * (trust_score['lending_params']['collateral_ratio'] / 100)
            }
        
        return {"success": True, "trust_score": trust_score}
        
    except Exception as e:
        logger.error(f"Trust score error: {e}")
        raise HTTPException(500, str(e))

@router.post("/proof/generate-async")
async def generate_proof_async(enrollment_id: str, identity_secret: str):
    """Generate proof asynchronously using Celery"""
    
    if not QUEUE_AVAILABLE:
        raise HTTPException(503, "Message queue not available. Use /api/poh/prove instead")
    
    # Queue task
    task = celery_app.send_task(
        'tasks.generate_proof_async',
        args=[enrollment_id, identity_secret]
    )
    
    return {
        "success": True,
        "task_id": task.id,
        "status": "queued",
        "message": "Proof generation queued. Check status with task_id"
    }

@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Get async task status"""
    
    if not QUEUE_AVAILABLE:
        raise HTTPException(503, "Message queue not available")
    
    task = celery_app.AsyncResult(task_id)
    
    return {
        "task_id": task_id,
        "status": task.state,
        "result": task.result if task.ready() else None
    }

@router.post("/badge/mint-async")
async def mint_badge_async(wallet_address: str, badge_type: str, proof_hash: str):
    """Mint badge asynchronously"""
    
    if not QUEUE_AVAILABLE:
        raise HTTPException(503, "Message queue not available. Use /api/badges/mint instead")
    
    # Queue task
    task = celery_app.send_task(
        'tasks.mint_badge_async',
        args=[wallet_address, badge_type, proof_hash]
    )
    
    return {
        "success": True,
        "task_id": task.id,
        "status": "queued",
        "message": "Badge minting queued"
    }

@router.get("/analytics/cached")
async def get_analytics_cached():
    """Get analytics with caching"""
    
    # Try cache (if available)
    if CACHE_AVAILABLE:
        cached_stats = analytics_cache.get_global_stats()
        if cached_stats:
            return {"success": True, "analytics": cached_stats, "source": "cache"}
    
    # Fetch from on-chain
    from onchain_analytics import onchain_analytics
    stats = await onchain_analytics.get_analytics()
    
    # Cache result (if available)
    if CACHE_AVAILABLE:
        analytics_cache.set_global_stats(stats)
    
    return {"success": True, "analytics": stats, "source": "blockchain"}

@router.post("/cache/invalidate/{wallet_address}")
async def invalidate_user_cache(wallet_address: str):
    """Invalidate user cache"""
    
    if not CACHE_AVAILABLE:
        raise HTTPException(503, "Cache not available")
    
    user_cache.invalidate_user(wallet_address)
    if FEATURE_STORE_AVAILABLE:
        feature_store.invalidate_features(wallet_address)
    
    return {
        "success": True,
        "message": f"Cache invalidated for {wallet_address}"
    }

@router.get("/events/recent/{event_type}")
async def get_recent_events(event_type: str, limit: int = 50):
    """Get recent events from message queue"""
    
    if not QUEUE_AVAILABLE:
        raise HTTPException(503, "Message queue not available")
    
    events = MessageQueue.get_recent_events(event_type, limit)
    
    return {
        "success": True,
        "event_type": event_type,
        "count": len(events),
        "events": events
    }

@router.get("/features/{wallet_address}")
async def get_user_features(wallet_address: str):
    """Get user features from feature store"""
    
    if not FEATURE_STORE_AVAILABLE:
        raise HTTPException(503, "Feature store not available")
    
    features = feature_store.get_user_features(wallet_address)
    feature_vector = feature_store.get_feature_vector(wallet_address)
    
    return {
        "success": True,
        "wallet_address": wallet_address,
        "features": features,
        "feature_vector": feature_vector
    }
