# 📊 Real-time Monitoring - Quick Guide

## Overview
Minimal real-time monitoring system with WebSocket integration for block-by-block monitoring and live dashboard updates.

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────┐
│   Frontend  │ ←─────────────────→ │   Backend    │
│  Dashboard  │                     │  (FastAPI)   │
└─────────────┘                     └──────────────┘
                                           ↓
                                    ┌──────────────┐
                                    │Block Monitor │
                                    │  (Async)     │
                                    └──────────────┘
                                           ↓
                                    ┌──────────────┐
                                    │  Polygon RPC │
                                    └──────────────┘
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements-monitoring.txt
```

### 2. Start Backend
```bash
python server.py
```
The backend automatically starts the block monitor on startup.

### 3. Test Monitoring
```bash
# Test REST endpoints
./test-monitoring.sh

# Test WebSocket connection
python backend/test_websocket.py
```

### 4. Frontend Integration
```javascript
import websocketService from './services/websocketService';
import LiveDashboard from './components/LiveDashboard';

// In your component
websocketService.connect('http://localhost:8080');
```

## API Endpoints

### REST API
- `GET /api/monitor/health` - Health check
- `GET /api/monitor/stats` - Current statistics
- `GET /api/monitor/activity` - Recent activity

### WebSocket
- `ws://localhost:8080/ws/monitor` - Real-time events

## Events

### new_block
```json
{
  "type": "new_block",
  "data": {
    "number": 12345,
    "hash": "0x...",
    "timestamp": 1234567890,
    "transactions": 10,
    "gasUsed": 1000000
  }
}
```

### new_transaction
```json
{
  "type": "new_transaction",
  "data": {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000",
    "timestamp": "2024-01-01T00:00:00"
  }
}
```

### badge_minted
```json
{
  "type": "badge_minted",
  "data": {
    "txHash": "0x...",
    "address": "0x...",
    "blockNumber": 12345
  }
}
```

### stats_update
```json
{
  "type": "stats_update",
  "data": {
    "total_users": 100,
    "total_badges": 50,
    "total_passports": 30,
    "recent_badges_24h": 5
  }
}
```

## Frontend Usage

### Connect and Listen
```javascript
import websocketService from './services/websocketService';

// Connect
websocketService.connect('http://localhost:8080');

// Listen to events
websocketService.on('block', (block) => {
    console.log('New block:', block);
});

websocketService.on('badge', (badge) => {
    console.log('Badge minted:', badge);
});

// Cleanup
websocketService.disconnect();
```

### Use LiveDashboard Component
```jsx
import LiveDashboard from './components/LiveDashboard';

function App() {
    return <LiveDashboard />;
}
```

## Configuration

### Environment Variables
```bash
# Backend (.env)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
BADGE_CONTRACT_ADDRESS=0x...
PASSPORT_CONTRACT_ADDRESS=0x...
MONGO_URL=mongodb://localhost:27017
DB_NAME=aura_protocol
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8080
```

## Production Deployment

### Docker Compose
```yaml
services:
  backend:
    build: ./backend
    command: python server.py
    environment:
      - POLYGON_RPC_URL=${POLYGON_RPC_URL}
    ports:
      - "8080:8080"
```

### Nginx Configuration
```nginx
location /ws/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## Monitoring Metrics

- **Total Users** - Registered users count
- **Total Badges** - Minted badges count
- **Total Passports** - Issued passports count
- **24h Activity** - Recent badges/verifications
- **Block Height** - Current blockchain block
- **Transaction Count** - Transactions to contracts
- **Gas Usage** - Gas consumed per block

## Troubleshooting

### WebSocket Connection Failed
```bash
# Check backend is running
curl http://localhost:8080/api/monitor/health

# Check WebSocket endpoint
python backend/test_websocket.py
```

### No Events Received
- Verify RPC URL is correct
- Check contract addresses are set
- Ensure MongoDB is running
- Check backend logs for errors

### Frontend Not Connecting
- Verify REACT_APP_BACKEND_URL is set
- Check CORS settings in backend
- Open browser console for errors

## Performance

- **WebSocket**: Native WebSocket API (no socket.io overhead)
- **Block Polling**: 2-second interval
- **Event Broadcasting**: Async, non-blocking
- **Memory**: Keeps last 5 blocks, 10 transactions, 10 badges

## Security

- CORS configured for allowed origins
- WebSocket connections tracked
- Auto-reconnection with exponential backoff
- Graceful disconnection handling

## Next Steps

1. Add authentication to WebSocket
2. Implement event filtering/subscriptions
3. Add metrics aggregation
4. Create admin monitoring panel
5. Add alerting system
