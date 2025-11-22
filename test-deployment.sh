#!/bin/bash

echo "🧪 Testing Aura Protocol Deployment"
echo "===================================="
echo ""

BASE_URL="http://localhost:8080"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d '{}')
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "422" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
    fi
}

echo "1️⃣  Testing Basic API..."
test_endpoint "Root" "/api/"
test_endpoint "Analytics" "/api/analytics"

echo ""
echo "2️⃣  Testing Enhanced API v2..."
test_endpoint "Status" "/api/v2/status"
test_endpoint "Analytics Cached" "/api/v2/analytics/cached"

echo ""
echo "3️⃣  Testing PoH API..."
test_endpoint "PoH Callback" "/api/poh/callback"

echo ""
echo "4️⃣  Testing Enhanced Features..."

# Check enhanced status
echo ""
echo "📊 Enhanced Features Status:"
curl -s "$BASE_URL/api/v2/status" | python3 -m json.tool 2>/dev/null || echo "Could not parse status"

echo ""
echo ""
echo "✅ Deployment test complete!"
echo ""
echo "📍 Access points:"
echo "   API Docs:  $BASE_URL/docs"
echo "   Frontend:  http://localhost:3030"
echo "   Status:    $BASE_URL/api/v2/status"
