#!/bin/bash

# Quick Deploy to VPS 159.65.134.137
VPS_IP="159.65.134.137"

echo "🚀 Quick Deploy Aura Protocol"
echo "Target: $VPS_IP"
echo ""

# Check SSH connection
echo "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 root@$VPS_IP "echo '✅ SSH OK'" 2>/dev/null; then
    echo "❌ Cannot connect to VPS"
    echo "Try: ssh root@$VPS_IP"
    exit 1
fi

echo ""
echo "📦 Creating package..."
tar czf deploy.tar.gz \
    backend/ \
    frontend/ \
    docker-compose.production.yml \
    --exclude='backend/node_modules' \
    --exclude='backend/__pycache__' \
    --exclude='backend/*.log' \
    --exclude='frontend/node_modules' \
    --exclude='frontend/build'

echo "📤 Uploading..."
scp deploy.tar.gz root@$VPS_IP:/root/

echo "🔧 Deploying..."
ssh root@$VPS_IP << 'ENDSSH'
# Install Docker if needed
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    apt install docker-compose -y
fi

# Extract
cd /root
rm -rf aura-protocol
mkdir -p aura-protocol
tar xzf deploy.tar.gz -C aura-protocol
cd aura-protocol

# Copy production env
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env

# Stop old containers
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Start services
docker-compose -f docker-compose.production.yml up -d --build

# Wait
sleep 5

# Check status
docker ps | grep aura

echo ""
echo "✅ Deployment complete!"
ENDSSH

rm deploy.tar.gz

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access Points:"
echo "  Frontend: http://$VPS_IP:3030"
echo "  Backend:  http://$VPS_IP:8080"
echo "  API Docs: http://$VPS_IP:8080/docs"
echo ""
echo "📊 Check Status:"
echo "  ssh root@$VPS_IP 'docker ps'"
echo ""
echo "📝 View Logs:"
echo "  ssh root@$VPS_IP 'docker logs aura-backend -f'"
echo ""
