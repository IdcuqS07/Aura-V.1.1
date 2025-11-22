# 📊 Monitoring - Quick Deploy

## Deploy to Production

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-monitoring.sh
```

## Manual Setup on VPS

```bash
ssh root@159.65.134.137

# Install dependencies
pip3 install flask-socketio python-socketio web3

# Restart backend
cd /root
docker-compose -f docker-compose.production.yml restart backend
```

## Test Monitoring

```bash
# Test stats endpoint
curl https://api.aurapass.xyz/api/monitor/stats

# Test health
curl https://api.aurapass.xyz/api/monitor/health
```

## Frontend Integration

Add to your React component:
```javascript
import websocketService from './services/websocketService';

useEffect(() => {
    websocketService.connect('https://api.aurapass.xyz');
    
    websocketService.on('badge', (badge) => {
        console.log('New badge:', badge);
    });
    
    return () => websocketService.disconnect();
}, []);
```

## View Live Dashboard

Navigate to: `https://aurapass.xyz/dashboard`

## Features

✅ Real-time badge minting
✅ Block monitoring
✅ Transaction tracking
✅ Live statistics
✅ WebSocket updates
