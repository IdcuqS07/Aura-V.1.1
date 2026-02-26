#!/bin/bash

# Quick rebuild frontend container
echo "🔧 Rebuilding frontend container..."

ssh root@159.65.134.137 << 'EOF'
    cd /root
    
    echo "📊 Current containers:"
    docker ps -a
    
    echo "🏗️ Building frontend container..."
    docker build -t aura-frontend -f Dockerfile.frontend .
    
    echo "🚀 Starting frontend container..."
    docker run -d \
        --name aura-frontend \
        --restart unless-stopped \
        -p 3030:3000 \
        -e REACT_APP_BACKEND_URL=https://api.aurapass.xyz \
        aura-frontend
    
    echo "⚙️ Restarting nginx..."
    systemctl restart nginx
    
    echo "✅ Frontend rebuilt and started"
    docker ps | grep aura
EOF

echo "🧪 Testing frontend..."
sleep 10
curl -I https://www.aurapass.xyz/