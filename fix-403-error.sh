#!/bin/bash

# Quick fix for 403 Forbidden error
echo "🔧 Fixing 403 Forbidden error..."

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "📡 Checking current status..."
curl -I https://www.aurapass.xyz/ || echo "Frontend is down"
curl -I https://api.aurapass.xyz/api/multichain/chains || echo "API issue"

echo "🚀 Connecting to VPS to fix frontend..."

ssh ${VPS_USER}@${VPS_IP} << 'EOF'
    echo "📊 Checking running containers..."
    docker ps
    
    echo "📋 Checking nginx status..."
    systemctl status nginx
    
    echo "🔍 Checking frontend container logs..."
    docker logs aura-frontend --tail 20
    
    echo "🔧 Restarting frontend container..."
    docker restart aura-frontend
    
    echo "⚙️ Restarting nginx..."
    systemctl restart nginx
    
    echo "✅ Services restarted"
    
    # Check if frontend is responding
    sleep 5
    curl -I http://localhost:3030/ || echo "Frontend container not responding"
    
    echo "📊 Final status check..."
    docker ps | grep aura
EOF

echo "🧪 Testing endpoints after fix..."
sleep 10

echo "Testing API..."
curl -s https://api.aurapass.xyz/api/multichain/chains | jq '.chains | length' || echo "API test failed"

echo "Testing Frontend..."
curl -I https://www.aurapass.xyz/ || echo "Frontend still has issues"

echo "✅ Fix attempt completed!"
echo "If issues persist, the frontend container may need to be rebuilt."