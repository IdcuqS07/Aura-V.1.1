"""
Test Proof of Humanity Flow
Run: python test_poh_flow.py
"""

import asyncio
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = "http://localhost:9000"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "aura_protocol")

# Test wallet
TEST_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"

async def test_poh_flow():
    print("🧪 Testing Proof of Humanity Flow\n")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    async with httpx.AsyncClient() as http_client:
        
        # Step 1: Enroll (without OAuth for testing)
        print("📝 Step 1: Enrollment...")
        try:
            enroll_resp = await http_client.post(
                f"{BACKEND_URL}/api/poh/enroll",
                json={
                    "user_id": TEST_WALLET,
                    "wallet_address": TEST_WALLET,
                    "github_code": None,
                    "twitter_code": None
                }
            )
            enroll_data = enroll_resp.json()
            
            if enroll_data.get("success"):
                print(f"✅ Enrollment successful!")
                print(f"   Enrollment ID: {enroll_data['enrollment_id']}")
                print(f"   Score: {enroll_data['score']}/100")
                print(f"   Level: {enroll_data['verification_level']}")
                enrollment_id = enroll_data['enrollment_id']
            else:
                print(f"❌ Enrollment failed: {enroll_data}")
                return
        except Exception as e:
            print(f"❌ Enrollment error: {str(e)}")
            return
        
        # Step 2: Generate Proof
        print("\n🔐 Step 2: Generate ZK Proof...")
        try:
            prove_resp = await http_client.post(
                f"{BACKEND_URL}/api/poh/prove",
                json={
                    "enrollment_id": enrollment_id,
                    "identity_secret": TEST_WALLET
                }
            )
            prove_data = prove_resp.json()
            
            if prove_data.get("success"):
                print(f"✅ Proof generated!")
                print(f"   Proof Hash: {prove_data['proof_hash'][:32]}...")
                print(f"   Nullifier: {prove_data['nullifier'][:32]}...")
                proof_hash = prove_data['proof_hash']
                nullifier = prove_data['nullifier']
                public_signals = prove_data['public_signals']
            else:
                print(f"❌ Proof generation failed: {prove_data}")
                return
        except Exception as e:
            print(f"❌ Proof generation error: {str(e)}")
            return
        
        # Step 3: Issue Badge
        print("\n🎖️  Step 3: Issue Badge...")
        try:
            issue_resp = await http_client.post(
                f"{BACKEND_URL}/api/poh/issue",
                json={
                    "proof_hash": proof_hash,
                    "nullifier": nullifier,
                    "wallet_address": TEST_WALLET,
                    "public_signals": public_signals
                }
            )
            issue_data = issue_resp.json()
            
            if issue_data.get("success"):
                print(f"✅ Badge issued!")
                print(f"   TX Hash: {issue_data['tx_hash']}")
                print(f"   Token ID: {issue_data['token_id']}")
                print(f"   Badge ID: {issue_data['badge_id']}")
            else:
                print(f"❌ Badge issuance failed: {issue_data}")
                return
        except Exception as e:
            print(f"❌ Badge issuance error: {str(e)}")
            return
        
        # Verify in Database
        print("\n📊 Verifying Database...")
        enrollment = await db.enrollments.find_one({"id": enrollment_id})
        proof = await db.proofs.find_one({"proof_hash": proof_hash})
        badge = await db.badges.find_one({"nullifier": nullifier})
        
        print(f"   Enrollment: {'✅' if enrollment else '❌'}")
        print(f"   Proof: {'✅' if proof else '❌'}")
        print(f"   Badge: {'✅' if badge else '❌'}")
        
        # Test Duplicate Prevention
        print("\n🔒 Testing Duplicate Prevention...")
        try:
            duplicate_resp = await http_client.post(
                f"{BACKEND_URL}/api/poh/issue",
                json={
                    "proof_hash": proof_hash,
                    "nullifier": nullifier,
                    "wallet_address": TEST_WALLET,
                    "public_signals": public_signals
                }
            )
            duplicate_data = duplicate_resp.json()
            
            if duplicate_resp.status_code == 400:
                print(f"✅ Duplicate prevention working!")
            else:
                print(f"⚠️  Duplicate was allowed: {duplicate_data}")
        except Exception as e:
            print(f"✅ Duplicate prevented: {str(e)}")
        
        print("\n🎉 All tests completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_poh_flow())
