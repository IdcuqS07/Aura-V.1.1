"""
Dynamic Real-time Oracle Service
Continuous monitoring and updates every 5 minutes
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List
from motor.motor_asyncio import AsyncIOMotorClient
import os

from ai_models import ai_oracle_v2
from github_service import fetch_github_data
from twitter_service import fetch_twitter_data
from onchain_service import fetch_wallet_data, fetch_defi_data

logger = logging.getLogger(__name__)


class DynamicOracleService:
    """Real-time oracle with continuous updates"""
    
    def __init__(self, db):
        self.db = db
        self.update_interval = 5 * 60  # 5 minutes
        self.running = False
    
    async def start(self):
        """Start continuous update loop"""
        self.running = True
        logger.info("🚀 Dynamic Oracle Service started")
        
        # Start background tasks
        asyncio.create_task(self._continuous_update_loop())
        asyncio.create_task(self._event_listener())
    
    async def stop(self):
        """Stop oracle service"""
        self.running = False
        logger.info("🛑 Dynamic Oracle Service stopped")
    
    async def _continuous_update_loop(self):
        """Update all active passports every 5 minutes"""
        while self.running:
            try:
                logger.info("🔄 Starting batch update cycle...")
                
                # Get all active passports
                passports = await self.db.passports.find({
                    'isActive': True
                }).to_list(1000)
                
                logger.info(f"📊 Updating {len(passports)} passports")
                
                # Update in parallel batches
                batch_size = 10
                for i in range(0, len(passports), batch_size):
                    batch = passports[i:i+batch_size]
                    await asyncio.gather(*[
                        self._update_passport(p) for p in batch
                    ])
                
                logger.info("✅ Batch update completed")
                
            except Exception as e:
                logger.error(f"❌ Batch update error: {e}")
            
            # Wait 5 minutes
            await asyncio.sleep(self.update_interval)
    
    async def _update_passport(self, passport: Dict):
        """Update single passport with fresh data"""
        try:
            wallet_address = passport.get('owner')
            
            # Collect fresh data from all sources
            data = await self._collect_all_data(wallet_address)
            
            # Compute new score using AI models
            assessment = ai_oracle_v2.assess_risk(data)
            
            # Update database
            await self.db.passports.update_one(
                {'passport_id': passport['passport_id']},
                {
                    '$set': {
                        'credit_score': assessment['risk_score'],
                        'risk_level': assessment['risk_category'],
                        'default_probability': assessment['default_probability'],
                        'fraud_detected': assessment['fraud_detected'],
                        'last_updated': datetime.utcnow(),
                        'data_sources': data
                    },
                    '$push': {
                        'score_history': {
                            '$each': [assessment['risk_score']],
                            '$slice': -30  # Keep last 30 scores
                        }
                    }
                }
            )
            
            # Check for significant change
            old_score = passport.get('credit_score', 0)
            new_score = assessment['risk_score']
            change = abs(new_score - old_score)
            
            if change > 50:  # 5% change
                logger.info(f"📈 Significant change for {wallet_address}: {old_score} → {new_score}")
                await self._emit_update_event(wallet_address, old_score, new_score)
            
        except Exception as e:
            logger.error(f"❌ Update failed for {passport.get('passport_id')}: {e}")
    
    async def _collect_all_data(self, wallet_address: str) -> Dict:
        """Collect data from all sources in parallel"""
        
        # Parallel data collection
        github_data, twitter_data, wallet_data, defi_data = await asyncio.gather(
            fetch_github_data(wallet_address),
            fetch_twitter_data(wallet_address),
            fetch_wallet_data(wallet_address),
            fetch_defi_data(wallet_address),
            return_exceptions=True
        )
        
        # Combine all data
        return {
            'wallet_address': wallet_address,
            'github_score': github_data.get('score', 0) if isinstance(github_data, dict) else 0,
            'twitter_score': twitter_data.get('score', 0) if isinstance(twitter_data, dict) else 0,
            'tx_count': wallet_data.get('tx_count', 0) if isinstance(wallet_data, dict) else 0,
            'tx_volume_usd': wallet_data.get('volume_usd', 0) if isinstance(wallet_data, dict) else 0,
            'account_age_days': wallet_data.get('age_days', 0) if isinstance(wallet_data, dict) else 0,
            'total_borrowed': defi_data.get('borrowed', 0) if isinstance(defi_data, dict) else 0,
            'total_supplied': defi_data.get('supplied', 0) if isinstance(defi_data, dict) else 0,
            'repayment_rate': defi_data.get('repayment_rate', 100) if isinstance(defi_data, dict) else 100,
            'liquidation_count': defi_data.get('liquidations', 0) if isinstance(defi_data, dict) else 0,
        }
    
    async def _event_listener(self):
        """Listen for blockchain events and trigger immediate updates"""
        # Placeholder for Web3 event listener
        # In production, this would subscribe to blockchain events
        logger.info("👂 Event listener started")
        
        while self.running:
            await asyncio.sleep(10)  # Check every 10 seconds
    
    async def _emit_update_event(self, wallet_address: str, old_score: float, new_score: float):
        """Emit update event for WebSocket broadcast"""
        try:
            # Store event in database
            await self.db.events.insert_one({
                'event_type': 'passport_updated',
                'wallet_address': wallet_address,
                'old_score': old_score,
                'new_score': new_score,
                'change': new_score - old_score,
                'timestamp': datetime.utcnow()
            })
            
            # Broadcast via WebSocket (if available)
            from websocket_server import ws_manager
            await ws_manager.broadcast({
                'type': 'passport_updated',
                'address': wallet_address,
                'score': new_score
            })
            
        except Exception as e:
            logger.error(f"❌ Event emission failed: {e}")
    
    async def force_refresh(self, wallet_address: str) -> Dict:
        """Force immediate refresh for a wallet (partner API)"""
        try:
            # Check rate limit
            last_refresh = await self.db.refresh_log.find_one({
                'wallet_address': wallet_address
            })
            
            if last_refresh:
                last_time = last_refresh.get('timestamp')
                if datetime.utcnow() - last_time < timedelta(minutes=6):
                    return {
                        'success': False,
                        'error': 'Rate limited. Wait 6 minutes between refreshes.'
                    }
            
            # Get passport
            passport = await self.db.passports.find_one({
                'owner': wallet_address
            })
            
            if not passport:
                return {'success': False, 'error': 'Passport not found'}
            
            # Update immediately
            await self._update_passport(passport)
            
            # Log refresh
            await self.db.refresh_log.insert_one({
                'wallet_address': wallet_address,
                'timestamp': datetime.utcnow()
            })
            
            # Get updated passport
            updated = await self.db.passports.find_one({
                'owner': wallet_address
            })
            
            return {
                'success': True,
                'credit_score': updated.get('credit_score'),
                'risk_level': updated.get('risk_level'),
                'last_updated': updated.get('last_updated')
            }
            
        except Exception as e:
            logger.error(f"❌ Force refresh failed: {e}")
            return {'success': False, 'error': str(e)}


# Global instance
oracle_service = None

def get_oracle_service(db):
    """Get or create oracle service instance"""
    global oracle_service
    if oracle_service is None:
        oracle_service = DynamicOracleService(db)
    return oracle_service
