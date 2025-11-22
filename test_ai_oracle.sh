#!/bin/bash

# Test AI Oracle - Quick Test Script

echo "🧪 Testing Aura AI Oracle..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
curl -s $BASE_URL/api/ai-oracle/health | jq
echo ""

# Test 2: Create API Key
echo -e "${YELLOW}Test 2: Creating API Key${NC}"
API_KEY_RESPONSE=$(curl -s -X POST $BASE_URL/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"tier": "free", "user_id": "test-user-123"}')

API_KEY=$(echo $API_KEY_RESPONSE | jq -r '.api_key')
echo "API Key: $API_KEY"
echo ""

# Test 3: Create Test User
echo -e "${YELLOW}Test 3: Creating Test User${NC}"
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "username": "test_user"
  }' | jq
echo ""

# Test 4: Verify User
echo -e "${YELLOW}Test 4: Verifying User${NC}"
USER_ID=$(curl -s $BASE_URL/api/users | jq -r '.[0].id')
curl -s -X POST "$BASE_URL/api/users/$USER_ID/verify?method=civic&wallet_address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1" | jq
echo ""

# Test 5: Create Passport
echo -e "${YELLOW}Test 5: Creating Passport${NC}"
curl -s -X POST "$BASE_URL/api/passports?user_id=$USER_ID" | jq
echo ""

# Test 6: AI Risk Assessment
echo -e "${YELLOW}Test 6: AI Risk Assessment${NC}"
curl -s -X POST $BASE_URL/api/ai-oracle/assess \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "requested_loan_amount": 10000
  }' | jq
echo ""

# Test 7: Oracle Stats
echo -e "${YELLOW}Test 7: Oracle Statistics${NC}"
curl -s $BASE_URL/api/ai-oracle/stats | jq
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Your API Key: $API_KEY"
echo "Save this for future use!"
