#!/usr/bin/env python3
"""Standalone test for threshold proof without running full server"""

import sys
sys.path.append('backend')

from threshold_proof_service import ThresholdProofService

# Test data
test_cases = [
    {
        "name": "High Score User",
        "data": {
            "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
            "github_verified": True,
            "twitter_verified": True,
            "wallet_age_days": 200,
            "transaction_count": 100
        },
        "threshold": 50
    },
    {
        "name": "Medium Score User",
        "data": {
            "wallet_address": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
            "github_verified": True,
            "twitter_verified": False,
            "wallet_age_days": 50,
            "transaction_count": 20
        },
        "threshold": 50
    },
    {
        "name": "Low Score User",
        "data": {
            "wallet_address": "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
            "github_verified": False,
            "twitter_verified": False,
            "wallet_age_days": 10,
            "transaction_count": 5
        },
        "threshold": 50
    }
]

print("=" * 60)
print("ZK THRESHOLD PROOF TEST")
print("=" * 60)

for test in test_cases:
    print(f"\n📊 Test: {test['name']}")
    print("-" * 60)
    
    # Calculate score
    score = ThresholdProofService.calculate_score(test['data'])
    print(f"Total Score: {score}/100")
    
    # Generate proof
    proof = ThresholdProofService.generate_proof(test['data'], test['threshold'])
    
    if proof:
        print(f"Threshold: {proof['threshold']}")
        print(f"Valid: {'✅ YES' if proof['is_valid'] else '❌ NO'}")
        print(f"Proof Hash: {proof['proof_hash'][:32]}...")
        print(f"Nullifier: {proof['nullifier'][:32]}...")
    else:
        print("❌ Failed to generate proof")

print("\n" + "=" * 60)
print("Score Breakdown:")
print("- GitHub Verified: 30 points")
print("- Twitter Verified: 20 points")
print("- Wallet Age: 25 points max (1 per 10 days)")
print("- Transactions: 25 points max (1 per 5 txs)")
print("- Total: 100 points max")
print("=" * 60)
