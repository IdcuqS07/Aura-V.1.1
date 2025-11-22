#!/bin/bash

# Aura Protocol - Production Update Script
# Usage: ./update-production.sh VPS_IP

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./update-production.sh VPS_IP"
    exit 1
fi

VPS_IP="$1"
VPS_USER="root"

echo "🔄 Updating Aura Protocol on Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create update package
echo "📦 Creating update package..."
TEMP_DIR=$(mktemp -d)
mkdir -p $TEMP_DIR/update

cp -r backend $TEMP_DIR/update/
cp -r frontend $TEMP_DIR/update/

cd $TEMP_DIR
tar czf update.tar.gz update/

# Upload
echo "📤 Uploading..."
scp update.tar.gz $VPS_USER@$VPS_IP:/root/

# Update on VPS
echo "🔄 Updating services..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /root/aura-protocol
tar xzf /root/update.tar.gz
cp -r update/backend/* backend/
cp -r update/frontend/* frontend/
rm -rf update /root/update.tar.gz

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

echo "✅ Update complete"
ENDSSH

rm -rf $TEMP_DIR

echo ""
echo "🎉 Production updated successfully!"
echo "Check status: ssh root@$VPS_IP 'docker ps'"
