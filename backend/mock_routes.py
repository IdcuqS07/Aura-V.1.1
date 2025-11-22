"""
Mock Routes for Testing Without Database
Fast responses with sample data
"""
from fastapi import APIRouter
from datetime import datetime, timezone
import random
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Mock Data"])

# Try to import on-chain analytics
try:
    from onchain_analytics import onchain_analytics
    ONCHAIN_AVAILABLE = True
    logger.info("✓ On-chain analytics available")
except Exception as e:
    ONCHAIN_AVAILABLE = False
    logger.warning(f"⚠ On-chain analytics not available: {str(e)}")

@router.get("/analytics/onchain")
async def get_analytics_onchain():
    """Get real analytics from blockchain"""
    if ONCHAIN_AVAILABLE:
        try:
            data = await onchain_analytics.get_analytics()
            return data
        except Exception as e:
            logger.error(f"Error fetching on-chain analytics: {str(e)}")
            return {"error": str(e), "data_source": "error"}
    else:
        return {
            "error": "On-chain analytics not available",
            "data_source": "unavailable"
        }

@router.get("/analytics")
async def get_analytics_mock():
    """Fast analytics with live/updating data"""
    # Base values that change over time
    now = datetime.now(timezone.utc)
    seed = int(now.timestamp() / 10)  # Changes every 10 seconds
    
    # Generate live-updating values
    base_users = 1247
    base_verified = 892
    base_badges = 1834
    base_passports = 756
    base_transactions = 4521
    base_volume = 2847392.50
    
    # Add random increments that change every 10 seconds
    random.seed(seed)
    user_increment = random.randint(0, 50)
    verified_increment = random.randint(0, 30)
    badge_increment = random.randint(0, 80)
    passport_increment = random.randint(0, 40)
    tx_increment = random.randint(0, 200)
    volume_increment = random.uniform(0, 50000)
    
    total_users = base_users + user_increment
    verified_users = base_verified + verified_increment
    total_badges = base_badges + badge_increment
    total_passports = base_passports + passport_increment
    total_transactions = base_transactions + tx_increment
    total_volume = base_volume + volume_increment
    
    # Calculate derived metrics
    verification_rate = round((verified_users / total_users) * 100, 1)
    avg_badges_per_user = round(total_badges / total_users, 2)
    avg_credit_score = round(650 + random.uniform(-50, 100), 1)
    
    # Growth metrics (simulated)
    daily_growth = round(random.uniform(2.5, 8.5), 1)
    weekly_growth = round(random.uniform(15, 35), 1)
    
    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "total_badges": total_badges,
        "total_passports": total_passports,
        "average_credit_score": avg_credit_score,
        "total_transactions": total_transactions,
        "total_volume": round(total_volume, 2),
        "active_protocols": random.randint(10, 15),
        
        # Additional live metrics
        "verification_rate": verification_rate,
        "avg_badges_per_user": avg_badges_per_user,
        "daily_new_users": random.randint(15, 45),
        "daily_growth_rate": daily_growth,
        "weekly_growth_rate": weekly_growth,
        
        # Risk distribution
        "risk_distribution": {
            "low": random.randint(400, 500),
            "medium": random.randint(550, 650),
            "high": random.randint(150, 200)
        },
        
        # Recent activity
        "recent_activity": {
            "last_hour_users": random.randint(5, 20),
            "last_hour_badges": random.randint(8, 30),
            "last_hour_passports": random.randint(3, 15)
        },
        
        "timestamp": now.isoformat(),
        "update_interval": "10 seconds",
        "status": "live"
    }

@router.get("/passport/{wallet_address}")
async def get_passport_mock(wallet_address: str):
    """Fast passport lookup without database"""
    # Generate consistent mock data based on wallet
    score = (hash(wallet_address) % 700) + 300  # 300-1000
    
    return {
        "wallet_address": wallet_address,
        "credit_score": score,
        "grade": "Good" if score > 600 else "Fair",
        "risk_level": "low" if score > 700 else "medium",
        "total_badges": random.randint(1, 5),
        "reputation_score": round(score / 10, 1),
        "created_at": "2024-01-15T10:30:00Z",
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "note": "Mock data - MongoDB not connected"
    }

@router.get("/badges/{wallet_address}")
async def get_badges_mock(wallet_address: str):
    """Fast badges lookup without database"""
    return {
        "wallet_address": wallet_address,
        "badges": [
            {
                "id": "badge_1",
                "type": "uniqueness",
                "name": "ZK-ID Badge",
                "issued_at": "2024-01-15T10:30:00Z",
                "is_active": True
            },
            {
                "id": "badge_2", 
                "type": "reputation",
                "name": "Early Adopter",
                "issued_at": "2024-01-20T14:20:00Z",
                "is_active": True
            }
        ],
        "total_badges": 2,
        "note": "Mock data - MongoDB not connected"
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Aura Protocol API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "disconnected (using mock data)"
    }

@router.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Aura Protocol API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "analytics": "/api/analytics",
            "passport": "/api/passport/{wallet_address}",
            "badges": "/api/badges/{wallet_address}",
            "health": "/api/health"
        }
    }
