# 📊 Real-time Monitoring Setup

## Components

### Backend
- **websocket_server.py** - WebSocket manager
- **block_monitor.py** - Block-by-block monitoring
- **monitoring_routes.py** - REST API endpoints
- **monitor_runner.py** - Monitor runner script

### Frontend
- **websocketService.js** - WebSocket client
- **LiveDashboard.jsx** - Real-time dashboard

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements-monitoring.txt
```

### 2. Start Backend with WebSocket
```bash
python server.py
```

### 3. Start Block Monitor (separate process)
```bash
python monitor_runner.py
```

### 4. Frontend Setup
No additional dependencies needed - uses native WebSocket API

## Features

### Real-time Events
- **new_block** - New block detected
- **new_transaction** - Transaction to contracts
- **badge_minted** - Badge minted event
- **stats_update** - Statistics update

### API Endpoints
- `GET /api/monitor/stats` - Current statistics
- `GET /api/monitor/activity` - Recent activity
- `GET /api/monitor/health` - Health check

## Usage

### Connect WebSocket
```javascript
import websocketService from './services/websocketService';

websocketService.connect('http://localhost:8080'); // Auto-converts to ws://

websocketService.on('block', (block) => {
    console.log('New block:', block);
});
```

### Display Dashboard
```javascript
import LiveDashboard from './components/LiveDashboard';

<LiveDashboard />
```

## Production

### Docker Compose
Add to `docker-compose.production.yml`:
```yaml
monitor:
  build: ./backend
  command: python monitor_runner.py
  env_file: ./backend/.env
  depends_on:
    - redis
    - mongodb
  restart: unless-stopped
```

### Nginx WebSocket Support
Add to `nginx.production.conf`:
```nginx
location /ws/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Testing

```bash
# Test WebSocket connection
curl http://localhost:8080/api/monitor/health

# Test stats endpoint
curl http://localhost:8080/api/monitor/stats
```

## Monitoring Metrics

- Total users
- Total badges minted
- Total passports issued
- Recent activity (24h)
- Block height
- Transaction count
- Gas usage
