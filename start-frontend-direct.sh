#!/bin/bash

# Jalankan frontend tanpa Docker
echo "🚀 Starting frontend without Docker..."

ssh root@159.65.134.137 << 'EOF'
    echo "📍 Checking current directory..."
    pwd
    ls -la
    
    echo "🔍 Looking for frontend files..."
    find /root -name "package.json" -type f | head -5
    
    echo "📂 Going to frontend directory..."
    cd /root/frontend || cd /root/Aura*/frontend || cd frontend
    
    echo "📦 Installing dependencies..."
    npm install || yarn install
    
    echo "🔧 Setting environment..."
    export REACT_APP_BACKEND_URL=https://api.aurapass.xyz
    export PORT=3030
    
    echo "🚀 Starting frontend on port 3030..."
    # Kill existing process if any
    pkill -f "react-scripts\|npm start\|yarn start" || true
    
    # Start in background
    nohup npm start > frontend.log 2>&1 &
    
    echo "✅ Frontend started"
    sleep 5
    
    echo "📊 Checking if frontend is running..."
    curl -I http://localhost:3030/ || echo "Frontend not responding yet"
    
    echo "📋 Process status..."
    ps aux | grep -E "react-scripts|npm|node" | grep -v grep
EOF

echo "🧪 Testing frontend..."
sleep 10
curl -I https://www.aurapass.xyz/