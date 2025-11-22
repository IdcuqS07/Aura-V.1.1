#!/usr/bin/env python3
"""
Test script for full Proof of Humanity flow
Tests: Enroll → Prove → Issue Badge
"""

import requests
import json
import time

# Configuration
BASE_URL = "https://www.aurapass.xyz/api"
# BASE_URL = "http://localhost:9000/api"  # For local testing

TEST_USER = {
    "user_id": "test_user_" + str(int(time.time())),
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
}

def print_step(step, title):
    print(f"\n{'='*60}")
    print(f"STEP {step}: {title}")
    print('='*60)

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return data
    except:
        print(f"Response: {response.text}")
        return None

# STEP 1: Enroll User
print_step(1, "ENROLL USER")
print(f"User ID: {TEST_USER['user_id']}")
print(f"Wallet: {TEST_USER['wallet_address']}")

enroll_response = requests.post(
    f"{BASE_URL}/poh/enroll",
    json={
        "user_id": TEST_USER['user_id'],
        "wallet_address": TEST_USER['wallet_address']
        # No github_code or twitter_code = only on-chain verification
    }
)

enroll_data = print_response(enroll_response)

if not enroll_data or not enroll_data.get('success'):
    print("\n❌ Enrollment failed!")
    exit(1)

enrollment_id = enroll_data['enrollment_id']
score = enroll_data['score']
print(f"\n✅ Enrollment successful!")
print(f"   Enrollment ID: {enrollment_id}")
print(f"   Score: {score}/100")
print(f"   Level: {enroll_data['verification_level']}")

# STEP 2: Generate ZK Proof
print_step(2, "GENERATE ZK PROOF")
print(f"Enrollment ID: {enrollment_id}")

# Generate a simple identity secret (in production, this would be user's private data)
identity_secret = f"secret_{TEST_USER['user_id']}"

prove_response = requests.post(
    f"{BASE_URL}/poh/prove",
    json={
        "enrollment_id": enrollment_id,
        "identity_secret": identity_secret
    }
)

prove_data = print_response(prove_response)

if not prove_data or not prove_data.get('success'):
    print("\n❌ Proof generation failed!")
    exit(1)

proof_hash = prove_data['proof_hash']
nullifier = prove_data['nullifier']
public_signals = prove_data['public_signals']

print(f"\n✅ Proof generated successfully!")
print(f"   Proof Hash: {proof_hash[:20]}...")
print(f"   Nullifier: {nullifier[:20]}...")
print(f"   Public Signals: {public_signals}")

# STEP 3: Issue Badge (Mint on-chain)
print_step(3, "ISSUE BADGE (MINT ON-CHAIN)")
print(f"Proof Hash: {proof_hash[:20]}...")
print(f"Wallet: {TEST_USER['wallet_address']}")

issue_response = requests.post(
    f"{BASE_URL}/poh/issue",
    json={
        "proof_hash": proof_hash,
        "nullifier": nullifier,
        "wallet_address": TEST_USER['wallet_address'],
        "public_signals": public_signals
    }
)

issue_data = print_response(issue_response)

if not issue_data or not issue_data.get('success'):
    print("\n❌ Badge issuance failed!")
    print("   This might be due to:")
    print("   - Missing POLYGON_PRIVATE_KEY in .env")
    print("   - Insufficient MATIC for gas")
    print("   - Contract not deployed")
    exit(1)

tx_hash = issue_data['tx_hash']
badge_id = issue_data['badge_id']
token_id = issue_data['token_id']

print(f"\n✅ Badge issued successfully!")
print(f"   Badge ID: {badge_id}")
print(f"   Token ID: {token_id}")
print(f"   TX Hash: {tx_hash}")
print(f"   PolygonScan: https://amoy.polygonscan.com/tx/{tx_hash}")

# SUMMARY
print_step("✓", "FLOW COMPLETED SUCCESSFULLY")
print(f"""
Summary:
--------
User ID:        {TEST_USER['user_id']}
Wallet:         {TEST_USER['wallet_address']}
Enrollment ID:  {enrollment_id}
Score:          {score}/100
Proof Hash:     {proof_hash[:20]}...
Badge ID:       {badge_id}
Token ID:       {token_id}
TX Hash:        {tx_hash}

View on PolygonScan:
https://amoy.polygonscan.com/tx/{tx_hash}

Next Steps:
-----------
1. Wait for transaction confirmation (~5-10 seconds)
2. Check badge on PolygonScan
3. Verify badge ownership on-chain
4. Test with GitHub/Twitter OAuth for higher score
""")

print("\n" + "="*60)
print("🎉 PROOF OF HUMANITY FLOW TEST COMPLETED!")
print("="*60 + "\n")
