#!/usr/bin/env python3
"""
Standalone PoH API - Bypass FastAPI routing issues
Run: uvicorn standalone_poh_api:app --host 0.0.0.0 --port 9001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime, timezone

# MongoDB
mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv("DB_NAME", "aura_protocol")]

app = FastAPI(title="Aura PoH API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class EnrollRequest(BaseModel):
    user_id: str
    wallet_address: str
    github_code: Optional[str] = None
    twitter_code: Optional[str] = None

class ProveRequest(BaseModel):
    enrollment_id: str
    identity_secret: str

class IssueRequest(BaseModel):
    proof_hash: str
    nullifier: str
    wallet_address: str
    public_signals: list

# Routes
@app.get("/")
async def root():
    return {"message": "Aura PoH API", "status": "online"}

@app.get("/api/")
async def api_root():
    return {"message": "Aura PoH API", "status": "online"}

@app.post("/enroll")
async def enroll_no_prefix(request: EnrollRequest):
    return await enroll(request)

@app.post("/api/poh/enroll")
async def enroll(request: EnrollRequest):
    from polygon_id_service import polygon_id_service
    from onchain_service import get_onchain_data
    
    try:
        # Get on-chain data
        try:
            onchain_data = await get_onchain_data(request.wallet_address)
        except:
            onchain_data = {'score': 5, 'tx_count': 0, 'balance': '0'}
        
        score = onchain_data.get('score', 5)
        
        # Create attestations
        attestations = {
            'github_hash': polygon_id_service.create_identity_hash(None),
            'twitter_hash': polygon_id_service.create_identity_hash(None),
            'onchain_hash': polygon_id_service.create_identity_hash(onchain_data),
            'score': score
        }
        
        # Store enrollment
        enrollment = {
            'id': str(uuid.uuid4()),
            'user_id': request.user_id,
            'wallet_address': request.wallet_address,
            'attestations': attestations,
            'raw_data': {'onchain': onchain_data},
            'status': 'pending',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.enrollments.insert_one(enrollment)
        
        return {
            'success': True,
            'enrollment_id': enrollment['id'],
            'attestations': attestations,
            'score': score,
            'verification_level': 'low' if score < 30 else 'medium' if score < 70 else 'high'
        }
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/poh/prove")
async def prove(request: ProveRequest):
    from polygon_id_service import polygon_id_service
    
    try:
        enrollment = await db.enrollments.find_one({'id': request.enrollment_id})
        if not enrollment:
            raise HTTPException(404, "Enrollment not found")
        
        user_did = f"did:polygonid:polygon:amoy:{enrollment['wallet_address']}"
        
        credential = polygon_id_service.create_credential(
            user_did=user_did,
            attestations=enrollment['attestations'],
            score=enrollment['attestations']['score']
        )
        
        proof = polygon_id_service.generate_proof(
            credential=credential,
            identity_secret=request.identity_secret
        )
        
        proof_doc = {
            'id': str(uuid.uuid4()),
            'enrollment_id': request.enrollment_id,
            'proof_hash': proof['proof_hash'],
            'nullifier': proof['nullifier'],
            'public_signals': proof['public_signals'],
            'credential': credential,
            'status': 'completed',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.proofs.insert_one(proof_doc)
        await db.enrollments.update_one(
            {'id': request.enrollment_id},
            {'$set': {'status': 'proof_generated'}}
        )
        
        return {
            'success': True,
            'proof_hash': proof['proof_hash'],
            'nullifier': proof['nullifier'],
            'public_signals': proof['public_signals'],
            'credential_id': credential['id']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/poh/issue")
async def issue(request: IssueRequest):
    from blockchain import polygon_integration
    from polygon_id_service import polygon_id_service
    
    try:
        proof_doc = await db.proofs.find_one({'proof_hash': request.proof_hash})
        if not proof_doc:
            raise HTTPException(404, "Proof not found")
        
        is_valid = polygon_id_service.verify_proof(proof_doc)
        if not is_valid:
            raise HTTPException(400, "Invalid proof")
        
        existing_badge = await db.badges.find_one({'nullifier': request.nullifier})
        if existing_badge:
            raise HTTPException(400, "Badge already issued")
        
        # Mint on-chain
        mint_result = await polygon_integration.mint_badge(
            request.wallet_address,
            "proof_of_humanity",
            request.proof_hash
        )
        
        if not mint_result:
            raise HTTPException(500, "Minting failed")
        
        tx_hash = mint_result['tx_hash'] if isinstance(mint_result, dict) else mint_result
        # Ensure 0x prefix
        if not tx_hash.startswith('0x'):
            tx_hash = '0x' + tx_hash
        token_id = await db.badges.count_documents({}) + 1
        
        badge = {
            'id': str(uuid.uuid4()),
            'wallet_address': request.wallet_address,
            'nullifier': request.nullifier,
            'proof_hash': request.proof_hash,
            'token_id': token_id,
            'tx_hash': tx_hash,
            'score': request.public_signals[0],
            'verification_level': 'low' if request.public_signals[0] < 30 else 'medium',
            'issued_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.badges.insert_one(badge)
        
        return {
            'success': True,
            'tx_hash': tx_hash,
            'badge_id': badge['id'],
            'token_id': token_id,
            'message': 'Badge minted successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9001)
