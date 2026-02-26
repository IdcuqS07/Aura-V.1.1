#!/bin/bash

# Auto-fix nginx dan restart services
echo "🔧 Auto-fixing nginx configuration..."

# Backup existing config
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Create new nginx config
cat > /etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-API-Key" always;
    
    # Frontend server
    server {
        listen 80;
        server_name aurapass.xyz www.aurapass.xyz;
        
        location / {
            root /opt/aura/frontend/build;
            try_files $uri $uri/ /index.html;
            
            # Cache static files
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }
    
    # API server
    server {
        listen 80;
        server_name api.aurapass.xyz;
        
        location / {
            proxy_pass http://localhost:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

echo "✅ Nginx config created"

# Test nginx config
echo "🧪 Testing nginx config..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    
    # Kill duplicate backend processes
    echo "🔄 Cleaning up duplicate backend processes..."
    pkill -f "uvicorn.*9000" || true
    sleep 2
    
    # Start backend
    echo "🚀 Starting backend..."
    cd /opt/aura/backend
    nohup uvicorn server:app --host 0.0.0.0 --port 9000 > backend.log 2>&1 &
    
    # Wait for backend to start
    sleep 5
    
    # Restart nginx
    echo "🔄 Restarting nginx..."
    systemctl restart nginx
    
    # Test endpoints
    echo "🧪 Testing endpoints..."
    sleep 3
    
    echo "Testing backend directly:"
    curl -s http://localhost:9000/api/multichain/chains | head -c 100
    echo ""
    
    echo "Testing API through nginx:"
    curl -s http://api.aurapass.xyz/api/multichain/chains | head -c 100
    echo ""
    
    echo "Testing frontend:"
    curl -I http://www.aurapass.xyz/ 2>/dev/null | head -1
    
    echo "✅ Auto-fix completed!"
    echo "🌐 Frontend: http://www.aurapass.xyz/"
    echo "🔗 API: http://api.aurapass.xyz/api/multichain/chains"
    
else
    echo "❌ Nginx config has errors. Restoring backup..."
    cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf
fi