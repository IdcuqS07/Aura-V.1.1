"""
Advanced Reputation Engine
Calculates reputation scores using graph analysis and ML
"""

import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from feature_store import feature_store

class ReputationEngine:
    """Advanced reputation scoring with graph analysis"""
    
    def __init__(self):
        self.weights = {
            'poh_score': 0.25,
            'badge_count': 0.15,
            'social_score': 0.20,
            'onchain_activity': 0.20,
            'network_trust': 0.10,
            'temporal_consistency': 0.10
        }
    
    def calculate_reputation(self, wallet_address: str, db) -> Dict:
        """Calculate comprehensive reputation score"""
        
        # Get features from feature store
        features = feature_store.get_user_features(wallet_address)
        
        # Calculate component scores
        poh_component = self._calculate_poh_component(features)
        badge_component = self._calculate_badge_component(features)
        social_component = self._calculate_social_component(features)
        onchain_component = self._calculate_onchain_component(features)
        network_component = self._calculate_network_trust(wallet_address, db)
        temporal_component = self._calculate_temporal_consistency(wallet_address, db)
        
        # Weighted sum
        reputation_score = (
            poh_component * self.weights['poh_score'] +
            badge_component * self.weights['badge_count'] +
            social_component * self.weights['social_score'] +
            onchain_component * self.weights['onchain_activity'] +
            network_component * self.weights['network_trust'] +
            temporal_component * self.weights['temporal_consistency']
        ) * 1000  # Scale to 0-1000
        
        return {
            'reputation_score': int(reputation_score),
            'components': {
                'poh': int(poh_component * 100),
                'badges': int(badge_component * 100),
                'social': int(social_component * 100),
                'onchain': int(onchain_component * 100),
                'network_trust': int(network_component * 100),
                'temporal': int(temporal_component * 100)
            },
            'tier': self._get_reputation_tier(reputation_score),
            'calculated_at': datetime.utcnow().isoformat()
        }
    
    def _calculate_poh_component(self, features: Dict) -> float:
        """PoH score component (0-1)"""
        poh_score = features.get('poh_score', 0)
        return min(poh_score / 100, 1.0)
    
    def _calculate_badge_component(self, features: Dict) -> float:
        """Badge count component (0-1)"""
        badge_count = features.get('badge_count', 0)
        return min(badge_count / 10, 1.0)  # Max at 10 badges
    
    def _calculate_social_component(self, features: Dict) -> float:
        """Social verification component (0-1)"""
        github = features.get('github_score', 0) / 100
        twitter = features.get('twitter_score', 0) / 100
        return (github * 0.6 + twitter * 0.4)
    
    def _calculate_onchain_component(self, features: Dict) -> float:
        """On-chain activity component (0-1)"""
        tx_count = features.get('onchain_tx_count', 0)
        # Logarithmic scale: 1 tx = 0.1, 10 tx = 0.5, 100 tx = 1.0
        if tx_count == 0:
            return 0
        return min(np.log10(tx_count + 1) / 2, 1.0)
    
    def _calculate_network_trust(self, wallet_address: str, db) -> float:
        """Network trust based on connections (0-1)"""
        # Count users who trust this user (have interacted)
        # Simplified: count badges from same contract
        try:
            badge_count = db.badges.count_documents({'wallet_address': wallet_address})
            return min(badge_count / 5, 1.0)
        except:
            return 0.5
    
    def _calculate_temporal_consistency(self, wallet_address: str, db) -> float:
        """Temporal consistency score (0-1)"""
        try:
            # Get user's first and last activity
            first_badge = db.badges.find_one(
                {'wallet_address': wallet_address},
                sort=[('issued_at', 1)]
            )
            last_badge = db.badges.find_one(
                {'wallet_address': wallet_address},
                sort=[('issued_at', -1)]
            )
            
            if not first_badge or not last_badge:
                return 0.5
            
            # Calculate account age in days
            first_date = datetime.fromisoformat(first_badge['issued_at'].replace('Z', '+00:00'))
            last_date = datetime.fromisoformat(last_badge['issued_at'].replace('Z', '+00:00'))
            age_days = (datetime.utcnow() - first_date).days
            
            # Reward consistent activity over time
            if age_days < 7:
                return 0.3
            elif age_days < 30:
                return 0.6
            elif age_days < 90:
                return 0.8
            else:
                return 1.0
        except:
            return 0.5
    
    def _get_reputation_tier(self, score: float) -> str:
        """Get reputation tier"""
        if score >= 850:
            return "Diamond"
        elif score >= 750:
            return "Platinum"
        elif score >= 650:
            return "Gold"
        elif score >= 550:
            return "Silver"
        else:
            return "Bronze"
    
    def calculate_trust_score(self, wallet_address: str, db) -> Dict:
        """Calculate trust score for lending/borrowing"""
        reputation = self.calculate_reputation(wallet_address, db)
        
        # Trust score is reputation normalized to 0-100
        trust_score = reputation['reputation_score'] / 10
        
        # Calculate lending parameters
        if trust_score >= 85:
            max_ltv = 75  # Loan-to-Value ratio
            interest_rate = 5.0
            collateral_ratio = 110
        elif trust_score >= 70:
            max_ltv = 60
            interest_rate = 7.5
            collateral_ratio = 130
        elif trust_score >= 50:
            max_ltv = 40
            interest_rate = 10.0
            collateral_ratio = 150
        else:
            max_ltv = 25
            interest_rate = 15.0
            collateral_ratio = 200
        
        return {
            'trust_score': int(trust_score),
            'reputation_score': reputation['reputation_score'],
            'tier': reputation['tier'],
            'lending_params': {
                'max_ltv': max_ltv,
                'interest_rate': interest_rate,
                'collateral_ratio': collateral_ratio,
                'max_loan_multiplier': max_ltv / 100
            },
            'components': reputation['components']
        }

reputation_engine = ReputationEngine()
