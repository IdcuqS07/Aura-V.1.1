from fastapi import FastAPI, APIRouter, HTTPException, Security
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import random
import asyncio
from blockchain import polygon_integration
from proof_service import ProofService
from api_key_auth import verify_api_key, set_db

from poh_routes import router as poh_router
from passport_routes import router as passport_router
from websocket_server import ws_manager
from monitoring_routes import monitoring_bp

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    polygon_integration.load_contract_addresses()
    set_db(db)
    import poh_routes
    poh_routes.set_db(db)
    import monitoring_routes
    monitoring_routes.set_db(db)
    
    # Start monitoring
    from monitor_runner import run_monitor
    asyncio.create_task(run_monitor())
    
    # Start AI Oracle and Dynamic Oracle
    try:
        import ai_oracle_routes
        ai_oracle_routes.set_db(db)
        from oracle_service import get_oracle_service
        oracle = get_oracle_service(db)
        await oracle.start()
        logger.info("✅ AI Risk Oracle started")
    except Exception as e:
        logger.warning(f"⚠️ AI Oracle not started: {e}")
    
    yield
    # Shutdown
    try:
        from oracle_service import oracle_service
        if oracle_service:
            await oracle_service.stop()
    except:
        pass
    client.close()

# Create the main app without a prefix
app = FastAPI(title="Aura Protocol API", version="1.0.0", lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    username: str
    email: Optional[str] = None
    is_verified: bool = False
    verification_method: Optional[str] = None  # civic, worldcoin, lens
    credit_score: int = Field(default=0, ge=0, le=1000)
    reputation_score: float = Field(default=0.0, ge=0.0, le=100.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    wallet_address: str
    username: str
    email: Optional[str] = None

class ZKBadge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_type: str  # uniqueness, identity, reputation
    token_id: str
    metadata: Dict
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class CreditPassport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    passport_id: str
    credit_score: int
    reputation_score: float
    total_transactions: int = 0
    total_volume: float = 0.0
    risk_level: str  # low, medium, high
    zk_proof_hash: str
    soulbound_token_id: str
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tx_hash: str
    tx_type: str  # borrow, repay, lend
    amount: float
    protocol: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str  # completed, pending, failed

class AnalyticsData(BaseModel):
    total_users: int
    verified_users: int
    total_credit_passports: int
    average_credit_score: float
    total_transaction_volume: float
    risk_distribution: Dict[str, int]


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {
        "message": "Aura Protocol API",
        "version": "1.0.0",
        "description": "Polygon ZK-ID Credit Layer"
    }

# User routes
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    # Check if wallet already exists
    existing = await db.users.find_one({"wallet_address": user_data.wallet_address})
    if existing:
        raise HTTPException(status_code=400, detail="Wallet address already registered")
    
    user = User(**user_data.model_dump())
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_updated'] = doc['last_updated'].isoformat()
    
    await db.users.insert_one(doc)
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if isinstance(user['last_updated'], str):
        user['last_updated'] = datetime.fromisoformat(user['last_updated'])
    
    return user

@api_router.get("/users", response_model=List[User])
async def get_all_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user['last_updated'], str):
            user['last_updated'] = datetime.fromisoformat(user['last_updated'])
    
    return users

@api_router.post("/users/{user_id}/verify")
async def verify_user(user_id: str, method: str, wallet_address: Optional[str] = None):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate initial credit score based on verification
    initial_score = random.randint(650, 750)
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "is_verified": True,
                "verification_method": method,
                "credit_score": initial_score,
                "reputation_score": random.uniform(70, 85),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Create ZK Badge
    badge = ZKBadge(
        user_id=user_id,
        badge_type="identity",
        token_id=f"ZK-{uuid.uuid4().hex[:8].upper()}",
        metadata={
            "verification_method": method,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "issuer": "Aura Protocol"
        }
    )
    
    badge_doc = badge.model_dump()
    badge_doc['issued_at'] = badge_doc['issued_at'].isoformat()
    await db.badges.insert_one(badge_doc)
    
    # Issue on-chain ZK Badge if wallet address provided
    blockchain_tx = None
    if wallet_address and method in ["civic", "worldcoin"]:
        try:
            if method == "civic":
                success = await polygon_integration.verify_civic_proof(
                    wallet_address, 
                    badge.metadata["verified_at"]
                )
            elif method == "worldcoin":
                success = await polygon_integration.verify_worldcoin_proof(
                    wallet_address,
                    badge.token_id,
                    []
                )
            
            if success:
                blockchain_tx = "pending"
        except Exception as e:
            logger.error(f"Blockchain verification failed: {str(e)}")
    
    return {
        "message": "User verified successfully", 
        "credit_score": initial_score,
        "blockchain_tx": blockchain_tx
    }

# Badge Minting Model
class BadgeMintRequest(BaseModel):
    wallet_address: str
    badge_type: str
    zk_proof_hash: str
    message: str
    signature: str

# Backend Minting Endpoint
@api_router.post("/badges/mint")
async def mint_badge(badge_data: BadgeMintRequest):
    """Mint badge on-chain via backend (protocol-controlled)"""
    try:
        logger.info(f"Mint request for {badge_data.wallet_address}")
        
        # Verify signature (permissionless - no waitlist check)
        from eth_account.messages import encode_defunct
        from web3 import Web3
        
        w3 = Web3()
        message = encode_defunct(text=badge_data.message)
        recovered_address = w3.eth.account.recover_message(message, signature=badge_data.signature)
        
        logger.info(f"Recovered address: {recovered_address}")
        
        if recovered_address.lower() != badge_data.wallet_address.lower():
            logger.error(f"Signature mismatch: {recovered_address} != {badge_data.wallet_address}")
            return {"success": False, "message": "Invalid signature"}
        
        logger.info("Signature verified, minting...")
        
        # Mint using backend wallet (deployer)
        result = await polygon_integration.mint_badge(
            badge_data.wallet_address,
            badge_data.badge_type,
            badge_data.zk_proof_hash
        )
        
        logger.info(f"Mint result: {result}")
        
        if result:
            # Handle both old string format and new dict format
            if isinstance(result, dict):
                tx_hash = result['tx_hash']
                gas_used = result.get('gas_used')
                gas_fee = result.get('gas_fee')
            else:
                tx_hash = result
                gas_used = None
                gas_fee = None
            
            # Ensure 0x prefix
            if not tx_hash.startswith('0x'):
                tx_hash = '0x' + tx_hash
            
            # Save to database
            badge_doc = {
                "id": str(uuid.uuid4()),
                "wallet_address": badge_data.wallet_address,
                "badge_type": badge_data.badge_type,
                "zk_proof_hash": badge_data.zk_proof_hash,
                "token_id": f"ZK-{uuid.uuid4().hex[:8].upper()}",
                "tx_hash": tx_hash,
                "gas_used": gas_used,
                "gas_fee": gas_fee,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.badges.insert_one(badge_doc)
            
            return {
                "success": True,
                "tx_hash": tx_hash,
                "token_id": badge_doc["token_id"],
                "gas_used": gas_used,
                "gas_fee": gas_fee,
                "message": "Badge minted successfully"
            }
        else:
            return {"success": False, "message": "Minting failed"}
    except Exception as e:
        logger.error(f"Minting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Demo Badge Model
class DemoBadge(BaseModel):
    wallet_address: str
    badge_type: str
    zk_proof_hash: str
    is_demo: bool = True

# Demo Badge routes
@api_router.post("/badges/demo")
async def create_demo_badge(badge_data: DemoBadge):
    """Create demo badge without blockchain minting"""
    badge_doc = {
        "id": str(uuid.uuid4()),
        "wallet_address": badge_data.wallet_address,
        "badge_type": badge_data.badge_type,
        "zk_proof_hash": badge_data.zk_proof_hash,
        "is_demo": True,
        "token_id": f"DEMO-{uuid.uuid4().hex[:8].upper()}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.demo_badges.insert_one(badge_doc)
    
    return {
        "success": True,
        "badge_id": badge_doc["id"],
        "token_id": badge_doc["token_id"],
        "message": "Demo badge created successfully"
    }

@api_router.get("/badges/demo/{wallet_address}")
async def get_demo_badges(wallet_address: str):
    """Get demo badges for wallet address"""
    badges = await db.demo_badges.find(
        {"wallet_address": wallet_address}, 
        {"_id": 0}
    ).to_list(100)
    
    return {"wallet_address": wallet_address, "badges": badges}

# ZK Badge routes
@api_router.get("/badges/{user_id}", response_model=List[ZKBadge])
async def get_user_badges(user_id: str):
    badges = await db.badges.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    for badge in badges:
        if isinstance(badge['issued_at'], str):
            badge['issued_at'] = datetime.fromisoformat(badge['issued_at'])
    
    return badges

# Credit Passport routes
@api_router.post("/passports", response_model=CreditPassport)
async def create_credit_passport(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.get('is_verified'):
        raise HTTPException(status_code=400, detail="User must be verified first")
    
    # Check if passport already exists
    existing = await db.passports.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Passport already exists")
    
    # Calculate risk level
    credit_score = user.get('credit_score', 0)
    if credit_score >= 750:
        risk_level = "low"
    elif credit_score >= 600:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    passport = CreditPassport(
        user_id=user_id,
        passport_id=f"PASS-{uuid.uuid4().hex[:12].upper()}",
        credit_score=credit_score,
        reputation_score=user.get('reputation_score', 0.0),
        risk_level=risk_level,
        zk_proof_hash=f"0x{uuid.uuid4().hex}",
        soulbound_token_id=f"SBT-{uuid.uuid4().hex[:10].upper()}"
    )
    
    doc = passport.model_dump()
    doc['issued_at'] = doc['issued_at'].isoformat()
    doc['last_updated'] = doc['last_updated'].isoformat()
    
    await db.passports.insert_one(doc)
    return passport

@api_router.get("/passports/{user_id}", response_model=CreditPassport)
async def get_credit_passport(user_id: str):
    passport = await db.passports.find_one({"user_id": user_id}, {"_id": 0})
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    if isinstance(passport['issued_at'], str):
        passport['issued_at'] = datetime.fromisoformat(passport['issued_at'])
    if isinstance(passport['last_updated'], str):
        passport['last_updated'] = datetime.fromisoformat(passport['last_updated'])
    
    return passport

# Transaction routes
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(tx_data: dict):
    transaction = Transaction(**tx_data)
    doc = transaction.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.transactions.insert_one(doc)
    
    # Update user stats
    user = await db.users.find_one({"id": transaction.user_id})
    if user:
        new_score = min(1000, user.get('credit_score', 0) + random.randint(5, 15))
        await db.users.update_one(
            {"id": transaction.user_id},
            {"$set": {"credit_score": new_score}}
        )
    
    return transaction

@api_router.get("/transactions/{user_id}", response_model=List[Transaction])
async def get_user_transactions(user_id: str):
    transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    
    return transactions

# Analytics routes
@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics():
    # Count on-chain badges
    total_badges = await db.badges.count_documents({})
    demo_badges = await db.demo_badges.count_documents({})
    
    # Count unique users (from badges)
    unique_users_pipeline = [
        {"$group": {"_id": "$wallet_address"}},
        {"$count": "total"}
    ]
    unique_result = await db.demo_badges.aggregate(unique_users_pipeline).to_list(1)
    unique_users = unique_result[0]['total'] if unique_result else 0
    
    total_users = await db.users.count_documents({})
    if total_users == 0:
        total_users = unique_users + total_badges
    
    # Count verified users from badges (users who minted badges)
    verified_users_pipeline = [
        {"$group": {"_id": "$wallet_address"}},
        {"$count": "total"}
    ]
    verified_result = await db.badges.aggregate(verified_users_pipeline).to_list(1)
    verified_users = verified_result[0]['total'] if verified_result else 0
    
    if verified_users == 0:
        verified_users = await db.users.count_documents({"is_verified": True})
    
    total_passports = await db.passports.count_documents({})
    if total_passports == 0:
        total_passports = total_badges
    
    # Calculate average credit score
    pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$credit_score"}}}
    ]
    result = await db.users.aggregate(pipeline).to_list(1)
    avg_score = result[0]['avg_score'] if result else 742.5
    
    # Calculate total volume
    tx_pipeline = [
        {"$group": {"_id": None, "total_volume": {"$sum": "$amount"}}}
    ]
    tx_result = await db.transactions.aggregate(tx_pipeline).to_list(1)
    total_volume = tx_result[0]['total_volume'] if tx_result else (total_badges * 0.5)
    
    # Risk distribution
    risk_pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]
    risk_results = await db.passports.aggregate(risk_pipeline).to_list(10)
    risk_dist = {item['_id']: item['count'] for item in risk_results}
    
    if not risk_dist:
        risk_dist = {
            "low": int(total_passports * 0.6),
            "medium": int(total_passports * 0.3),
            "high": int(total_passports * 0.1)
        }
    
    return AnalyticsData(
        total_users=total_users,
        verified_users=verified_users,
        total_credit_passports=total_passports,
        average_credit_score=round(avg_score, 2),
        total_transaction_volume=round(total_volume, 2),
        risk_distribution=risk_dist
    )

# API Key Management
class APIKeyCreate(BaseModel):
    tier: str
    user_id: Optional[str] = None

@api_router.get("/admin/api-keys")
async def get_all_api_keys():
    """Get all API keys for monitoring"""
    keys = await db.api_keys.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return keys

@api_router.get("/admin/recent-badges")
async def get_recent_badges():
    """Get recent badges for monitoring"""
    badges = await db.badges.find({}, {"_id": 0}).sort("issued_at", -1).to_list(50)
    return badges

@api_router.post("/api-keys")
async def create_api_key(data: APIKeyCreate):
    """Create and store API key"""
    import secrets
    
    api_key = f"aura_{data.tier}_{secrets.token_urlsafe(8).lower()}"
    
    rate_limits = {
        "free": 100,
        "pro": 1000,
        "enterprise": 10000
    }
    
    key_doc = {
        "api_key": api_key,
        "tier": data.tier,
        "user_id": data.user_id,
        "rate_limit": rate_limits.get(data.tier, 100),
        "requests_used": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.api_keys.insert_one(key_doc)
    
    return {
        "api_key": api_key,
        "tier": data.tier,
        "rate_limit": rate_limits.get(data.tier, 100)
    }

@api_router.get("/api-keys/{api_key}")
async def get_api_key_info(api_key: str):
    """Get API key information"""
    key_info = await db.api_keys.find_one({"api_key": api_key}, {"_id": 0})
    if not key_info:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return key_info

# Proof-as-a-Service API
@api_router.get("/proof/verify/{user_id}")
async def verify_proof(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    passport = await db.passports.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "verified": user.get('is_verified', False),
        "credit_score": user.get('credit_score', 0),
        "reputation_score": user.get('reputation_score', 0),
        "risk_level": passport.get('risk_level') if passport else None,
        "zk_proof": passport.get('zk_proof_hash') if passport else None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Demo data seeding
@api_router.post("/seed-demo-data")
async def seed_demo_data():
    # Create demo users
    demo_users = [
        {"wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", "username": "alice_defi", "email": "alice@example.com"},
        {"wallet_address": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "username": "bob_trader", "email": "bob@example.com"},
        {"wallet_address": "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", "username": "charlie_lender", "email": "charlie@example.com"},
    ]
    
    created_users = []
    for user_data in demo_users:
        existing = await db.users.find_one({"wallet_address": user_data["wallet_address"]})
        if not existing:
            user = User(**user_data)
            doc = user.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['last_updated'] = doc['last_updated'].isoformat()
            await db.users.insert_one(doc)
            created_users.append(user.id)
    
    return {"message": "Demo data seeded", "users_created": len(created_users)}

# Blockchain integration endpoints
@api_router.post("/blockchain/civic-verify")
async def civic_verify(user_id: str, wallet_address: str, civic_proof: str):
    """Verify user with Civic and issue on-chain ZK Badge"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        success = await polygon_integration.verify_civic_proof(wallet_address, civic_proof)
        if success:
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"is_verified": True, "verification_method": "civic"}}
            )
            return {"success": True, "message": "Civic verification completed"}
        else:
            return {"success": False, "message": "Civic verification failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/blockchain/worldcoin-verify")
async def worldcoin_verify(
    user_id: str, 
    wallet_address: str, 
    nullifier_hash: str,
    proof: List[str]
):
    """Verify user with Worldcoin and issue on-chain ZK Badge"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        success = await polygon_integration.verify_worldcoin_proof(
            wallet_address, 
            nullifier_hash, 
            proof
        )
        if success:
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"is_verified": True, "verification_method": "worldcoin"}}
            )
            return {"success": True, "message": "Worldcoin verification completed"}
        else:
            return {"success": False, "message": "Worldcoin verification failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/blockchain/badges/{wallet_address}")
async def get_blockchain_badges(wallet_address: str):
    """Get user's on-chain ZK Badges"""
    try:
        badges = await polygon_integration.check_user_badges(wallet_address)
        return {"wallet_address": wallet_address, "badges": badges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Proof-as-a-Service API
@api_router.post("/proof/generate")
async def generate_proof(user_id: str, api_key_info = Security(verify_api_key)):
    """Generate ZK proof for user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    proof = ProofService.generate_proof({
        "wallet_address": user.get("wallet_address"),
        "credit_score": user.get("credit_score", 0),
        "reputation_score": user.get("reputation_score", 0.0)
    })
    
    return proof

@api_router.post("/proof/verify")
async def verify_proof_endpoint(proof_hash: str, user_id: str, api_key_info = Security(verify_api_key)):
    """Verify ZK proof"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_valid = ProofService.verify_proof(proof_hash, {
        "wallet_address": user.get("wallet_address"),
        "credit_score": user.get("credit_score", 0),
        "reputation_score": user.get("reputation_score", 0.0)
    })
    
    return {
        "proof_hash": proof_hash,
        "is_valid": is_valid,
        "verified_at": datetime.now(timezone.utc).isoformat()
    }




# Include the router in the main app
app.include_router(api_router)

# Include PoH router
app.include_router(poh_router, prefix="/api")

# Include Passport router
app.include_router(passport_router, prefix="/api")

# Include Public API router
from public_api_routes import router as public_api_router
app.include_router(public_api_router, prefix="/api")

# Include Graph router
from graph_routes import router as graph_router
app.include_router(graph_router)

# Include Oracle router
from oracle_routes import router as oracle_router
app.include_router(oracle_router, prefix="/api")

# Include Enhanced API router
try:
    from enhanced_routes import router as enhanced_router
    app.include_router(enhanced_router)
    logger.info("✅ Enhanced API routes loaded")
except ImportError as e:
    logger.warning(f"⚠️ Enhanced routes not available: {e}")

# Include Threshold Proof routes
try:
    from threshold_routes import router as threshold_router
    app.include_router(threshold_router, prefix="/api")
    logger.info("✅ Threshold proof routes loaded")
except ImportError as e:
    logger.warning(f"⚠️ Threshold routes not available: {e}")

# Include Monitoring routes
app.include_router(monitoring_bp)

# Include AI Oracle routes
try:
    from ai_oracle_routes import router as ai_oracle_router
    app.include_router(ai_oracle_router)
    logger.info("✅ AI Oracle routes loaded")
except ImportError as e:
    logger.warning(f"⚠️ AI Oracle routes not available: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


