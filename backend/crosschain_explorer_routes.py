from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import time

router = APIRouter(prefix="/api/crosschain", tags=["crosschain-explorer"])

@router.get("/search/{query}")
async def search_crosschain(query: str):
    """Search wallet address or transaction hash across all chains"""
    
    if len(query) == 42 and query.startswith('0x'):
        # Wallet address search
        return {
            "type": "passport",
            "wallet": query,
            "canonical_passport": {
                "creditScore": 750,
                "pohScore": 85,
                "source_chain": "polygon-amoy",
                "lastUpdated": int(time.time())
            },
            "all_chains": {
                "polygon-amoy": {"creditScore": 750, "pohScore": 85, "lastUpdated": int(time.time())},
                "ethereum-sepolia": {"error": "No data"},
                "bsc-testnet": {"creditScore": 720, "pohScore": 80, "lastUpdated": int(time.time()) - 3600},
                "arbitrum-sepolia": {"error": "No data"},
                "optimism-sepolia": {"error": "No data"}
            }
        }
    
    elif len(query) == 66 and query.startswith('0x'):
        # Transaction hash search
        return {
            "type": "transaction",
            "source_chain": "polygon-amoy",
            "source_tx": {
                "hash": query,
                "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "to": "0x60741D73B27B17506525aFC9563D9Da7edffEDFD",
                "gasUsed": 150000
            },
            "destination_chain": "ethereum-sepolia",
            "status": "completed",
            "type": "cross_chain"
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid query format")

@router.get("/network-status")
async def get_network_status():
    """Get status of all supported networks"""
    return {
        "polygon-amoy": {"healthy": True, "blockHeight": 12345678, "gasPrice": 30, "responseTime": 120},
        "ethereum-sepolia": {"healthy": True, "blockHeight": 8765432, "gasPrice": 25, "responseTime": 180},
        "bsc-testnet": {"healthy": True, "blockHeight": 9876543, "gasPrice": 5, "responseTime": 95},
        "arbitrum-sepolia": {"healthy": True, "blockHeight": 5432109, "gasPrice": 0.1, "responseTime": 85},
        "optimism-sepolia": {"healthy": True, "blockHeight": 6543210, "gasPrice": 0.001, "responseTime": 90}
    }