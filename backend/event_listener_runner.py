"""
Event Listener Runner
Starts the blockchain event listener service
"""

import asyncio
import logging
from web3 import Web3
import os
import sys

from event_listener import EventListener
from db_helper import get_db

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Contract ABIs (minimal)
BADGE_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "recipient", "type": "address"},
            {"indexed": True, "name": "tokenId", "type": "uint256"},
            {"indexed": False, "name": "badgeType", "type": "string"},
            {"indexed": False, "name": "zkProofHash", "type": "bytes32"}
        ],
        "name": "BadgeMinted",
        "type": "event"
    }
]

PASSPORT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "tokenId", "type": "uint256"},
            {"indexed": True, "name": "owner", "type": "address"},
            {"indexed": False, "name": "creditScore", "type": "uint256"}
        ],
        "name": "PassportIssued",
        "type": "event"
    }
]

async def main():
    """Main event listener loop"""
    
    logger.info("Starting Aura Protocol Event Listener...")
    
    # Setup
    rpc_url = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology")
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        logger.error("Failed to connect to blockchain")
        sys.exit(1)
    
    logger.info(f"Connected to blockchain: {w3.eth.chain_id}")
    
    # Contract addresses
    badge_address = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678"
    passport_address = "0x1112373c9954B9bbFd91eb21175699b609A1b551"
    
    # Create contract instances
    badge_contract = w3.eth.contract(
        address=Web3.to_checksum_address(badge_address),
        abi=BADGE_ABI
    )
    
    passport_contract = w3.eth.contract(
        address=Web3.to_checksum_address(passport_address),
        abi=PASSPORT_ABI
    )
    
    contracts = {
        'badge': {'contract': badge_contract, 'address': badge_address},
        'passport': {'contract': passport_contract, 'address': passport_address}
    }
    
    # Create event listener
    listener = EventListener(rpc_url, contracts)
    
    # Start listening
    logger.info("Event listener started. Listening for blockchain events...")
    
    try:
        await listener.listen_to_events()
    except KeyboardInterrupt:
        logger.info("Event listener stopped by user")
    except Exception as e:
        logger.error(f"Event listener error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
