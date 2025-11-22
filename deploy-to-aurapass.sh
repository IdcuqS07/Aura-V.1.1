#!/bin/bash

echo "🚀 Deploying to aurapass.xyz"
echo "=============================="

# Check if we have SSH access
read -p "Enter your server SSH (user@ip): " SSH_HOST

if [ -z "$SSH_HOST" ]; then
    echo "❌ SSH host required"
    exit 1
fi

echo ""
echo "📦 Preparing deployment package..."

# Create deployment package
tar -czf deploy-package.tar.gz \
    backend/threshold_proof_service.py \
    backend/threshold_routes.py \
    backend/monitoring_routes.py \
    backend/websocket_server.py \
    backend/block_monitor.py \
    backend/monitor_runner.py \
    backend/server.py \
    frontend/src/components/EnhancedLiveDashboard.jsx \
    frontend/src/components/ThresholdProof.jsx \
    frontend/src/services/websocketService.js \
    frontend/src/App.js \
    frontend/package.json

echo "✅ Package created"

echo ""
echo "📤 Uploading to server..."
scp deploy-package.tar.gz $SSH_HOST:/tmp/

echo ""
echo "🔧 Deploying on server..."
ssh $SSH_HOST << 'ENDSSH'
cd /var/www/Aura-V.1.1/Aura-V.1.0\ 

# Backup current version
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz backend frontend

# Extract new files
tar -xzf /tmp/deploy-package.tar.gz

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart aura-backend

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart nginx
sudo systemctl restart nginx

echo "✅ Deployment complete!"
ENDSSH

# Cleanup
rm deploy-package.tar.gz

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "🌐 Test your deployment:"
echo "- Homepage: https://www.aurapass.xyz"
echo "- Enhanced Dashboard: https://www.aurapass.xyz/monitor/enhanced"
echo "- Threshold Proof: https://www.aurapass.xyz/threshold"
echo ""
echo "📊 Check status:"
echo "ssh $SSH_HOST 'pm2 status'"
