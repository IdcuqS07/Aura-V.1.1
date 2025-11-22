import sys
sys.path.insert(0, '..')

from proof_service import ProofService

def test_generate_proof():
    user_data = {
        "wallet_address": "0x1234567890abcdef",
        "credit_score": 750,
        "reputation_score": 85.5
    }
    
    proof = ProofService.generate_proof(user_data)
    
    assert "proof_hash" in proof
    assert proof["proof_hash"].startswith("0x")
    assert proof["is_valid"] is True
    assert proof["metadata"]["risk_level"] == "low"

def test_verify_proof():
    user_data = {
        "wallet_address": "0x1234567890abcdef",
        "credit_score": 750,
        "reputation_score": 85.5
    }
    
    proof = ProofService.generate_proof(user_data)
    is_valid = ProofService.verify_proof(proof["proof_hash"], user_data)
    
    assert is_valid is True

def test_risk_calculation():
    assert ProofService._calculate_risk(800) == "low"
    assert ProofService._calculate_risk(650) == "medium"
    assert ProofService._calculate_risk(500) == "high"

if __name__ == "__main__":
    test_generate_proof()
    test_verify_proof()
    test_risk_calculation()
    print("✅ All tests passed!")
