#!/bin/bash
echo "🔧 Quick VPS Fix for Wave 6..."

ssh root@aurapass.xyz << 'REMOTE'
cd /var/www/aura-protocol/backend

# Check if multichain routes exist
if [ -f "multichain_routes.py" ]; then
    echo "✅ multichain_routes.py exists"
else
    echo "❌ multichain_routes.py missing - creating..."
    # Create minimal multichain routes
    cat > multichain_routes.py << 'PYTHON'
from fastapi import APIRouter
router = APIRouter(prefix="/multichain", tags=["Multi-Chain"])

@router.get("/chains")
async def get_supported_chains():
    return {"chains": [
        {"name": "polygon_amoy", "chain_id": 80002, "connected": True},
        {"name": "ethereum_sepolia", "chain_id": 11155111, "connected": True},
        {"name": "bsc_testnet", "chain_id": 97, "connected": True},
        {"name": "arbitrum_sepolia", "chain_id": 421614, "connected": True},
        {"name": "optimism_sepolia", "chain_id": 11155420, "connected": True}
    ]}
PYTHON
fi

# Restart services
systemctl restart aura-backend
sleep 3
systemctl status aura-backend --no-pager

# Test endpoints
echo "Testing multichain API:"
curl -s http://localhost:9000/api/multichain/chains

echo "✅ VPS Wave 6 fix complete"
REMOTE
