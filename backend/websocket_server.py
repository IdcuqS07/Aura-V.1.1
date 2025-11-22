import logging
import json
from typing import Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, event_type: str, data: dict):
        message = json.dumps({"type": event_type, "data": data})
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.add(connection)
        self.active_connections -= disconnected
    
    async def broadcast_block(self, block_data):
        await self.broadcast('new_block', block_data)
    
    async def broadcast_transaction(self, tx_data):
        await self.broadcast('new_transaction', tx_data)
    
    async def broadcast_badge_minted(self, badge_data):
        await self.broadcast('badge_minted', badge_data)
    
    async def broadcast_stats_update(self, stats):
        await self.broadcast('stats_update', stats)

ws_manager = WebSocketManager()
