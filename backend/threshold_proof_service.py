import subprocess
import json
import hashlib
from typing import Dict, Optional

class ThresholdProofService:
    """Service for generating and verifying ZK threshold proofs"""
    
    @staticmethod
    def calculate_score(user_data: Dict) -> int:
        """Calculate user score from various metrics"""
        score = 0
        
        # GitHub verification (0-30 points)
        if user_data.get('github_verified'):
            score += 30
        
        # Twitter verification (0-20 points)
        if user_data.get('twitter_verified'):
            score += 20
        
        # Wallet age (0-25 points)
        wallet_age_days = user_data.get('wallet_age_days', 0)
        score += min(25, wallet_age_days // 10)
        
        # Transaction count (0-25 points)
        tx_count = user_data.get('transaction_count', 0)
        score += min(25, tx_count // 5)
        
        return score
    
    @staticmethod
    def generate_proof(user_data: Dict, threshold: int = 50) -> Optional[Dict]:
        """Generate ZK proof that score >= threshold without revealing actual score"""
        try:
            score = ThresholdProofService.calculate_score(user_data)
            
            # Generate secret
            secret = hashlib.sha256(user_data.get('wallet_address', '').encode()).hexdigest()
            
            # Prepare circuit inputs
            circuit_input = {
                "threshold": threshold,
                "nullifierHash": secret[:64],
                "githubScore": 30 if user_data.get('github_verified') else 0,
                "twitterScore": 20 if user_data.get('twitter_verified') else 0,
                "walletAge": min(25, user_data.get('wallet_age_days', 0) // 10),
                "transactionCount": min(25, user_data.get('transaction_count', 0) // 5),
                "secret": secret[:64]
            }
            
            # For demo: return proof without actual circuit execution
            proof_hash = hashlib.sha256(json.dumps(circuit_input).encode()).hexdigest()
            
            return {
                "proof_hash": proof_hash,
                "is_valid": score >= threshold,
                "threshold": threshold,
                "nullifier": secret[:64],
                "timestamp": user_data.get('timestamp')
            }
            
        except Exception as e:
            print(f"Error generating proof: {e}")
            return None
    
    @staticmethod
    def verify_proof(proof_hash: str, nullifier: str, threshold: int) -> bool:
        """Verify a threshold proof"""
        # In production, this would verify the actual ZK proof
        # For now, we validate the proof hash format
        return len(proof_hash) == 64 and len(nullifier) == 64
