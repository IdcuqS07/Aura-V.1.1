#!/bin/bash

echo "🚀 Deploying Monitoring to Production VPS..."

# VPS Details (sesuaikan dengan VPS Anda)
VPS_USER="root"
VPS_HOST="your-vps-ip"  # Ganti dengan IP VPS Anda
VPS_PATH="/root/aura-protocol"

echo "📦 Step 1: Upload monitoring files to VPS..."
scp backend/websocket_server.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/block_monitor.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/monitoring_routes.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/monitor_runner.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/requirements-monitoring.txt $VPS_USER@$VPS_HOST:$VPS_PATH/backend/

scp frontend/src/services/websocketService.js $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/services/
scp frontend/src/components/LiveDashboard.jsx $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/components/
scp frontend/src/App.js $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/

echo "⚙️ Step 2: Install dependencies and rebuild..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /root/aura-protocol

# Install backend dependencies
cd backend
pip install -r requirements-monitoring.txt

# Install frontend dependencies
cd ../frontend
npm install socket.io-client

# Rebuild frontend
npm run build

# Restart services
cd ..
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

echo "✅ Monitoring deployed successfully!"
EOF

echo "🎉 Done! Access monitoring at: https://www.aurapass.xyz/monitor"
