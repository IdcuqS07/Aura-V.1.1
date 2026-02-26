#!/bin/bash

echo "🔧 Quick Production Fix for Aura Protocol"
echo "========================================="

# Check if backend is running locally
echo "1. Checking local backend..."
if curl -s http://localhost:9000/api/ > /dev/null; then
    echo "✅ Local backend is running"
else
    echo "❌ Local backend not running, starting..."
    cd backend
    source venv/bin/activate 2>/dev/null || echo "⚠️ Virtual env not found"
    nohup uvicorn server:app --reload --host 0.0.0.0 --port 9000 > server.log 2>&1 &
    echo "🚀 Backend started on port 9000"
    cd ..
fi

# Test multichain API endpoint
echo "2. Testing multichain API..."
sleep 2
if curl -s http://localhost:9000/api/multichain/chains > /dev/null; then
    echo "✅ Multichain API working"
else
    echo "❌ Multichain API not working"
fi

# Create simple nginx fix
echo "3. Creating nginx config fix..."
cat > nginx-fix.conf << 'EOF'
server {
    listen 80;
    server_name aurapass.xyz www.aurapass.xyz;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/aura-frontend;
        index index.html;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "4. Quick status check..."
echo "Frontend URL: https://aurapass.xyz/"
echo "API URL: https://api.aurapass.xyz/api/multichain/chains"
echo "Local Backend: http://localhost:9000/api/"

echo ""
echo "🎯 Quick fixes applied!"
echo "If still having issues, the VPS needs:"
echo "1. Backend restart: sudo systemctl restart aura-backend"
echo "2. Nginx restart: sudo systemctl restart nginx"
echo "3. Check logs: sudo journalctl -u aura-backend -f"