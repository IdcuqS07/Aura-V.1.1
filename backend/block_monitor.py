from web3 import Web3
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class BlockMonitor:
    def __init__(self, rpc_url, ws_manager, contract_addresses):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.ws_manager = ws_manager
        self.contract_addresses = [addr.lower() for addr in contract_addresses]
        self.last_block = 0
        self.running = False
    
    async def start(self):
        self.running = True
        logger.info("Block monitor started")
        
        while self.running:
            try:
                current_block = self.w3.eth.block_number
                
                if current_block > self.last_block:
                    for block_num in range(self.last_block + 1, current_block + 1):
                        await self.process_block(block_num)
                    self.last_block = current_block
                
                await asyncio.sleep(2)
            except Exception as e:
                logger.error(f"Block monitor error: {e}")
                await asyncio.sleep(5)
    
    async def process_block(self, block_number):
        try:
            block = self.w3.eth.get_block(block_number, full_transactions=True)
            
            block_data = {
                'number': block.number,
                'hash': block.hash.hex(),
                'timestamp': block.timestamp,
                'transactions': len(block.transactions),
                'gasUsed': block.gasUsed
            }
            
            await self.ws_manager.broadcast_block(block_data)
            
            # Process transactions
            for tx in block.transactions:
                if tx['to'] and tx['to'].lower() in self.contract_addresses:
                    await self.process_transaction(tx)
            
        except Exception as e:
            logger.error(f"Error processing block {block_number}: {e}")
    
    async def process_transaction(self, tx):
        tx_data = {
            'hash': tx['hash'].hex(),
            'from': tx['from'],
            'to': tx['to'],
            'value': str(tx['value']),
            'gasUsed': tx.get('gas', 0),
            'timestamp': datetime.now().isoformat()
        }
        
        await self.ws_manager.broadcast_transaction(tx_data)
        
        # Check if it's a badge mint
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx['hash'])
            if receipt.status == 1:
                for log in receipt.logs:
                    if log.address.lower() in self.contract_addresses:
                        await self.ws_manager.broadcast_badge_minted({
                            'txHash': tx['hash'].hex(),
                            'address': log.address,
                            'blockNumber': receipt.blockNumber
                        })
        except Exception as e:
            logger.error(f"Error processing transaction: {e}")
    
    def stop(self):
        self.running = False
