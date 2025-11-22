from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with fallback for Vercel
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'aura_protocol')]

# Create the main app without a prefix
app = FastAPI(title="Aura Protocol API", version="1.0.0")

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
async def verify_user(user_id: str, method: str):
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
    
    return {"message": "User verified successfully", "credit_score": initial_score}

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
    total_users = await db.users.count_documents({})
    verified_users = await db.users.count_documents({"is_verified": True})
    total_passports = await db.passports.count_documents({})
    
    # Calculate average credit score
    pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$credit_score"}}}
    ]
    result = await db.users.aggregate(pipeline).to_list(1)
    avg_score = result[0]['avg_score'] if result else 0
    
    # Calculate total volume
    tx_pipeline = [
        {"$group": {"_id": None, "total_volume": {"$sum": "$amount"}}}
    ]
    tx_result = await db.transactions.aggregate(tx_pipeline).to_list(1)
    total_volume = tx_result[0]['total_volume'] if tx_result else 0
    
    # Risk distribution
    risk_pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]
    risk_results = await db.passports.aggregate(risk_pipeline).to_list(10)
    risk_dist = {item['_id']: item['count'] for item in risk_results}
    
    return AnalyticsData(
        total_users=total_users,
        verified_users=verified_users,
        total_credit_passports=total_passports,
        average_credit_score=round(avg_score, 2),
        total_transaction_volume=round(total_volume, 2),
        risk_distribution=risk_dist
    )

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


# Include the router in the main app
app.include_router(api_router)

# Get CORS origins from environment
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Vercel serverless handler
handler = app
