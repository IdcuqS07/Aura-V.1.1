#!/bin/bash
# Complete deployment script with SSL setup

set -e

VPS_IP="159.65.134.137"
DOMAIN="aurapass.xyz"
EMAIL="your@email.com"  # Change this!

echo "🚀 Aura Protocol - Complete Production Deployment"
echo "=================================================="
echo "VPS: $VPS_IP"
echo "Domain: $DOMAIN"
echo ""

# Check SSH access
echo "🔐 Testing SSH access..."
if ! ssh -o ConnectTimeout=5 root@$VPS_IP "echo 'SSH OK'" &>/dev/null; then
    echo "❌ Cannot connect to VPS. Check SSH access."
    exit 1
fi
echo "✅ SSH access OK"

# Create package
echo ""
echo "📦 Creating deployment package..."
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
echo "✅ Package created"

# Upload
echo ""
echo "📤 Uploading to VPS..."
scp -q aura-prod.tar.gz root@$VPS_IP:/root/
echo "✅ Upload complete"

# Deploy
echo ""
echo "🔧 Deploying on VPS..."
ssh root@$VPS_IP << 'ENDSSH'
set -e

# Extract
cd /root
tar xzf aura-prod.tar.gz
rm aura-prod.tar.gz

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    apt install -y docker-compose
fi

# Install Nginx & Certbot
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx & Certbot..."
    apt update -qq
    apt install -y nginx certbot python3-certbot-nginx
fi

# Firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start Docker services
echo "Starting Docker services..."
cd /root
docker-compose -f docker-compose.production.yml down 2>/dev/null || true
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services
echo "Waiting for services..."
sleep 15

# Configure Nginx
echo "Configuring Nginx..."
cp nginx.production.conf /etc/nginx/sites-available/aura
ln -sf /etc/nginx/sites-available/aura /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "✅ Services deployed"
ENDSSH

# Cleanup
rm aura-prod.tar.gz

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Current status:"
echo "   Backend:  http://$VPS_IP:8080/api/"
echo "   Frontend: http://$VPS_IP:3030"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Setup DNS records:"
echo "   A    @      $VPS_IP"
echo "   A    www    $VPS_IP"
echo "   A    api    $VPS_IP"
echo ""
echo "2. Wait for DNS propagation (check: ping $DOMAIN)"
echo ""
echo "3. Run SSL setup:"
echo "   ssh root@$VPS_IP"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --email $EMAIL --agree-tos"
echo ""
echo "4. Update URLs:"
echo "   ./update-domain.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
