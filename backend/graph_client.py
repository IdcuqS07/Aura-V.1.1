"""
The Graph GraphQL Client for Aura Protocol
Queries subgraph for badges, passports, and on-chain data
"""

import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json

# The Graph Studio endpoint (update after deployment)
SUBGRAPH_URL = "https://api.studio.thegraph.com/query/<DEPLOY_ID>/aura-protocol/v0.0.1"

# Fallback to local node for development
LOCAL_SUBGRAPH_URL = "http://localhost:8000/subgraphs/name/aura-protocol"

class GraphClient:
    def __init__(self, url: str = None):
        self.url = url or LOCAL_SUBGRAPH_URL
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def query(self, query: str, variables: Dict = None) -> Dict:
        """Execute GraphQL query"""
        try:
            response = await self.client.post(
                self.url,
                json={"query": query, "variables": variables or {}}
            )
            response.raise_for_status()
            data = response.json()
            if "errors" in data:
                raise Exception(f"GraphQL errors: {data['errors']}")
            return data.get("data", {})
        except Exception as e:
            print(f"Graph query error: {e}")
            return {}
    
    async def get_user_badges(self, wallet_address: str) -> List[Dict]:
        """Get all badges for a user"""
        query = """
        query GetUserBadges($owner: String!) {
            badges(where: {owner: $owner}, orderBy: mintedAt, orderDirection: desc) {
                id
                tokenId
                badgeType
                zkProofHash
                mintedAt
            }
        }
        """
        result = await self.query(query, {"owner": wallet_address.lower()})
        return result.get("badges", [])
    
    async def get_user_passport(self, wallet_address: str) -> Optional[Dict]:
        """Get user's credit passport"""
        query = """
        query GetPassport($owner: String!) {
            passports(where: {owner: $owner}, first: 1) {
                id
                passportId
                creditScore
                pohScore
                badgeCount
                onchainActivity
                issuedAt
                lastUpdated
            }
        }
        """
        result = await self.query(query, {"owner": wallet_address.lower()})
        passports = result.get("passports", [])
        return passports[0] if passports else None
    
    async def get_score_history(self, wallet_address: str) -> List[Dict]:
        """Get credit score update history"""
        query = """
        query GetScoreHistory($owner: String!) {
            scoreUpdates(where: {passport_: {owner: $owner}}, orderBy: timestamp, orderDirection: desc, first: 10) {
                id
                oldScore
                newScore
                timestamp
            }
        }
        """
        result = await self.query(query, {"owner": wallet_address.lower()})
        return result.get("scoreUpdates", [])
    
    async def get_defi_activity(self, wallet_address: str) -> Dict:
        """Aggregate DeFi activity from badges and passport"""
        badges = await self.get_user_badges(wallet_address)
        passport = await self.get_user_passport(wallet_address)
        
        # Count badge types
        badge_types = {}
        for badge in badges:
            badge_type = badge.get("badgeType", "unknown")
            badge_types[badge_type] = badge_types.get(badge_type, 0) + 1
        
        return {
            "wallet_address": wallet_address,
            "total_badges": len(badges),
            "badge_breakdown": badge_types,
            "credit_score": passport.get("creditScore", 0) if passport else 0,
            "poh_score": passport.get("pohScore", 0) if passport else 0,
            "onchain_activity": passport.get("onchainActivity", 0) if passport else 0,
            "first_activity": badges[-1].get("mintedAt") if badges else None,
            "last_activity": badges[0].get("mintedAt") if badges else None
        }
    
    async def get_global_stats(self) -> Dict:
        """Get ecosystem-wide statistics"""
        query = """
        query GetGlobalStats {
            globalStats(first: 1) {
                id
                totalBadges
                totalPassports
                totalUsers
                averageScore
            }
        }
        """
        result = await self.query(query)
        stats = result.get("globalStats", [])
        return stats[0] if stats else {}
    
    async def search_high_score_users(self, min_score: int = 700) -> List[Dict]:
        """Find users with high credit scores"""
        query = """
        query GetHighScoreUsers($minScore: Int!) {
            passports(where: {creditScore_gte: $minScore}, orderBy: creditScore, orderDirection: desc, first: 20) {
                id
                owner
                creditScore
                badgeCount
                lastUpdated
            }
        }
        """
        result = await self.query(query, {"minScore": min_score})
        return result.get("passports", [])
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

# Singleton instance
_graph_client = None

def get_graph_client() -> GraphClient:
    """Get or create GraphClient singleton"""
    global _graph_client
    if _graph_client is None:
        _graph_client = GraphClient()
    return _graph_client
