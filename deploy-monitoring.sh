#!/bin/bash
set -e

VPS_IP="159.65.134.137"

echo "📊 Deploying Real-time Monitoring..."

# Create package
tar czf monitoring.tar.gz \
  backend/websocket_server.py \
  backend/block_monitor.py \
  backend/monitoring_routes.py \
  backend/monitor_runner.py \
  backend/requirements-monitoring.txt \
  frontend/src/services/websocketService.js \
  frontend/src/components/LiveDashboard.jsx

# Upload
scp monitoring.tar.gz root@$VPS_IP:/root/

# Deploy
ssh root@$VPS_IP << 'ENDSSH'
cd /root
tar xzf monitoring.tar.gz
rm monitoring.tar.gz

# Install dependencies
cd backend
pip3 install flask-socketio python-socketio web3

# Restart backend
cd /root
docker-compose -f docker-compose.production.yml restart backend

echo "✅ Monitoring deployed!"
ENDSSH

rm monitoring.tar.gz
echo "✅ Done!"
