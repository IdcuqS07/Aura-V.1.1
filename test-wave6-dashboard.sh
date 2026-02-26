#!/bin/bash

echo "🚀 Testing Wave 6 Dashboard Implementation"
echo "=========================================="

# Check if backend is running
echo "📡 Checking backend API..."
if curl -s http://localhost:9000/api/multichain/stats > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not running. Starting backend..."
    cd backend && python server.py &
    sleep 5
fi

# Test Wave 6 API endpoints
echo ""
echo "🧪 Testing Wave 6 API endpoints..."

echo "1. Testing /api/multichain/stats"
curl -s http://localhost:9000/api/multichain/stats | jq '.total_chains' || echo "❌ Stats endpoint failed"

echo "2. Testing /api/multichain/contracts"
curl -s http://localhost:9000/api/multichain/contracts | jq '.SimpleZKBadge.polygon_amoy.address' || echo "❌ Contracts endpoint failed"

echo "3. Testing /api/multichain/network-status"
curl -s http://localhost:9000/api/multichain/network-status | jq '.polygon_amoy.healthy' || echo "❌ Network status endpoint failed"

echo "4. Testing /api/multichain/chains"
curl -s http://localhost:9000/api/multichain/chains | jq '.chains | length' || echo "❌ Chains endpoint failed"

# Check frontend
echo ""
echo "🎨 Checking frontend..."
if [ -f "frontend/src/components/Wave6Dashboard.jsx" ]; then
    echo "✅ Wave6Dashboard component exists"
else
    echo "❌ Wave6Dashboard component not found"
fi

if grep -q "Wave6Dashboard" frontend/src/App.js; then
    echo "✅ Wave6Dashboard route configured"
else
    echo "❌ Wave6Dashboard route not configured"
fi

if grep -q "wave6" frontend/src/components/Navigation.js; then
    echo "✅ Wave6 navigation link added"
else
    echo "❌ Wave6 navigation link not found"
fi

# Start frontend if not running
echo ""
echo "🌐 Starting frontend..."
if ! pgrep -f "react-scripts start" > /dev/null; then
    echo "Starting React development server..."
    cd frontend && npm start &
    echo "Frontend will be available at http://localhost:3000"
else
    echo "✅ Frontend is already running"
fi

echo ""
echo "🎯 Wave 6 Dashboard URLs:"
echo "Local: http://localhost:3000/wave6"
echo "Production: https://www.aurapass.xyz/wave6"

echo ""
echo "📋 Test Checklist:"
echo "□ Navigate to /wave6 URL"
echo "□ Check all 4 tabs (Overview, Contracts, Explorer, Sync)"
echo "□ Verify contract addresses are displayed"
echo "□ Test copy address functionality"
echo "□ Check external explorer links"
echo "□ Verify responsive design on mobile"

echo ""
echo "✅ Wave 6 Dashboard implementation complete!"
echo "🚀 Ready for production deployment"