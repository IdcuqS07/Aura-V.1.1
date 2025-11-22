"""
Feature Store for ML/Reputation Engine
Stores and retrieves features for credit scoring and risk assessment
"""

import redis
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import hashlib

class FeatureStore:
    """Feature store with Redis backend"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379/1"):
        self.redis = redis.from_url(redis_url)
        self.ttl = 3600  # 1 hour cache
    
    def _key(self, entity: str, feature_name: str) -> str:
        """Generate feature key"""
        return f"feature:{entity}:{feature_name}"
    
    def set_feature(self, entity: str, feature_name: str, value: any, ttl: int = None):
        """Store feature value"""
        key = self._key(entity, feature_name)
        self.redis.setex(key, ttl or self.ttl, json.dumps(value))
    
    def get_feature(self, entity: str, feature_name: str) -> Optional[any]:
        """Retrieve feature value"""
        key = self._key(entity, feature_name)
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    def get_features(self, entity: str, feature_names: List[str]) -> Dict:
        """Retrieve multiple features"""
        return {
            name: self.get_feature(entity, name)
            for name in feature_names
        }
    
    def set_user_features(self, wallet_address: str, features: Dict):
        """Store all user features"""
        for name, value in features.items():
            self.set_feature(wallet_address, name, value)
    
    def get_user_features(self, wallet_address: str) -> Dict:
        """Get all user features for scoring"""
        feature_names = [
            "poh_score",
            "badge_count",
            "github_score",
            "twitter_score",
            "onchain_tx_count",
            "onchain_balance",
            "account_age_days",
            "last_activity",
            "risk_score",
            "credit_score"
        ]
        return self.get_features(wallet_address, feature_names)
    
    def compute_and_store_features(self, wallet_address: str, raw_data: Dict):
        """Compute features from raw data and store"""
        features = {}
        
        # PoH features
        if 'poh_score' in raw_data:
            features['poh_score'] = raw_data['poh_score']
        
        # Badge features
        if 'badge_count' in raw_data:
            features['badge_count'] = raw_data['badge_count']
        
        # GitHub features
        if 'github_data' in raw_data:
            gh = raw_data['github_data']
            features['github_score'] = gh.get('score', 0)
            features['github_repos'] = gh.get('public_repos', 0)
            features['github_followers'] = gh.get('followers', 0)
        
        # Twitter features
        if 'twitter_data' in raw_data:
            tw = raw_data['twitter_data']
            features['twitter_score'] = tw.get('score', 0)
            features['twitter_followers'] = tw.get('followers_count', 0)
        
        # On-chain features
        if 'onchain_data' in raw_data:
            oc = raw_data['onchain_data']
            features['onchain_tx_count'] = oc.get('tx_count', 0)
            features['onchain_balance'] = oc.get('balance', '0')
            features['onchain_score'] = oc.get('score', 0)
        
        # Temporal features
        features['last_activity'] = datetime.utcnow().isoformat()
        
        self.set_user_features(wallet_address, features)
        return features
    
    def get_feature_vector(self, wallet_address: str) -> List[float]:
        """Get feature vector for ML model"""
        features = self.get_user_features(wallet_address)
        
        return [
            float(features.get('poh_score', 0)),
            float(features.get('badge_count', 0)),
            float(features.get('github_score', 0)),
            float(features.get('twitter_score', 0)),
            float(features.get('onchain_tx_count', 0)),
            float(features.get('github_repos', 0)),
            float(features.get('github_followers', 0)),
            float(features.get('twitter_followers', 0))
        ]
    
    def invalidate_features(self, wallet_address: str):
        """Invalidate cached features"""
        pattern = f"feature:{wallet_address}:*"
        for key in self.redis.scan_iter(pattern):
            self.redis.delete(key)

feature_store = FeatureStore()
