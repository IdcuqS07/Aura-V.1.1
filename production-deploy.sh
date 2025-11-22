#!/bin/bash

# Aura Protocol - Production Deployment Script
# Usage: ./production-deploy.sh VPS_IP

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./production-deploy.sh VPS_IP"
    echo "Example: ./production-deploy.sh 159.65.134.137"
    exit 1
fi

VPS_IP="$1"
VPS_USER="root"
DEPLOY_DIR="/root/aura-protocol"

echo "🚀 Aura Protocol - Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Target: $VPS_USER@$VPS_IP"
echo ""

# Check if .env.production exists
if [ ! -f "backend/.env.production" ]; then
    echo "❌ backend/.env.production not found!"
    echo "Please create it from .env.example and fill in production values"
    exit 1
fi

echo "📦 Step 1/6: Creating deployment package..."
TEMP_DIR=$(mktemp -d)
mkdir -p $TEMP_DIR/aura-protocol

# Copy necessary files
cp -r backend $TEMP_DIR/aura-protocol/
cp -r frontend $TEMP_DIR/aura-protocol/
cp docker-compose.production.yml $TEMP_DIR/aura-protocol/
cp nginx.production.conf $TEMP_DIR/aura-protocol/

# Copy production env
cp backend/.env.production $TEMP_DIR/aura-protocol/backend/.env

# Create tarball
cd $TEMP_DIR
tar czf aura-production.tar.gz aura-protocol/
echo "✅ Package created"

echo ""
echo "📤 Step 2/6: Uploading to VPS..."
scp aura-production.tar.gz $VPS_USER@$VPS_IP:/root/
echo "✅ Upload complete"

echo ""
echo "🔧 Step 3/6: Installing dependencies on VPS..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
# Update system
apt update -qq

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt install docker-compose -y
fi

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt install nginx -y
fi

# Install Certbot if not exists
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt install certbot python3-certbot-nginx -y
fi

echo "✅ Dependencies installed"
ENDSSH

echo ""
echo "📂 Step 4/6: Extracting and setting up..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root
tar xzf aura-production.tar.gz
rm aura-production.tar.gz

# Create backups directory
mkdir -p aura-protocol/backups

echo "✅ Setup complete"
ENDSSH

echo ""
echo "🐳 Step 5/6: Starting Docker containers..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root/aura-protocol

# Stop existing containers
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Build and start
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services
echo "Waiting for services to start..."
sleep 10

# Check status
docker-compose -f docker-compose.production.yml ps

echo "✅ Docker containers started"
ENDSSH

echo ""
echo "🌐 Step 6/6: Configuring Nginx..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root/aura-protocol

# Copy nginx config
cp nginx.production.conf /etc/nginx/sites-available/aura

# Enable site
ln -sf /etc/nginx/sites-available/aura /etc/nginx/sites-enabled/

# Remove default
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Nginx configured"
ENDSSH

# Cleanup
rm -rf $TEMP_DIR

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Status:"
echo "  Backend API: http://$VPS_IP:8080"
echo "  Frontend:    http://$VPS_IP:3030"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Setup DNS records for your domain"
echo "  2. Run SSL setup: ssh root@$VPS_IP 'certbot --nginx -d yourdomain.com'"
echo "  3. Test endpoints: curl http://$VPS_IP:8080/api/"
echo ""
echo "📚 View logs:"
echo "  ssh root@$VPS_IP 'docker logs aura-backend -f'"
echo ""
