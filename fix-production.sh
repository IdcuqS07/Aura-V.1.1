#!/bin/bash

echo "🔧 Fixing Production Server Issues"
echo "================================="

# Commands to run on VPS to fix 403 error
cat << 'EOF'
# Run these commands on your VPS:

# 1. Fix nginx permissions
sudo chown -R www-data:www-data /var/www/aura-protocol/frontend/build
sudo chmod -R 755 /var/www/aura-protocol/frontend/build

# 2. Check nginx configuration
sudo nginx -t

# 3. Restart services
sudo systemctl restart nginx
sudo systemctl restart aura-backend

# 4. Check service status
sudo systemctl status nginx
sudo systemctl status aura-backend

# 5. Check nginx error logs if still having issues
sudo tail -f /var/log/nginx/error.log

# 6. Update nginx config if needed (add this to your nginx.conf):
# location / {
#     try_files $uri $uri/ /index.html;
#     add_header Cache-Control "no-cache, no-store, must-revalidate";
# }

EOF

echo ""
echo "💡 Quick fix commands:"
echo "ssh user@aurapass.xyz"
echo "sudo chown -R www-data:www-data /var/www/aura-protocol"
echo "sudo chmod -R 755 /var/www/aura-protocol"
echo "sudo systemctl restart nginx"