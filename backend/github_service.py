import httpx
import os
from datetime import datetime

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

async def exchange_code_for_token(code: str) -> str:
    """Exchange OAuth code for access token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            }
        )
        data = response.json()
        return data.get("access_token")

async def get_github_data(access_token: str) -> dict:
    """Fetch GitHub user data and calculate score"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        # Get user profile
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        user = user_resp.json()
        
        # Get repos
        repos_resp = await client.get(f"https://api.github.com/users/{user['login']}/repos", headers=headers)
        repos = repos_resp.json()
        
        # Calculate score (0-40 points)
        account_age_days = (datetime.now() - datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))).days
        age_score = min(account_age_days / 365 * 15, 15)  # Max 15 pts for 1+ year
        repo_score = min(len(repos) * 2, 15)  # Max 15 pts for 7+ repos
        follower_score = min(user.get('followers', 0) / 10, 10)  # Max 10 pts for 100+ followers
        
        score = int(age_score + repo_score + follower_score)
        
        return {
            "username": user['login'],
            "account_age_days": account_age_days,
            "public_repos": len(repos),
            "followers": user.get('followers', 0),
            "score": score,
            "verified": True
        }


async def fetch_github_data(wallet_address: str) -> dict:
    """Fetch GitHub data for wallet address (placeholder)"""
    # Placeholder - in production, map wallet to GitHub account
    return {
        "username": "user",
        "account_age_days": 730,
        "public_repos": 45,
        "followers": 320,
        "contributions": 1250,
        "score": 85,
        "verified": False
    }
