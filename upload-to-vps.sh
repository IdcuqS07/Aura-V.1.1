#!/bin/bash
# Quick upload backend files to VPS

VPS="root@159.65.134.137"
DEST="/root/aura-protocol/backend"

echo "📤 Uploading backend files to VPS..."

# Upload all Python files
scp backend/*.py $VPS:$DEST/

echo "✅ Upload complete!"
echo ""
echo "Next steps on VPS:"
echo "  cd /root/aura-protocol/backend"
echo "  source venv/bin/activate"
echo "  systemctl restart aura-backend"
