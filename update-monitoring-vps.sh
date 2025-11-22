#!/bin/bash

echo "🚀 Update Monitoring ke aurapass.xyz"
echo ""
echo "Langkah yang akan dilakukan:"
echo "1. Upload file monitoring ke VPS"
echo "2. Install dependencies"
echo "3. Rebuild & restart services"
echo ""
read -p "VPS IP atau domain (contoh: 159.65.134.137): " VPS_HOST
read -p "VPS User (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}
read -p "Path project di VPS (default: /root/aura-protocol): " VPS_PATH
VPS_PATH=${VPS_PATH:-/root/aura-protocol}

echo ""
echo "📦 Uploading files..."

# Backend files
scp backend/websocket_server.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/block_monitor.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/monitoring_routes.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/monitor_runner.py $VPS_USER@$VPS_HOST:$VPS_PATH/backend/
scp backend/requirements-monitoring.txt $VPS_USER@$VPS_HOST:$VPS_PATH/backend/

# Frontend files
scp frontend/src/services/websocketService.js $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/services/
scp frontend/src/components/LiveDashboard.jsx $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/components/
scp frontend/src/App.js $VPS_USER@$VPS_HOST:$VPS_PATH/frontend/src/

# Docker compose
scp docker-compose.production.yml $VPS_USER@$VPS_HOST:$VPS_PATH/

echo ""
echo "⚙️ Installing dependencies & rebuilding..."

ssh $VPS_USER@$VPS_HOST << EOF
cd $VPS_PATH

# Install backend deps
cd backend
pip3 install -r requirements-monitoring.txt

# Install frontend deps
cd ../frontend
npm install socket.io-client

# Rebuild frontend
npm run build

# Restart all services
cd ..
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

echo ""
echo "✅ Monitoring berhasil di-deploy!"
echo ""
echo "Akses di: https://www.aurapass.xyz/monitor"
echo ""
EOF

echo ""
echo "🎉 Selesai!"
echo ""
echo "Test endpoints:"
echo "  curl https://www.aurapass.xyz/api/monitor/health"
echo "  curl https://www.aurapass.xyz/api/monitor/stats"
echo ""
echo "Buka browser: https://www.aurapass.xyz/monitor"
