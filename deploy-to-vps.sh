#!/bin/bash

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 AURA PROTOCOL - VPS DEPLOYMENT                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check SSH access
echo "🔐 Checking VPS access..."
if ! ssh -o ConnectTimeout=5 $VPS_USER@$VPS_IP "echo 'Connected'" > /dev/null 2>&1; then
    echo "❌ Cannot connect to VPS. Check:"
    echo "   - SSH key is configured"
    echo "   - VPS is running"
    echo "   - IP address is correct"
    exit 1
fi
echo "✅ VPS accessible"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf aura-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='*.log' \
  --exclude='build' \
  --exclude='.git' \
  backend/ frontend/ docker-compose.production.yml nginx.production.conf \
  start-production.sh quick-production-check.sh

echo "✅ Package created: aura-deploy.tar.gz"
echo ""

# Upload to VPS
echo "📤 Uploading to VPS..."
scp aura-deploy.tar.gz $VPS_USER@$VPS_IP:/root/
echo "✅ Upload complete"
echo ""

# Deploy on VPS
echo "🚀 Deploying on VPS..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root

# Extract
echo "📂 Extracting files..."
tar -xzf aura-deploy.tar.gz

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    apt install docker-compose -y
fi

# Set environment
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.production.yml down 2>/dev/null

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps

# Test endpoints
echo ""
echo "🧪 Testing endpoints..."
curl -s http://localhost:8080/api/ | python3 -m json.tool 2>/dev/null || echo "Backend starting..."

ENDSSH

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$VPS_IP:3030"
echo "   Backend:  http://$VPS_IP:8080"
echo "   API Docs: http://$VPS_IP:8080/docs"
echo ""
echo "📝 Check status on VPS:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   cd /root && ./quick-production-check.sh"
