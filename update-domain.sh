#!/bin/bash
# Update URLs setelah domain & SSL ready

VPS_IP="159.65.134.137"
DOMAIN="aurapass.xyz"

echo "🔄 Updating domain configuration..."

ssh root@$VPS_IP << ENDSSH
cd /root

# Update backend .env
sed -i 's|http://159.65.134.137:3030|https://$DOMAIN|g' backend/.env
sed -i 's|http://159.65.134.137:8080|https://api.$DOMAIN|g' backend/.env

# Update frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://api.$DOMAIN
REACT_APP_GITHUB_CLIENT_ID=Ov23liBkJpXGppFuyWWV
REACT_APP_TWITTER_CLIENT_ID=ZkNHUnEwSk5STWtKRWk2cW1fQWU6MTpjaQ
REACT_APP_REDIRECT_URI=https://$DOMAIN/poh/callback
PORT=3030
EOF

# Restart services
docker-compose -f docker-compose.production.yml restart

echo "✅ Domain updated! Services restarting..."
ENDSSH

echo "✅ Done! Check: https://$DOMAIN"
