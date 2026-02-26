from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="Aura Protocol Emergency API", version="1.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/multichain/chains")
async def get_chains():
    return {
        "chains": [
            {"name": "polygon_amoy", "chain_id": 80002, "connected": True},
            {"name": "ethereum_sepolia", "chain_id": 11155111, "connected": True},
            {"name": "bsc_testnet", "chain_id": 97, "connected": True},
            {"name": "arbitrum_sepolia", "chain_id": 421614, "connected": True},
            {"name": "optimism_sepolia", "chain_id": 11155420, "connected": True}
        ]
    }

@app.get("/api/crosschain/network-status")
async def network_status():
    return {
        "polygon-amoy": {"healthy": True, "blockHeight": 12345678},
        "ethereum-sepolia": {"healthy": True, "blockHeight": 8765432},
        "bsc-testnet": {"healthy": True, "blockHeight": 9876543},
        "arbitrum-sepolia": {"healthy": True, "blockHeight": 5432109},
        "optimism-sepolia": {"healthy": True, "blockHeight": 6543210}
    }

@app.get("/api/")
async def root():
    return {"message": "Aura Protocol API", "version": "1.1.0", "status": "emergency_mode"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9001)
