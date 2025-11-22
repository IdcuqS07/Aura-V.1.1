import asyncio
import os
from block_monitor import BlockMonitor
from websocket_server import ws_manager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_monitor():
    rpc_url = os.getenv('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology')
    contract_addresses = [
        os.getenv('BADGE_CONTRACT_ADDRESS'),
        os.getenv('PASSPORT_CONTRACT_ADDRESS')
    ]
    
    monitor = BlockMonitor(rpc_url, ws_manager, contract_addresses)
    
    logger.info("Starting block monitor...")
    await monitor.start()

if __name__ == '__main__':
    asyncio.run(run_monitor())
