"""
Multi-Chain API Aggregator
Unified endpoint for cross-chain passport and transaction data
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from web3 import Web3
import asyncio
from datetime import datetime

router = APIRouter(prefix="/multichain", tags=["Multi-Chain"])

# Chain configurations
CHAINS = {
    "polygon_amoy": {
        "chain_id": 80002,
        "rpc": "https://rpc-amoy.polygon.technology",
        "explorer": "https://amoy.polygonscan.com",
        "lz_endpoint": "0x6EDCE65403992e310A62460808c4b910D972f10f"
    },
    "ethereum_sepolia": {
        "chain_id": 11155111,
        "rpc": "https://rpc.sepolia.org",
        "explorer": "https://sepolia.etherscan.io",
        "lz_endpoint": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1"
    },
    "bsc_testnet": {
        "chain_id": 97,
        "rpc": "https://data-seed-prebsc-1-s1.binance.org:8545",
        "explorer": "https://testnet.bscscan.com",
        "lz_endpoint": "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1"
    },
    "arbitrum_sepolia": {
        "chain_id": 421614,
        "rpc": "https://sepolia-rollup.arbitrum.io/rpc",
        "explorer": "https://sepolia.arbiscan.io",
        "lz_endpoint": "0x6098e96a28E02f27B1e6BD381f870F1C8Bd169d3"
    },
    "optimism_sepolia": {
        "chain_id": 11155420,
        "rpc": "https://sepolia.optimism.io",
        "explorer": "https://sepolia-optimism.etherscan.io",
        "lz_endpoint": "0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8"
    }
}

# Contract ABI (simplified)
PASSPORT_ABI = [
    {
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "getPassport",
        "outputs": [
            {"name": "owner", "type": "address"},
            {"name": "creditScore", "type": "uint256"},
            {"name": "lastUpdated", "type": "uint256"},
            {"name": "isActive", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]


class MultiChainAggregator:
    def __init__(self):
        self.web3_instances = {}
        self._initialize_connections()
    
    def _initialize_connections(self):
        """Initialize Web3 connections for all chains"""
        for chain_name, config in CHAINS.items():
            try:
                w3 = Web3(Web3.HTTPProvider(config["rpc"]))
                if w3.is_connected():
                    self.web3_instances[chain_name] = w3
            except Exception as e:
                print(f"Failed to connect to {chain_name}: {e}")
    
    async def get_passport_from_chain(
        self, 
        chain_name: str, 
        wallet_address: str,
        contract_address: str
    ) -> Optional[Dict]:
        """Fetch passport data from specific chain"""
        try:
            w3 = self.web3_instances.get(chain_name)
            if not w3:
                return None
            
            contract = w3.eth.contract(
                address=Web3.to_checksum_address(contract_address),
                abi=PASSPORT_ABI
            )
            
            passport = contract.functions.getPassport(
                Web3.to_checksum_address(wallet_address)
            ).call()
            
            return {
                "chain": chain_name,
                "chain_id": CHAINS[chain_name]["chain_id"],
                "owner": passport[0],
                "credit_score": passport[1],
                "last_updated": passport[2],
                "is_active": passport[3],
                "explorer": CHAINS[chain_name]["explorer"]
            }
        except Exception as e:
            print(f"Error fetching from {chain_name}: {e}")
            return None
    
    async def aggregate_passport_data(
        self, 
        wallet_address: str,
        contract_addresses: Dict[str, str]
    ) -> Dict:
        """Aggregate passport data from all chains"""
        tasks = []
        for chain_name, contract_addr in contract_addresses.items():
            if chain_name in self.web3_instances:
                tasks.append(
                    self.get_passport_from_chain(
                        chain_name, 
                        wallet_address, 
                        contract_addr
                    )
                )
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out None and exceptions
        valid_results = [r for r in results if r and not isinstance(r, Exception)]
        
        # Find most recent passport
        most_recent = None
        if valid_results:
            most_recent = max(valid_results, key=lambda x: x["last_updated"])
        
        return {
            "wallet_address": wallet_address,
            "chains": valid_results,
            "most_recent": most_recent,
            "total_chains": len(valid_results),
            "timestamp": datetime.utcnow().isoformat()
        }


# Initialize aggregator
aggregator = MultiChainAggregator()


@router.get("/chains")
async def get_supported_chains():
    """Get list of supported chains"""
    return {
        "chains": [
            {
                "name": name,
                "chain_id": config["chain_id"],
                "rpc": config["rpc"],
                "explorer": config["explorer"],
                "connected": name in aggregator.web3_instances
            }
            for name, config in CHAINS.items()
        ]
    }


@router.get("/passport/{wallet_address}")
async def get_multichain_passport(
    wallet_address: str,
    contract_addresses: Optional[str] = None
):
    """
    Get passport data aggregated from all chains
    
    Query params:
    - contract_addresses: JSON string of chain_name -> contract_address mapping
    """
    import json
    
    # Default contract addresses (update after deployment)
    default_contracts = {
        "polygon_amoy": "0x60741D73B27B17506525aFC9563D9Da7edffEDFD",
        "ethereum_sepolia": "0xFcf0eA6A3cd1C5A5c26bdD5F5A3Cd28659094844",
        "bsc_testnet": "0x84E0e7Ba2CAD4386016d19ebfB4a7F12fBB58248",
        "arbitrum_sepolia": "0xb697a2D5F57718c26D55cBC7bE4A5b380465bB0f",
        "optimism_sepolia": "0xb697a2D5F57718c26D55cBC7bE4A5b380465bB0f"
    }
    
    if contract_addresses:
        try:
            contracts = json.loads(contract_addresses)
        except:
            contracts = default_contracts
    else:
        contracts = default_contracts
    
    result = await aggregator.aggregate_passport_data(wallet_address, contracts)
    
    if not result["chains"]:
        raise HTTPException(404, "No passport found on any chain")
    
    return result


@router.get("/sync-status/{wallet_address}")
async def get_sync_status(wallet_address: str):
    """Check if passport is synced across all chains"""
    # This would check if credit scores match across chains
    # Implementation depends on contract deployment
    return {
        "wallet_address": wallet_address,
        "synced": False,
        "message": "Sync status check not yet implemented"
    }


@router.post("/estimate-sync-fee")
async def estimate_sync_fee(
    source_chain: str,
    destination_chains: List[str],
    wallet_address: str
):
    """Estimate LayerZero fees for cross-chain sync"""
    # This would call the contract's estimateFee function
    return {
        "source_chain": source_chain,
        "destination_chains": destination_chains,
        "estimated_fees": {
            chain: "0.001" for chain in destination_chains
        },
        "total_fee_eth": str(len(destination_chains) * 0.001)
    }
