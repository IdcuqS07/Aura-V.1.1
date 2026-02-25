#!/bin/bash

# Wave 6: Multi-Chain Deployment Script
# Deploys CrossChainPassport to all testnets and sets up trusted remotes

set -e

echo "🚀 Wave 6: Multi-Chain Deployment Starting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please copy .env.example to .env and fill in your keys"
    exit 1
fi

# Load environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Deployment Plan:${NC}"
echo "1. Deploy to Polygon Amoy"
echo "2. Deploy to Ethereum Sepolia"
echo "3. Deploy to BSC Testnet"
echo "4. Deploy to Arbitrum Sepolia"
echo "5. Deploy to Optimism Sepolia"
echo "6. Set trusted remotes"
echo "7. Test cross-chain sync"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Array to store deployed addresses
declare -A ADDRESSES
declare -A TX_HASHES

# Function to deploy to a network
deploy_to_network() {
    local network=$1
    local network_name=$2
    
    echo ""
    echo -e "${YELLOW}🔄 Deploying to $network_name...${NC}"
    
    # Deploy contract
    npx hardhat run scripts/deploy-crosschain.js --network $network
    
    # Read deployment info
    if [ -f "deployments/${network}.json" ]; then
        local address=$(cat deployments/${network}.json | grep -o '"crossChainPassport":"[^"]*' | cut -d'"' -f4)
        ADDRESSES[$network]=$address
        echo -e "${GREEN}✅ Deployed to $network_name: $address${NC}"
    else
        echo -e "${RED}❌ Deployment failed for $network_name${NC}"
        return 1
    fi
}

# Deploy to all networks
echo ""
echo -e "${YELLOW}📦 Starting Deployments...${NC}"

deploy_to_network "polygon-amoy" "Polygon Amoy"
sleep 5

deploy_to_network "ethereum-sepolia" "Ethereum Sepolia"
sleep 5

deploy_to_network "bsc-testnet" "BSC Testnet"
sleep 5

deploy_to_network "arbitrum-sepolia" "Arbitrum Sepolia"
sleep 5

deploy_to_network "optimism-sepolia" "Optimism Sepolia"

# Display all deployed addresses
echo ""
echo -e "${GREEN}✅ All Deployments Complete!${NC}"
echo ""
echo "📝 Deployed Addresses:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for network in "${!ADDRESSES[@]}"; do
    echo "$network: ${ADDRESSES[$network]}"
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create deployment summary
cat > deployments/summary.json << EOF
{
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "networks": {
    "polygon-amoy": {
      "address": "${ADDRESSES[polygon-amoy]}",
      "chainId": 80002,
      "lzChainId": 10267,
      "explorer": "https://amoy.polygonscan.com/address/${ADDRESSES[polygon-amoy]}"
    },
    "ethereum-sepolia": {
      "address": "${ADDRESSES[ethereum-sepolia]}",
      "chainId": 11155111,
      "lzChainId": 10161,
      "explorer": "https://sepolia.etherscan.io/address/${ADDRESSES[ethereum-sepolia]}"
    },
    "bsc-testnet": {
      "address": "${ADDRESSES[bsc-testnet]}",
      "chainId": 97,
      "lzChainId": 10102,
      "explorer": "https://testnet.bscscan.com/address/${ADDRESSES[bsc-testnet]}"
    },
    "arbitrum-sepolia": {
      "address": "${ADDRESSES[arbitrum-sepolia]}",
      "chainId": 421614,
      "lzChainId": 10231,
      "explorer": "https://sepolia.arbiscan.io/address/${ADDRESSES[arbitrum-sepolia]}"
    },
    "optimism-sepolia": {
      "address": "${ADDRESSES[optimism-sepolia]}",
      "chainId": 11155420,
      "lzChainId": 10232,
      "explorer": "https://sepolia-optimism.etherscan.io/address/${ADDRESSES[optimism-sepolia]}"
    }
  }
}
EOF

echo ""
echo -e "${GREEN}📄 Deployment summary saved to deployments/summary.json${NC}"

echo ""
echo -e "${YELLOW}🔗 Next Steps:${NC}"
echo "1. Run: npm run setup-trusted-remotes"
echo "2. Update backend/multichain_routes.py with addresses"
echo "3. Test cross-chain sync"
echo ""
echo -e "${GREEN}🎉 Wave 6 Deployment Complete!${NC}"
