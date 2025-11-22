#!/bin/bash
# Quick monitoring script

VPS_IP="159.65.134.137"
DOMAIN="aurapass.xyz"

echo "🔍 Aura Protocol - System Monitor"
echo "=================================="
echo ""

echo "📊 Docker Containers:"
ssh root@$VPS_IP 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'

echo ""
echo "💾 Disk Usage:"
ssh root@$VPS_IP 'df -h / | tail -1'

echo ""
echo "🧠 Memory Usage:"
ssh root@$VPS_IP 'free -h | grep Mem'

echo ""
echo "🌐 Service Status:"
echo -n "Backend API:  "
if curl -s -o /dev/null -w "%{http_code}" https://api.$DOMAIN/api/ | grep -q "200"; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo -n "Frontend:     "
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo ""
echo "📝 Recent Backend Logs (last 20 lines):"
ssh root@$VPS_IP 'docker logs aura-backend --tail 20'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Commands:"
echo "  View live logs:    ssh root@$VPS_IP 'docker logs aura-backend -f'"
echo "  Restart services:  ssh root@$VPS_IP 'cd /root && docker-compose -f docker-compose.production.yml restart'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
