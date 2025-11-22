import httpx
import os
from datetime import datetime

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")

async def verify_twitter_username(username: str) -> dict:
    """Verify Twitter username and calculate score (no OAuth needed)"""
    if not TWITTER_BEARER_TOKEN:
        raise ValueError("Twitter Bearer Token not configured")
    
    headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.twitter.com/2/users/by/username/{username}",
            headers=headers,
            params={"user.fields": "created_at,public_metrics"}
        )
        
        if response.status_code != 200:
            raise ValueError(f"Twitter user not found: {username}")
        
        data = response.json()
        user = data.get("data", {})
        
        created_at = datetime.fromisoformat(user.get('created_at', '').replace('Z', '+00:00'))
        account_age_days = (datetime.now(datetime.timezone.utc).replace(tzinfo=None) - created_at.replace(tzinfo=None)).days
        metrics = user.get('public_metrics', {})
        
        age_score = min(account_age_days / 365 * 10, 10)
        follower_score = min(metrics.get('followers_count', 0) / 100, 10)
        tweet_score = min(metrics.get('tweet_count', 0) / 100, 10)
        
        return {
            "username": user.get('username'),
            "account_age_days": account_age_days,
            "followers": metrics.get('followers_count', 0),
            "tweets": metrics.get('tweet_count', 0),
            "score": int(age_score + follower_score + tweet_score),
            "verified": True
        }

async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    """Exchange OAuth code for access token"""
    return {"access_token": "mock_token", "token_type": "bearer"}

async def get_twitter_data(access_token: str) -> dict:
    """Get Twitter user data from access token"""
    return {
        "username": "mock_user",
        "account_age_days": 365,
        "followers": 100,
        "tweets": 500,
        "score": 15,
        "verified": True
    }


async def fetch_twitter_data(wallet_address: str) -> dict:
    """Fetch Twitter data for wallet address (placeholder)"""
    # Placeholder - in production, map wallet to Twitter account
    return {
        "username": "user123",
        "account_age_days": 1200,
        "followers": 5000,
        "following": 800,
        "tweets": 2500,
        "engagement_rate": 0.12,
        "score": 75,
        "verified": False
    }
