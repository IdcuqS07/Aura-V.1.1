"""
Event Listener & ETL Pipeline
Listens to blockchain events and processes them through ETL pipeline
"""

from web3 import Web3
from typing import Dict, Callable
import asyncio
import logging
from message_queue import MessageQueue, EventType
from feature_store import feature_store
from reputation_engine import reputation_engine

logger = logging.getLogger(__name__)

class EventListener:
    """Listen to blockchain events and trigger ETL pipeline"""
    
    def __init__(self, rpc_url: str, contracts: Dict[str, Dict]):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contracts = contracts
        self.handlers = {}
    
    def register_handler(self, event_name: str, handler: Callable):
        """Register event handler"""
        self.handlers[event_name] = handler
    
    async def listen_to_events(self):
        """Listen to contract events"""
        logger.info("Starting event listener...")
        
        # Create event filters
        badge_filter = self.contracts['badge']['contract'].events.BadgeMinted.create_filter(fromBlock='latest')
        passport_filter = self.contracts['passport']['contract'].events.PassportIssued.create_filter(fromBlock='latest')
        
        while True:
            try:
                # Check for new badge events
                for event in badge_filter.get_new_entries():
                    await self._handle_badge_minted(event)
                
                # Check for new passport events
                for event in passport_filter.get_new_entries():
                    await self._handle_passport_issued(event)
                
                await asyncio.sleep(2)  # Poll every 2 seconds
                
            except Exception as e:
                logger.error(f"Event listener error: {e}")
                await asyncio.sleep(5)
    
    async def _handle_badge_minted(self, event):
        """Handle BadgeMinted event"""
        logger.info(f"Badge minted: {event}")
        
        data = {
            'wallet_address': event['args']['recipient'],
            'token_id': event['args']['tokenId'],
            'badge_type': event['args']['badgeType'],
            'tx_hash': event['transactionHash'].hex(),
            'block_number': event['blockNumber']
        }
        
        # Publish to message queue
        MessageQueue.publish(EventType.BADGE_MINTED, data)
        
        # Trigger ETL pipeline
        await self._run_etl_pipeline(data['wallet_address'])
    
    async def _handle_passport_issued(self, event):
        """Handle PassportIssued event"""
        logger.info(f"Passport issued: {event}")
        
        data = {
            'wallet_address': event['args']['owner'],
            'token_id': event['args']['tokenId'],
            'credit_score': event['args']['creditScore'],
            'tx_hash': event['transactionHash'].hex(),
            'block_number': event['blockNumber']
        }
        
        # Publish to message queue
        MessageQueue.publish(EventType.PASSPORT_CREATED, data)
        
        # Trigger ETL pipeline
        await self._run_etl_pipeline(data['wallet_address'])
    
    async def _run_etl_pipeline(self, wallet_address: str):
        """Run ETL pipeline for user"""
        try:
            # Extract: Get data from multiple sources
            from db_helper import get_db
            db = get_db()
            
            enrollment = db.enrollments.find_one({'wallet_address': wallet_address})
            badges = list(db.badges.find({'wallet_address': wallet_address}))
            passport = db.passports.find_one({'wallet_address': wallet_address})
            
            # Transform: Compute features
            raw_data = {
                'poh_score': enrollment.get('attestations', {}).get('score', 0) if enrollment else 0,
                'badge_count': len(badges),
                'github_data': enrollment.get('raw_data', {}).get('github') if enrollment else {},
                'twitter_data': enrollment.get('raw_data', {}).get('twitter') if enrollment else {},
                'onchain_data': enrollment.get('raw_data', {}).get('onchain') if enrollment else {}
            }
            
            # Load: Store features in feature store
            features = feature_store.compute_and_store_features(wallet_address, raw_data)
            
            # Calculate reputation
            reputation = reputation_engine.calculate_reputation(wallet_address, db)
            
            # Store reputation score
            feature_store.set_feature(wallet_address, 'reputation_score', reputation['reputation_score'])
            
            logger.info(f"ETL pipeline completed for {wallet_address}")
            
        except Exception as e:
            logger.error(f"ETL pipeline error: {e}")

class ETLPipeline:
    """ETL Pipeline for batch processing"""
    
    @staticmethod
    async def extract_user_data(wallet_address: str, db) -> Dict:
        """Extract data from all sources"""
        return {
            'enrollment': db.enrollments.find_one({'wallet_address': wallet_address}),
            'badges': list(db.badges.find({'wallet_address': wallet_address})),
            'passport': db.passports.find_one({'wallet_address': wallet_address}),
            'proofs': list(db.proofs.find({'wallet_address': wallet_address}))
        }
    
    @staticmethod
    def transform_features(raw_data: Dict) -> Dict:
        """Transform raw data into features"""
        enrollment = raw_data.get('enrollment', {})
        badges = raw_data.get('badges', [])
        
        return {
            'poh_score': enrollment.get('attestations', {}).get('score', 0),
            'badge_count': len(badges),
            'github_score': enrollment.get('raw_data', {}).get('github', {}).get('score', 0),
            'twitter_score': enrollment.get('raw_data', {}).get('twitter', {}).get('score', 0),
            'onchain_score': enrollment.get('raw_data', {}).get('onchain', {}).get('score', 0)
        }
    
    @staticmethod
    def load_features(wallet_address: str, features: Dict):
        """Load features into feature store"""
        feature_store.set_user_features(wallet_address, features)
    
    @staticmethod
    async def run_batch_etl(db, batch_size: int = 100):
        """Run ETL for all users in batches"""
        logger.info("Starting batch ETL...")
        
        cursor = db.enrollments.find().limit(batch_size)
        processed = 0
        
        for enrollment in cursor:
            wallet_address = enrollment['wallet_address']
            
            # Extract
            raw_data = await ETLPipeline.extract_user_data(wallet_address, db)
            
            # Transform
            features = ETLPipeline.transform_features(raw_data)
            
            # Load
            ETLPipeline.load_features(wallet_address, features)
            
            processed += 1
            
            if processed % 10 == 0:
                logger.info(f"Processed {processed} users")
        
        logger.info(f"Batch ETL completed: {processed} users")

etl_pipeline = ETLPipeline()
