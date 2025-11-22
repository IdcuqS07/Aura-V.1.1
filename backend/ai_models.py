"""
AI Risk Oracle - ML Models Implementation
4 Models: Credit Risk Classifier, Default Predictor, Fraud Detector, Terms Recommender
"""

import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime
import hashlib

class CreditRiskClassifier:
    """Binary classifier: Low/Medium/High risk"""
    
    def __init__(self):
        # Weights trained on synthetic data
        self.weights = np.array([0.25, 0.20, 0.15, 0.15, 0.10, 0.08, 0.07])
        self.thresholds = {'low': 0.7, 'medium': 0.4}
    
    def predict(self, features: np.ndarray) -> Tuple[str, float]:
        """Predict risk category and confidence"""
        score = np.dot(features, self.weights)
        
        if score >= self.thresholds['low']:
            return 'low', score
        elif score >= self.thresholds['medium']:
            return 'medium', score
        else:
            return 'high', score


class DefaultPredictor:
    """Predict probability of default (0-100%)"""
    
    def __init__(self):
        self.weights = np.array([0.30, 0.25, 0.20, 0.15, 0.10])
    
    def predict(self, features: np.ndarray) -> float:
        """Return default probability (0-100)"""
        # Inverse relationship: higher features = lower default risk
        trust_score = np.dot(features[:5], self.weights)
        default_prob = (1 - trust_score) * 100
        return max(0, min(100, default_prob))


class FraudDetector:
    """Anomaly detection for fraud"""
    
    def __init__(self):
        # Normal behavior thresholds
        self.normal_ranges = {
            'tx_velocity': (0.1, 0.9),
            'score_volatility': (0.0, 0.3),
            'activity_pattern': (0.2, 1.0)
        }
    
    def predict(self, features: Dict) -> Tuple[bool, float, List[str]]:
        """Return (is_fraud, likelihood, anomalies)"""
        anomalies = []
        anomaly_score = 0
        
        # Check transaction velocity
        tx_vel = features.get('tx_velocity', 0.5)
        if tx_vel > self.normal_ranges['tx_velocity'][1]:
            anomalies.append('Unusually high transaction velocity')
            anomaly_score += 0.4
        
        # Check score volatility
        score_vol = features.get('score_volatility', 0.1)
        if score_vol > self.normal_ranges['score_volatility'][1]:
            anomalies.append('High credit score volatility')
            anomaly_score += 0.3
        
        # Check activity pattern
        activity = features.get('activity_pattern', 0.5)
        if activity < self.normal_ranges['activity_pattern'][0]:
            anomalies.append('Suspicious activity pattern')
            anomaly_score += 0.3
        
        is_fraud = anomaly_score > 0.5
        likelihood = min(100, anomaly_score * 100)
        
        return is_fraud, likelihood, anomalies


class TermsRecommender:
    """Recommend optimal loan terms"""
    
    def __init__(self):
        self.base_rate = 5.0  # Base interest rate
        self.base_ltv = 0.75  # Base LTV ratio
    
    def recommend(self, risk_score: float, loan_amount: float) -> Dict:
        """Recommend interest rate, LTV, duration"""
        
        # Interest rate increases with risk
        interest_rate = self.base_rate + (risk_score / 10)
        
        # LTV decreases with risk
        ltv = self.base_ltv - (risk_score / 200)
        
        # Duration based on risk
        if risk_score < 30:
            duration_days = 90
            max_amount = loan_amount * 1.5
        elif risk_score < 60:
            duration_days = 60
            max_amount = loan_amount
        else:
            duration_days = 30
            max_amount = loan_amount * 0.5
        
        return {
            'interest_rate': round(interest_rate, 2),
            'max_ltv': round(ltv, 2),
            'duration_days': duration_days,
            'max_loan_amount': round(max_amount, 2),
            'collateral_ratio': round(1 / ltv, 2)
        }


class AIRiskOracleV2:
    """Enhanced AI Risk Oracle with 4 ML models"""
    
    def __init__(self):
        self.credit_classifier = CreditRiskClassifier()
        self.default_predictor = DefaultPredictor()
        self.fraud_detector = FraudDetector()
        self.terms_recommender = TermsRecommender()
    
    def extract_features(self, user_data: Dict) -> np.ndarray:
        """Extract 19 features from user data"""
        
        # Passport features (7)
        credit_score = user_data.get('credit_score', 0) / 1000
        poh_score = user_data.get('poh_score', 0) / 100
        badge_count = min(user_data.get('badge_count', 0) / 10, 1.0)
        onchain_activity = min(user_data.get('onchain_activity', 0) / 100, 1.0)
        account_age = min(user_data.get('account_age_days', 0) / 365, 1.0)
        reputation = user_data.get('reputation_score', 0) / 100
        verification = 1.0 if user_data.get('is_verified', False) else 0.0
        
        # Transaction features (4)
        tx_count = min(user_data.get('tx_count', 0) / 500, 1.0)
        tx_volume = min(user_data.get('tx_volume_usd', 0) / 100000, 1.0)
        tx_velocity = user_data.get('tx_velocity', 0.5)
        unique_contracts = min(user_data.get('unique_contracts', 0) / 20, 1.0)
        
        # DeFi features (4)
        borrowed = min(user_data.get('total_borrowed', 0) / 50000, 1.0)
        supplied = min(user_data.get('total_supplied', 0) / 75000, 1.0)
        repayment_rate = user_data.get('repayment_rate', 100) / 100
        liquidation_count = max(0, 1 - user_data.get('liquidation_count', 0) / 5)
        
        # Social features (2)
        github_score = user_data.get('github_score', 0) / 100
        twitter_score = user_data.get('twitter_score', 0) / 100
        
        # Market features (2)
        score_history = user_data.get('score_history', [500])
        score_volatility = self._calculate_volatility(score_history)
        score_trend = self._calculate_trend(score_history)
        
        return np.array([
            credit_score, poh_score, badge_count, onchain_activity,
            account_age, reputation, verification, tx_count,
            tx_volume, tx_velocity, unique_contracts, borrowed,
            supplied, repayment_rate, liquidation_count, github_score,
            twitter_score, score_volatility, score_trend
        ])
    
    def _calculate_volatility(self, score_history: List[float]) -> float:
        """Calculate score volatility (0-1)"""
        if len(score_history) < 2:
            return 0.0
        
        scores = np.array(score_history)
        volatility = np.std(scores) / 1000  # Normalize
        return min(1.0, volatility)
    
    def _calculate_trend(self, score_history: List[float]) -> float:
        """Calculate score trend (0-1, 0.5=neutral)"""
        if len(score_history) < 2:
            return 0.5
        
        change = (score_history[-1] - score_history[0]) / 1000
        trend = 0.5 + change
        return max(0, min(1, trend))
    
    def assess_risk(self, user_data: Dict) -> Dict:
        """Complete risk assessment using all 4 models"""
        
        # Extract features
        features = self.extract_features(user_data)
        
        # Model 1: Credit Risk Classification
        risk_category, risk_score = self.credit_classifier.predict(features)
        risk_score_normalized = (1 - risk_score) * 100  # Convert to 0-100 risk scale
        
        # Model 2: Default Prediction
        default_probability = self.default_predictor.predict(features)
        
        # Model 3: Fraud Detection
        fraud_features = {
            'tx_velocity': features[9],
            'score_volatility': features[17],
            'activity_pattern': features[3]
        }
        is_fraud, fraud_likelihood, anomalies = self.fraud_detector.predict(fraud_features)
        
        # Model 4: Terms Recommendation
        loan_amount = user_data.get('requested_loan_amount', 10000)
        terms = self.terms_recommender.recommend(risk_score_normalized, loan_amount)
        
        # Generate proof
        proof = self._generate_proof(user_data, risk_score_normalized)
        
        return {
            'risk_category': risk_category,
            'risk_score': round(risk_score_normalized, 2),
            'default_probability': round(default_probability, 2),
            'fraud_detected': is_fraud,
            'fraud_likelihood': round(fraud_likelihood, 2),
            'fraud_anomalies': anomalies,
            'recommended_terms': terms,
            'proof': proof,
            'timestamp': datetime.utcnow().isoformat(),
            'model_version': '2.0.0'
        }
    
    def _generate_proof(self, user_data: Dict, risk_score: float) -> Dict:
        """Generate cryptographic proof of assessment"""
        
        # Create proof hash
        proof_data = f"{user_data.get('wallet_address', '')}{risk_score}{datetime.utcnow().isoformat()}"
        proof_hash = hashlib.sha256(proof_data.encode()).hexdigest()
        
        # Create nullifier (for privacy)
        nullifier_data = f"{proof_hash}{user_data.get('wallet_address', '')}"
        nullifier = hashlib.sha256(nullifier_data.encode()).hexdigest()
        
        return {
            'proof_hash': f"0x{proof_hash}",
            'nullifier': f"0x{nullifier}",
            'oracle_address': '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678'
        }
    
    def batch_assess(self, users_data: List[Dict]) -> List[Dict]:
        """Batch assessment for multiple users"""
        return [self.assess_risk(user) for user in users_data]


# Singleton instance
ai_oracle_v2 = AIRiskOracleV2()
