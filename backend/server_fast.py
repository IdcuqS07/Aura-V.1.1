"""
Fast Server with Mock Data (No MongoDB Required)
Use this for quick testing without database
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path
import logging

# Import routes
from mock_routes import router as mock_router
from api_key_routes import router as api_key_router
from public_api_routes_v2 import router as public_api_router

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create app
app = FastAPI(
    title="Aura Protocol API",
    version="1.0.0",
    description="Proof-as-a-Service API with on-chain integration"
)

# CORS
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(mock_router)        # /api/analytics, /api/passport, etc.
app.include_router(api_key_router)     # /api/api-keys, /api/admin/api-keys
app.include_router(public_api_router)  # /api/v1/proof/*, /api/v1/passport/*

@app.on_event("startup")
async def startup():
    logger.info("🚀 Aura Protocol API - Started")
    logger.info("🔑 API Key Management: Enabled")
    logger.info("📡 Public API: /api/v1/*")
    logger.info("📊 Analytics: /api/analytics")
    logger.info("📖 Docs: http://localhost:8080/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
