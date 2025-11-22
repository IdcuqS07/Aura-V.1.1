#!/bin/bash
# Run this script ON THE VPS after uploading

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 2: VPS Setup                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Extract files
echo "📂 Extracting files..."
cd /root
tar -xzf aura-deploy.tar.gz
echo "✅ Files extracted"
echo ""

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "📥 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    apt install docker-compose -y
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi
echo ""

# Show versions
docker --version
docker-compose --version
echo ""

# Setup environment
echo "🔧 Setting up environment..."
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure
echo "✅ Environment configured"
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d
echo ""

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10
echo ""

# Check status
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps
echo ""

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Backend:"
curl -s http://localhost:8080/api/ | python3 -m json.tool 2>/dev/null || echo "Starting..."
echo ""

echo "✅ Setup complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://159.65.134.137:3030"
echo "   Backend:  http://159.65.134.137:8080"
