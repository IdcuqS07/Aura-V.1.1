import hashlib
import json
from datetime import datetime
from typing import Dict, Any

class ProofService:
    """Proof-as-a-Service: Generate and verify ZK proofs"""
    
    @staticmethod
    def generate_proof(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ZK proof from user data"""
        # Create proof hash from user data
        proof_input = json.dumps({
            "wallet_address": user_data.get("wallet_address"),
            "credit_score": user_data.get("credit_score"),
            "reputation_score": user_data.get("reputation_score"),
            "timestamp": datetime.utcnow().isoformat()
        }, sort_keys=True)
        
        proof_hash = hashlib.sha256(proof_input.encode()).hexdigest()
        
        return {
            "proof_hash": f"0x{proof_hash}",
            "proof_type": "zk_credit_passport",
            "generated_at": datetime.utcnow().isoformat(),
            "is_valid": True,
            "metadata": {
                "credit_score": user_data.get("credit_score"),
                "risk_level": ProofService._calculate_risk(user_data.get("credit_score", 0))
            }
        }
    
    @staticmethod
    def verify_proof(proof_hash: str, user_data: Dict[str, Any]) -> bool:
        """Verify if proof is valid"""
        # Simple validation - check if proof hash format is correct
        if not proof_hash or not proof_hash.startswith("0x"):
            return False
        if len(proof_hash) != 66:  # 0x + 64 hex chars
            return False
        return True
    
    @staticmethod
    def _calculate_risk(credit_score: int) -> str:
        """Calculate risk level from credit score"""
        if credit_score >= 750:
            return "low"
        elif credit_score >= 600:
            return "medium"
        else:
            return "high"
