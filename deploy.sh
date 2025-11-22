#!/bin/bash

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "🚀 Deploying Aura Protocol to VPS..."

# Upload files to VPS
rsync -avz --exclude node_modules --exclude venv . $VPS_USER@$VPS_IP:/opt/aura/

# SSH to VPS and deploy
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /opt/aura
docker-compose down
docker-compose build
docker-compose up -d

# Setup SSL with Let's Encrypt
if ! command -v certbot &> /dev/null; then
    apt update && apt install -y certbot python3-certbot-nginx
fi

certbot --nginx -d aurapass.xyz -d www.aurapass.xyz --non-interactive --agree-tos -m admin@aurapass.xyz

echo "✅ Deployment complete!"
EOF