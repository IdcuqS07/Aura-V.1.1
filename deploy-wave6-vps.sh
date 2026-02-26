#!/bin/bash
echo "🔧 Deploying Wave 6 to VPS..."

# Upload and extract
scp wave6-deployment.tar.gz root@aurapass.xyz:/tmp/
ssh root@aurapass.xyz << 'REMOTE'
cd /var/www/aura-protocol
tar -xzf /tmp/wave6-deployment.tar.gz

# Restart backend
systemctl restart aura-backend
systemctl restart nginx

# Check status
systemctl status aura-backend --no-pager
curl -s http://localhost:9000/api/multichain/chains | head -50

echo "✅ Wave 6 deployed to VPS"
REMOTE
