#!/bin/bash

echo "🔍 Aura Protocol - Production Check"
echo "===================================="
echo ""

# Check Frontend
echo "📱 Frontend Status:"
if curl -s http://localhost:3030 > /dev/null; then
    echo "   ✅ Running on port 3030"
    echo "   🌐 Access: http://159.65.134.137:3030"
else
    echo "   ❌ Not running"
fi
echo ""

# Check Backend
echo "🔧 Backend Status:"
if curl -s http://localhost:8080/api/ > /dev/null; then
    echo "   ✅ Running on port 8080"
    echo "   🌐 Access: http://159.65.134.137:8080"
    curl -s http://localhost:8080/api/ | python3 -m json.tool
else
    echo "   ❌ Not running"
fi
echo ""

# Check Docker
echo "🐳 Docker Status:"
if docker ps > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
    CONTAINERS=$(docker ps --format "{{.Names}}" | grep aura | wc -l)
    echo "   📦 Aura containers: $CONTAINERS"
    docker ps --filter "name=aura" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "   ⚠️  Docker not running or no containers"
fi
echo ""

# Check Ports
echo "🔌 Port Status:"
lsof -i :3030 -i :8080 -i :27017 -i :6379 | grep LISTEN | awk '{print "   " $1 " on port " $9}'
echo ""

# Check Processes
echo "⚙️  Running Processes:"
ps aux | grep -E "(node.*3030|python.*server|python.*monitor)" | grep -v grep | awk '{print "   " $11 " (PID: " $2 ")"}'
echo ""

echo "📋 Summary:"
echo "   Frontend: http://159.65.134.137:3030"
echo "   Backend:  http://159.65.134.137:8080"
echo ""
echo "💡 Next: Run 'docker-compose -f docker-compose.production.yml up -d' for full production"
