from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta
import logging
from websocket_server import ws_manager

monitoring_bp = APIRouter()
logger = logging.getLogger(__name__)

db = None

def set_db(database):
    global db
    db = database

@monitoring_bp.get('/api/monitor/stats')
async def get_stats():
    """Get real-time statistics"""
    try:
        total_users = db.users.count_documents({})
        total_badges = db.badges.count_documents({})
        total_passports = db.passports.count_documents({})
        
        yesterday = datetime.now() - timedelta(days=1)
        recent_badges = db.badges.count_documents({'issued_at': {'$gte': yesterday}})
        recent_verifications = db.verifications.count_documents({'verified_at': {'$gte': yesterday}}) if 'verifications' in db.list_collection_names() else 0
        
        return {
            'total_users': total_users,
            'total_badges': total_badges,
            'total_passports': total_passports,
            'recent_badges_24h': recent_badges,
            'recent_verifications_24h': recent_verifications,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {'error': str(e)}

@monitoring_bp.get('/api/monitor/activity')
async def get_activity():
    """Get recent activity"""
    try:
        
        # Recent badges
        recent_badges = list(db.badges.find().sort('issued_at', -1).limit(10))
        
        # Recent verifications
        recent_verifications = list(db.verifications.find().sort('verified_at', -1).limit(10))
        
        for badge in recent_badges:
            badge['_id'] = str(badge['_id'])
        
        for verification in recent_verifications:
            verification['_id'] = str(verification['_id'])
        
        return {
            'recent_badges': recent_badges,
            'recent_verifications': recent_verifications
        }
    except Exception as e:
        logger.error(f"Error getting activity: {e}")
        return {'error': str(e)}

@monitoring_bp.get('/api/monitor/health')
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }

@monitoring_bp.websocket('/ws/monitor')
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time monitoring"""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
