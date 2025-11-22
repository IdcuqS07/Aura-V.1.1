"""
Proof of Humanity (PoH) Routes
Endpoints: /poh/enroll, /poh/prove, /poh/issue
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid
import logging
from typing import Optional, Dict

from polygon_id_service import polygon_id_service
from github_service import exchange_code_for_token as github_exchange, get_github_data
from twitter_service import exchange_code_for_token as twitter_exchange, get_twitter_data
from onchain_service import get_onchain_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/poh", tags=["Proof of Humanity"])


# ============ MODELS ============

class EnrollRequest(BaseModel):
    user_id: str
    wallet_address: str
    github_code: Optional[str] = None
    twitter_code: Optional[str] = None
    twitter_redirect_uri: Optional[str] = None


class ProveRequest(BaseModel):
    enrollment_id: str
    identity_secret: str


class IssueRequest(BaseModel):
    proof_hash: str
    nullifier: str
    wallet_address: str
    public_signals: list


# ============ ROUTES ============

@router.get("/callback")
async def oauth_callback(code: Optional[str] = None, state: Optional[str] = None):
    """
    OAuth callback handler for GitHub and Twitter
    Redirects back to frontend with code parameter
    """
    from fastapi.responses import RedirectResponse
    
    if not code:
        return RedirectResponse(url="https://www.aurapass.xyz/verify?error=no_code")
    
    # Redirect back to frontend with code
    redirect_url = f"https://www.aurapass.xyz/verify?code={code}"
    if state:
        redirect_url += f"&state={state}"
    
    return RedirectResponse(url=redirect_url, status_code=302)


# DB will be injected by server.py
db = None

def set_db(database):
    global db
    db = database

@router.post("/enroll")
async def enroll_user(request: EnrollRequest):
    """
    Step 1: Enroll user with identity signals
    
    Process:
    1. Verify OAuth tokens
    2. Fetch identity data (GitHub, Twitter, on-chain)
    3. Calculate attestations
    4. Store enrollment
    
    Returns:
        enrollment_id, attestations, score
    """
    try:
        # Verify GitHub
        github_data = None
        if request.github_code:
            try:
                github_token = await github_exchange(request.github_code)
                github_data = await get_github_data(github_token)
            except Exception as e:
                logger.error(f"GitHub verification failed: {str(e)}")
        
        # Verify Twitter
        twitter_data = None
        if request.twitter_code:
            try:
                twitter_token = await twitter_exchange(request.twitter_code, request.twitter_redirect_uri or "")
                twitter_data = await get_twitter_data(twitter_token)
            except Exception as e:
                logger.error(f"Twitter verification failed: {str(e)}")
        
        # Fetch on-chain data
        onchain_data = None
        try:
            onchain_data = await get_onchain_data(request.wallet_address)
        except Exception as e:
            logger.warning(f"On-chain data fetch failed (continuing without it): {str(e)}")
            onchain_data = {'score': 0, 'tx_count': 0, 'balance': '0'}
        
        # Calculate score
        score = calculate_uniqueness_score(github_data, twitter_data, onchain_data)
        
        # Create attestations (hashed)
        attestations = {
            'github_hash': polygon_id_service.create_identity_hash(github_data),
            'twitter_hash': polygon_id_service.create_identity_hash(twitter_data),
            'onchain_hash': polygon_id_service.create_identity_hash(onchain_data),
            'score': score
        }
        
        # Store enrollment
        enrollment = {
            'id': str(uuid.uuid4()),
            'user_id': request.user_id,
            'wallet_address': request.wallet_address,
            'attestations': attestations,
            'raw_data': {
                'github': github_data,
                'twitter': twitter_data,
                'onchain': onchain_data
            },
            'status': 'pending',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.enrollments.insert_one(enrollment)
        
        logger.info(f"User {request.user_id} enrolled with score {score}")
        
        return {
            'success': True,
            'enrollment_id': enrollment['id'],
            'attestations': attestations,
            'score': score,
            'verification_level': polygon_id_service._get_verification_level(score)
        }
        
    except Exception as e:
        logger.error(f"Enrollment error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.post("/prove")
async def generate_proof(request: ProveRequest):
    """
    Step 2: Generate ZK proof from enrollment
    
    Process:
    1. Fetch enrollment data
    2. Create verifiable credential
    3. Generate ZK proof
    4. Store proof
    
    Returns:
        proof, nullifier, public_signals
    """
    try:
        # Fetch enrollment
        enrollment = await db.enrollments.find_one({'id': request.enrollment_id})
        if not enrollment:
            raise HTTPException(404, "Enrollment not found")
        
        # Create user DID (simplified)
        user_did = f"did:polygonid:polygon:amoy:{enrollment['wallet_address']}"
        
        # Create verifiable credential
        credential = polygon_id_service.create_credential(
            user_did=user_did,
            attestations=enrollment['attestations'],
            score=enrollment['attestations']['score']
        )
        
        # Generate ZK proof
        proof = polygon_id_service.generate_proof(
            credential=credential,
            identity_secret=request.identity_secret
        )
        
        # Store proof
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
        
        # Update enrollment status
        await db.enrollments.update_one(
            {'id': request.enrollment_id},
            {'$set': {'status': 'proof_generated'}}
        )
        
        logger.info(f"Proof generated for enrollment {request.enrollment_id}")
        
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
        logger.error(f"Proof generation error: {str(e)}")
        raise HTTPException(500, detail=str(e))


@router.post("/issue")
async def issue_badge(request: IssueRequest):
    """
    Step 3: Verify proof and mint ZK-ID Badge
    
    Process:
    1. Verify ZK proof
    2. Check nullifier uniqueness
    3. Mint Soulbound NFT
    4. Store badge
    
    Returns:
        tx_hash, badge_id
    """
    try:
        # Find proof
        proof_doc = await db.proofs.find_one({'proof_hash': request.proof_hash})
        if not proof_doc:
            raise HTTPException(404, "Proof not found")
        
        # Verify proof
        is_valid = polygon_id_service.verify_proof(proof_doc)
        if not is_valid:
            raise HTTPException(400, "Invalid proof")
        
        # Check nullifier uniqueness
        existing_badge = await db.badges.find_one({'nullifier': request.nullifier})
        if existing_badge:
            raise HTTPException(400, "Badge already issued for this identity")
        
        # Mint SBT on-chain
        from blockchain import polygon_integration
        
        mint_result = await polygon_integration.mint_badge(
            request.wallet_address,
            "proof_of_humanity",
            request.proof_hash
        )
        
        if not mint_result:
            raise HTTPException(500, "Failed to mint badge on-chain")
        
        tx_hash = mint_result['tx_hash'] if isinstance(mint_result, dict) else mint_result
        token_id = await db.badges.count_documents({}) + 1
        
        # Store badge
        badge = {
            'id': str(uuid.uuid4()),
            'wallet_address': request.wallet_address,
            'nullifier': request.nullifier,
            'proof_hash': request.proof_hash,
            'token_id': token_id,
            'tx_hash': tx_hash,
            'score': request.public_signals[0],
            'verification_level': polygon_id_service._get_verification_level(request.public_signals[0]),
            'issued_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.badges.insert_one(badge)
        
        logger.info(f"Badge #{token_id} issued to {request.wallet_address}")
        
        # Auto-update or create passport
        await update_or_create_passport(db, request.wallet_address)
        
        return {
            'success': True,
            'tx_hash': tx_hash,
            'badge_id': badge['id'],
            'token_id': token_id,
            'message': 'ZK-ID Badge issued successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Badge issuance error: {str(e)}")
        raise HTTPException(500, detail=str(e))


# ============ HELPER FUNCTIONS ============

def calculate_uniqueness_score(github_data: Optional[Dict], twitter_data: Optional[Dict], onchain_data: Dict) -> int:
    """Calculate uniqueness score from identity data"""
    score = 0
    
    # GitHub (0-40 points)
    if github_data:
        score += github_data.get('score', 0)
    
    # Twitter (0-30 points)
    if twitter_data:
        score += twitter_data.get('score', 0)
    
    # On-chain (0-30 points)
    score += onchain_data.get('score', 0)
    
    return min(score, 100)


async def update_or_create_passport(db, wallet_address: str):
    """Update or create passport after badge mint"""
    from credit_scoring import credit_scoring_service
    
    try:
        # Get user data
        user_data = await credit_scoring_service.get_user_data_for_scoring(db, wallet_address)
        
        # Calculate credit score
        score_result = credit_scoring_service.calculate_credit_score(
            poh_score=user_data["poh_score"],
            badge_count=user_data["badge_count"],
            onchain_activity=user_data["onchain_activity"],
            reputation=user_data["reputation"]
        )
        
        # Check if passport exists
        existing_passport = await db.passports.find_one({"user_id": wallet_address})
        
        if existing_passport:
            # Update existing passport
            await db.passports.update_one(
                {"user_id": wallet_address},
                {"$set": {
                    "credit_score": score_result["credit_score"],
                    "grade": score_result["grade"],
                    "risk_level": score_result["risk_level"],
                    "breakdown": score_result["breakdown"],
                    "poh_score": user_data["poh_score"],
                    "badge_count": user_data["badge_count"],
                    "onchain_activity": user_data["onchain_activity"],
                    "reputation": user_data["reputation"],
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Passport updated for {wallet_address} - new score: {score_result['credit_score']}")
        else:
            # Create new passport
            import uuid
            passport = {
                "id": str(uuid.uuid4()),
                "user_id": wallet_address,
                "wallet_address": wallet_address,
                "passport_id": f"PASS-{uuid.uuid4().hex[:12].upper()}",
                "credit_score": score_result["credit_score"],
                "grade": score_result["grade"],
                "risk_level": score_result["risk_level"],
                "breakdown": score_result["breakdown"],
                "poh_score": user_data["poh_score"],
                "badge_count": user_data["badge_count"],
                "onchain_activity": user_data["onchain_activity"],
                "reputation": user_data["reputation"],
                "soulbound_token_id": None,
                "issued_at": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.passports.insert_one(passport)
            logger.info(f"Passport created for {wallet_address} with score {score_result['credit_score']}")
            
    except Exception as e:
        logger.error(f"Failed to update/create passport: {str(e)}")
