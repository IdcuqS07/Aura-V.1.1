# Wave 6: Quick Start Deployment Guide

## Prerequisites

1. **Testnet Tokens** - Get free testnet tokens from faucets:
   - Polygon Amoy: https://faucet.polygon.technology/
   - Ethereum Sepolia: https://sepoliafaucet.com/
   - BSC Testnet: https://testnet.bnbchain.org/faucet-smart
   - Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia
   - Optimism Sepolia: https://app.optimism.io/faucet

2. **API Keys** (Optional, for contract verification):
   - Polygonscan: https://polygonscan.com/myapikey
   - Etherscan: https://etherscan.io/myapikey
   - BscScan: https://bscscan.com/myapikey
   - Arbiscan: https://arbiscan.io/myapikey
   - Optimism Etherscan: https://optimistic.etherscan.io/myapikey

## Step-by-Step Deployment

### 1. Setup Environment

```bash
cd contracts

# Copy environment template
cp .env.example .env

# Edit .env and add your PRIVATE_KEY
nano .env
```

**Important**: Make sure you have testnet tokens on ALL chains before deploying!

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### 4. Deploy to All Chains

```bash
# Make script executable
chmod +x scripts/deploy-all-chains.sh

# Run deployment
npm run deploy:all
```

This will:
- Deploy CrossChainPassport to all 5 testnets
- Verify contracts on block explorers
- Save deployment addresses to `deployments/summary.json`

**Estimated time**: 5-10 minutes
**Estimated cost**: ~0.05 ETH total (testnet tokens)

### 5. Setup Trusted Remotes

```bash
npm run setup-remotes
```

This configures cross-chain communication between all deployed contracts.

**Estimated time**: 3-5 minutes

### 6. Test Cross-Chain Sync

```bash
npm run test-crosschain
```

This will:
1. Update passport on Polygon Amoy
2. Sync to Ethereum Sepolia
3. Verify sync was successful
4. Sync to remaining chains

**Estimated time**: 2-3 minutes

### 7. Update Backend Configuration

```bash
# Copy deployment addresses
cat deployments/summary.json

# Update backend/multichain_routes.py
cd ../backend
nano multichain_routes.py
```

Update the `default_contracts` dictionary with your deployed addresses:

```python
default_contracts = {
    "polygon_amoy": "0xYOUR_POLYGON_ADDRESS",
    "ethereum_sepolia": "0xYOUR_ETHEREUM_ADDRESS",
    "bsc_testnet": "0xYOUR_BSC_ADDRESS",
    "arbitrum_sepolia": "0xYOUR_ARBITRUM_ADDRESS",
    "optimism_sepolia": "0xYOUR_OPTIMISM_ADDRESS"
}
```

### 8. Start Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 9002
```

### 9. Test API

```bash
# Get supported chains
curl http://localhost:9002/api/multichain/chains

# Get passport from all chains
curl http://localhost:9002/api/multichain/passport/YOUR_WALLET_ADDRESS
```

### 10. Frontend Integration

```bash
cd ../frontend
yarn start
```

Navigate to `/crosschain` to see the unified explorer.

## Verification

### Check Deployments

Visit block explorers to verify contracts:

```bash
# View deployment summary
cat contracts/deployments/summary.json
```

Each contract should be verified and visible on its respective explorer.

### Monitor Cross-Chain Messages

Visit LayerZero Scan to monitor message delivery:
- https://testnet.layerzeroscan.com/

Search for your wallet address to see all cross-chain transactions.

### Test API Endpoints

```bash
# Health check
curl http://localhost:9002/api/multichain/chains

# Get passport data
curl http://localhost:9002/api/multichain/passport/0xYOUR_ADDRESS

# Check sync status
curl http://localhost:9002/api/multichain/sync-status/0xYOUR_ADDRESS

# Estimate sync fee
curl -X POST http://localhost:9002/api/multichain/estimate-sync-fee \
  -H "Content-Type: application/json" \
  -d '{
    "source_chain": "polygon_amoy",
    "destination_chains": ["ethereum_sepolia"],
    "wallet_address": "0xYOUR_ADDRESS"
  }'
```

## Troubleshooting

### Deployment Failed

**Issue**: Transaction reverted or out of gas

**Solution**:
```bash
# Check testnet token balance
cast balance YOUR_ADDRESS --rpc-url $POLYGON_RPC_URL

# Get more testnet tokens from faucets
# Retry deployment for specific network
npx hardhat run scripts/deploy-crosschain.js --network polygon-amoy
```

### Trusted Remote Setup Failed

**Issue**: Transaction reverted when setting trusted remote

**Solution**:
```bash
# Verify contract is deployed
cast code CONTRACT_ADDRESS --rpc-url $RPC_URL

# Check if you're the owner
cast call CONTRACT_ADDRESS "owner()" --rpc-url $RPC_URL

# Retry setup
npm run setup-remotes
```

### Cross-Chain Message Not Delivered

**Issue**: Passport not synced after 2 minutes

**Solution**:
1. Check LayerZero Scan: https://testnet.layerzeroscan.com/
2. Search for your transaction hash
3. Check message status (Delivered/Inflight/Failed)
4. If failed, retry sync with higher gas:

```bash
# Estimate fee with buffer
cast call CONTRACT_ADDRESS \
  "estimateFee(uint16,address)" 10161 YOUR_ADDRESS \
  --rpc-url $POLYGON_RPC_URL

# Retry sync with 20% more fee
cast send CONTRACT_ADDRESS \
  "syncToChain(uint16)" 10161 \
  --value 0.0012ether \
  --rpc-url $POLYGON_RPC_URL \
  --private-key $PRIVATE_KEY
```

### API Returns Empty Data

**Issue**: `/api/multichain/passport/{address}` returns no chains

**Solution**:
```bash
# Check if contracts are deployed
cat contracts/deployments/summary.json

# Verify backend configuration
grep "default_contracts" backend/multichain_routes.py

# Test RPC connections
curl -X POST $POLYGON_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Cost Breakdown

### Deployment Costs (Testnet)
- Polygon Amoy: ~0.01 ETH
- Ethereum Sepolia: ~0.015 ETH
- BSC Testnet: ~0.005 ETH
- Arbitrum Sepolia: ~0.008 ETH
- Optimism Sepolia: ~0.008 ETH
- **Total**: ~0.046 ETH (testnet tokens)

### Cross-Chain Sync Costs
- Per message: ~0.001-0.002 ETH
- Sync to 4 chains: ~0.006 ETH

### Mainnet Estimates
- Deployment: ~$50-100 per chain
- Cross-chain sync: ~$2-5 per message

## Next Steps

1. ✅ Deploy to all testnets
2. ✅ Setup trusted remotes
3. ✅ Test cross-chain sync
4. ✅ Update backend configuration
5. ⏭️ Integrate with frontend
6. ⏭️ Add to navigation menu
7. ⏭️ Test with real users
8. ⏭️ Monitor LayerZero messages
9. ⏭️ Optimize gas costs
10. ⏭️ Prepare for mainnet

## Support

- LayerZero Docs: https://layerzero.gitbook.io/
- LayerZero Discord: https://discord.gg/layerzero
- Testnet Faucets: See Prerequisites section
- GitHub Issues: https://github.com/IdcuqS07/Aura-V.1.1/issues

---

**Wave 6 Status**: Ready for Deployment
**Estimated Time**: 15-20 minutes
**Last Updated**: December 2025
