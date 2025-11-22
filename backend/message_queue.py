"""
Message Queue Service using Redis + Celery
Handles async tasks: proof generation, badge minting, score calculation
"""

from celery import Celery
import redis
import json
from typing import Dict, Any
import os

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL)

# Celery app
celery_app = Celery(
    "aura_protocol",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Event types
class EventType:
    BADGE_MINTED = "badge.minted"
    PASSPORT_CREATED = "passport.created"
    PROOF_GENERATED = "proof.generated"
    SCORE_UPDATED = "score.updated"
    ENROLLMENT_COMPLETED = "enrollment.completed"

class MessageQueue:
    """Publish/Subscribe message queue"""
    
    @staticmethod
    def publish(event_type: str, data: Dict[str, Any]):
        """Publish event to queue"""
        message = {
            "event_type": event_type,
            "data": data,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat()
        }
        redis_client.publish(event_type, json.dumps(message))
        redis_client.lpush(f"events:{event_type}", json.dumps(message))
    
    @staticmethod
    def subscribe(event_type: str):
        """Subscribe to event type"""
        pubsub = redis_client.pubsub()
        pubsub.subscribe(event_type)
        return pubsub
    
    @staticmethod
    def get_recent_events(event_type: str, limit: int = 100):
        """Get recent events from queue"""
        events = redis_client.lrange(f"events:{event_type}", 0, limit - 1)
        return [json.loads(e) for e in events]

# Celery Tasks
@celery_app.task(name="tasks.generate_proof_async")
def generate_proof_async(enrollment_id: str, identity_secret: str):
    """Async proof generation"""
    from polygon_id_service import polygon_id_service
    from db_helper import get_db
    
    db = get_db()
    enrollment = db.enrollments.find_one({'id': enrollment_id})
    
    if not enrollment:
        return {"error": "Enrollment not found"}
    
    user_did = f"did:polygonid:polygon:amoy:{enrollment['wallet_address']}"
    credential = polygon_id_service.create_credential(
        user_did=user_did,
        attestations=enrollment['attestations'],
        score=enrollment['attestations']['score']
    )
    
    proof = polygon_id_service.generate_proof(
        credential=credential,
        identity_secret=identity_secret
    )
    
    MessageQueue.publish(EventType.PROOF_GENERATED, {
        "enrollment_id": enrollment_id,
        "proof_hash": proof['proof_hash']
    })
    
    return proof

@celery_app.task(name="tasks.mint_badge_async")
def mint_badge_async(wallet_address: str, badge_type: str, proof_hash: str):
    """Async badge minting"""
    from blockchain import polygon_integration
    
    result = polygon_integration.mint_badge(wallet_address, badge_type, proof_hash)
    
    MessageQueue.publish(EventType.BADGE_MINTED, {
        "wallet_address": wallet_address,
        "badge_type": badge_type,
        "tx_hash": result.get('tx_hash')
    })
    
    return result

@celery_app.task(name="tasks.calculate_score_async")
def calculate_score_async(user_id: str):
    """Async score calculation"""
    from credit_scoring import credit_scoring_service
    from db_helper import get_db
    
    db = get_db()
    user_data = credit_scoring_service.get_user_data_for_scoring(db, user_id)
    score_result = credit_scoring_service.calculate_credit_score(**user_data)
    
    MessageQueue.publish(EventType.SCORE_UPDATED, {
        "user_id": user_id,
        "credit_score": score_result['credit_score']
    })
    
    return score_result

@celery_app.task(name="tasks.update_passport_async")
def update_passport_async(wallet_address: str):
    """Async passport update"""
    from poh_routes import update_or_create_passport
    from db_helper import get_db
    
    db = get_db()
    update_or_create_passport(db, wallet_address)
    
    MessageQueue.publish(EventType.PASSPORT_CREATED, {
        "wallet_address": wallet_address
    })

message_queue = MessageQueue()
