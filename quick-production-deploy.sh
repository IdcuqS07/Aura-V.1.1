#!/bin/bash
set -e

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "🚀 Aura Protocol - Quick Production Deploy"
echo "Target: $VPS_IP"
echo ""

# Create package
echo "📦 Creating package..."
tar czf aura-prod.tar.gz \
  backend/ \
  frontend/ \
  docker-compose.production.yml \
  nginx.production.conf \
  --exclude='backend/__pycache__' \
  --exclude='backend/*.log' \
  --exclude='backend/*.pid' \
  --exclude='frontend/node_modules' \
  --exclude='frontend/build'

# Upload
echo "📤 Uploading..."
scp aura-prod.tar.gz $VPS_USER@$VPS_IP:/root/

# Deploy
echo "🔧 Deploying..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root
tar xzf aura-prod.tar.gz
rm aura-prod.tar.gz

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    apt install docker-compose -y
fi

# Install Nginx if needed
if ! command -v nginx &> /dev/null; then
    apt update && apt install nginx certbot python3-certbot-nginx -y
fi

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start services
cd /root
docker-compose -f docker-compose.production.yml down || true
docker-compose -f docker-compose.production.yml up -d --build

# Configure Nginx
cp nginx.production.conf /etc/nginx/sites-available/aura
ln -sf /etc/nginx/sites-available/aura /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ Deployment complete!"
docker ps
ENDSSH

rm aura-prod.tar.gz

echo ""
echo "✅ Done! Services running at:"
echo "   Backend: http://$VPS_IP:8080"
echo "   Frontend: http://$VPS_IP:3030"
echo ""
echo "Next: Setup DNS then run SSL:"
echo "   ssh root@$VPS_IP"
echo "   certbot --nginx -d aurapass.xyz -d www.aurapass.xyz -d api.aurapass.xyz"
