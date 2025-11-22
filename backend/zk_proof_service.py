import subprocess
import json
import hashlib
from typing import Dict, Any

class ZKProofService:
    def __init__(self, circuits_path: str = "../circuits"):
        self.circuits_path = circuits_path
    
    def calculate_score(self, user_data: Dict[str, Any]) -> int:
        """Calculate user's credibility score"""
        score = 0
        
        # GitHub score (0-30)
        if user_data.get('github_verified'):
            score += 30
        
        # Twitter score (0-20)
        if user_data.get('twitter_verified'):
            score += 20
        
        # Wallet age score (0-25)
        wallet_age_days = user_data.get('wallet_age_days', 0)
        score += min(25, wallet_age_days // 10)
        
        # Transaction count score (0-25)
        tx_count = user_data.get('transaction_count', 0)
        score += min(25, tx_count // 5)
        
        return score
    
    def generate_nullifier(self, wallet_address: str, secret: str) -> str:
        """Generate nullifier hash"""
        data = f"{wallet_address}{secret}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def generate_proof(self, user_data: Dict[str, Any], threshold: int = 50) -> Dict[str, Any]:
        """Generate ZK proof for threshold"""
        score = self.calculate_score(user_data)
        
        if score < threshold:
            return {
                "success": False,
                "error": f"Score {score} below threshold {threshold}"
            }
        
        # Prepare input
        secret = user_data.get('secret', 'default_secret')
        nullifier = self.generate_nullifier(user_data['wallet_address'], secret)
        
        input_data = {
            "threshold": str(threshold),
            "nullifierHash": nullifier,
            "githubScore": str(30 if user_data.get('github_verified') else 0),
            "twitterScore": str(20 if user_data.get('twitter_verified') else 0),
            "walletAge": str(min(25, user_data.get('wallet_age_days', 0) // 10)),
            "transactionCount": str(min(25, user_data.get('transaction_count', 0) // 5)),
            "secret": secret
        }
        
        # Generate proof using Node.js script
        try:
            result = subprocess.run(
                ['node', f'{self.circuits_path}/generate_proof.js'] + list(input_data.values()),
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                proof_data = json.loads(result.stdout)
                return {
                    "success": True,
                    "proof": proof_data,
                    "score": score,
                    "threshold": threshold,
                    "nullifier": nullifier
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def verify_proof(self, proof: Dict[str, Any], public_signals: list) -> bool:
        """Verify ZK proof"""
        try:
            # Call verification through Node.js
            input_data = {
                "proof": proof,
                "publicSignals": public_signals
            }
            
            result = subprocess.run(
                ['node', '-e', f'''
                const snarkjs = require("snarkjs");
                const fs = require("fs");
                const vKey = JSON.parse(fs.readFileSync("{self.circuits_path}/build/verification_key.json"));
                const input = {json.dumps(input_data)};
                snarkjs.groth16.verify(vKey, input.publicSignals, input.proof).then(res => {{
                    console.log(res);
                }});
                '''],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return result.stdout.strip() == 'true'
        except Exception:
            return False
