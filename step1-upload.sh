#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 1: Upload to VPS                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "📦 Package ready: aura-deploy.tar.gz (465KB)"
echo ""
echo "🔐 Uploading to VPS..."
echo "   Target: $VPS_USER@$VPS_IP:/root/"
echo ""

# Upload with password authentication
scp -o PreferredAuthentications=password aura-deploy.tar.gz $VPS_USER@$VPS_IP:/root/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload successful!"
    echo ""
    echo "📋 Next step:"
    echo "   ssh root@$VPS_IP"
    echo "   cd /root"
    echo "   tar -xzf aura-deploy.tar.gz"
else
    echo ""
    echo "❌ Upload failed"
    echo ""
    echo "💡 Try manually:"
    echo "   scp aura-deploy.tar.gz root@$VPS_IP:/root/"
fi
