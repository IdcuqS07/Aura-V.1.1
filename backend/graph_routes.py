"""
API routes for The Graph integration
Exposes cached subgraph queries
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from graph_client import get_graph_client
from graph_cache import cached_query, get_cache_stats, invalidate_cache

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("/badges/{wallet_address}")
async def get_badges(wallet_address: str):
    """Get all badges for a wallet address"""
    client = get_graph_client()
    
    data = await cached_query(
        "badges",
        {"wallet": wallet_address},
        lambda: client.get_user_badges(wallet_address)
    )
    
    return {
        "success": True,
        "wallet_address": wallet_address,
        "badges": data,
        "count": len(data)
    }

@router.get("/passport/{wallet_address}")
async def get_passport(wallet_address: str):
    """Get credit passport for a wallet address"""
    client = get_graph_client()
    
    data = await cached_query(
        "passport",
        {"wallet": wallet_address},
        lambda: client.get_user_passport(wallet_address)
    )
    
    if not data:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    return {
        "success": True,
        "wallet_address": wallet_address,
        "passport": data
    }

@router.get("/score-history/{wallet_address}")
async def get_score_history(wallet_address: str):
    """Get credit score update history"""
    client = get_graph_client()
    
    data = await cached_query(
        "score_history",
        {"wallet": wallet_address},
        lambda: client.get_score_history(wallet_address)
    )
    
    return {
        "success": True,
        "wallet_address": wallet_address,
        "history": data,
        "count": len(data)
    }

@router.get("/defi-activity/{wallet_address}")
async def get_defi_activity(wallet_address: str):
    """Get aggregated DeFi activity"""
    client = get_graph_client()
    
    data = await cached_query(
        "defi_activity",
        {"wallet": wallet_address},
        lambda: client.get_defi_activity(wallet_address)
    )
    
    return {
        "success": True,
        "data": data
    }

@router.get("/stats")
async def get_global_stats():
    """Get global ecosystem statistics"""
    client = get_graph_client()
    
    data = await cached_query(
        "global_stats",
        {},
        lambda: client.get_global_stats()
    )
    
    return {
        "success": True,
        "stats": data
    }

@router.get("/high-scores")
async def get_high_scores(min_score: int = 700):
    """Get users with high credit scores"""
    client = get_graph_client()
    
    data = await cached_query(
        "high_scores",
        {"min_score": min_score},
        lambda: client.search_high_score_users(min_score)
    )
    
    return {
        "success": True,
        "min_score": min_score,
        "users": data,
        "count": len(data)
    }

@router.get("/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    return {
        "success": True,
        "cache": get_cache_stats()
    }

@router.post("/cache/invalidate")
async def invalidate_cache_endpoint(pattern: Optional[str] = None):
    """Invalidate cache entries"""
    invalidate_cache(pattern)
    return {
        "success": True,
        "message": f"Cache invalidated{f' for pattern: {pattern}' if pattern else ''}"
    }
