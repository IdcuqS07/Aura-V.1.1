#!/bin/bash

echo "🚀 Deploying Wave 6 Updates to Production"
echo "========================================"

# Build frontend with Wave 6 updates
echo "📦 Building frontend..."
cd frontend
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
cd ..
tar -czf wave6-update.tar.gz \
  frontend/build \
  backend/multichain_routes.py \
  backend/server.py \
  WAVE6_DASHBOARD_README.md \
  WAVE6_IMPLEMENTATION_SUMMARY.md

echo "✅ Deployment package created: wave6-update.tar.gz"

# Upload to VPS (you'll need to run this manually with your VPS credentials)
echo ""
echo "📤 To deploy to VPS, run:"
echo "scp wave6-update.tar.gz user@aurapass.xyz:/tmp/"
echo "ssh user@aurapass.xyz"
echo "cd /var/www/aura-protocol"
echo "tar -xzf /tmp/wave6-update.tar.gz"
echo "sudo systemctl restart nginx"
echo "sudo systemctl restart aura-backend"

echo ""
echo "🔧 Or use this one-liner:"
echo "scp wave6-update.tar.gz user@aurapass.xyz:/tmp/ && ssh user@aurapass.xyz 'cd /var/www/aura-protocol && tar -xzf /tmp/wave6-update.tar.gz && sudo systemctl restart nginx && sudo systemctl restart aura-backend'"