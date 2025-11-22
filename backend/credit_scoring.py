"""
Credit Scoring Service
Calculate credit score from multiple data sources
"""

from typing import Dict, Optional
from datetime import datetime

class CreditScoringService:
    """Calculate credit scores for users"""
    
    @staticmethod
    def calculate_credit_score(
        poh_score: int = 0,
        badge_count: int = 0,
        onchain_activity: int = 0,
        reputation: int = 0
    ) -> Dict:
        """
        Calculate credit score (0-1000)
        
        Formula:
        - PoH Score (0-100) × 4 = 0-400 points (40%)
        - Badge Count × 50 = 0-300 points (30%, max 6 badges)
        - On-chain Activity = 0-300 points (30%)
        """
        
        # PoH contribution (0-400, 40%)
        poh_contribution = min(poh_score * 4, 400)
        
        # Badge contribution (0-300, 30%)
        badge_contribution = min(badge_count * 50, 300)
        
        # On-chain contribution (0-300, 30%)
        onchain_contribution = min(onchain_activity, 300)
        
        # Reputation (bonus, not counted in main weights)
        reputation_contribution = 0
        
        # Total score
        total_score = (
            poh_contribution +
            badge_contribution +
            onchain_contribution +
            reputation_contribution
        )
        
        # Cap at 1000
        total_score = min(total_score, 1000)
        
        # Determine grade
        grade = CreditScoringService._get_grade(total_score)
        
        # Determine risk level
        risk_level = CreditScoringService._get_risk_level(total_score)
        
        return {
            "credit_score": total_score,
            "grade": grade,
            "risk_level": risk_level,
            "breakdown": {
                "poh_score": poh_contribution,
                "badge_count": badge_contribution,
                "onchain_activity": onchain_contribution,
                "reputation": reputation_contribution
            },
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def _get_grade(score: int) -> str:
        """Get credit grade from score"""
        if score >= 850:
            return "Excellent"
        elif score >= 750:
            return "Very Good"
        elif score >= 650:
            return "Good"
        elif score >= 550:
            return "Fair"
        else:
            return "Poor"
    
    @staticmethod
    def _get_risk_level(score: int) -> str:
        """Get risk level from score"""
        if score >= 750:
            return "low"
        elif score >= 550:
            return "medium"
        else:
            return "high"
    
    @staticmethod
    async def get_user_data_for_scoring(db, user_id: str) -> Dict:
        """Fetch all user data needed for scoring"""
        
        # Get PoH enrollment
        enrollment = await db.enrollments.find_one({"user_id": user_id})
        poh_score = enrollment.get("attestations", {}).get("score", 0) if enrollment else 0
        
        # Get badge count
        badge_count = await db.badges.count_documents({"wallet_address": user_id})
        
        # Get on-chain activity (simplified)
        onchain_activity = 0  # TODO: Calculate from transaction history
        
        # Get reputation (simplified)
        reputation = 0  # TODO: Calculate from protocol interactions
        
        return {
            "poh_score": poh_score,
            "badge_count": badge_count,
            "onchain_activity": onchain_activity,
            "reputation": reputation
        }

credit_scoring_service = CreditScoringService()
