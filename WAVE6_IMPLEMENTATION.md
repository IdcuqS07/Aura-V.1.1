# Wave 6: Cross-Chain Foundation - Implementation Guide

## Overview
Wave 6 implements cross-chain interoperability using LayerZero protocol, enabling passport synchronization across multiple testnets.

## Components Implemented

### 1. Smart Contracts

#### CrossChainPassport.sol
- **Location**: `contracts/CrossChainPassport.sol`
- **Features**:
  - LayerZero-based cross-chain messaging
  - Passport data synchronization
  - Event-based message validation
  - Automatic retry mechanisms
  - Fee estimation for cross-chain transactions

**Key Functions**:
```solidity
updatePassport(uint256 _creditScore) // Update local passport
syncToChain(uint16 _dstChainId) // Sync to destination chain
estimateFee(uint16 _dstChainId, address _userAddress) // Estimate sync cost
```

### 2. Backend Services

#### Multi-Chain API Aggregator
- **Location**: `backend/multichain_routes.py`
- **Endpoints**:
  - `GET /api/multichain/chains` - List supported chains
  - `GET /api/multichain/passport/{wallet}` - Aggregate passport data
  - `GET /api/multichain/sync-status/{wallet}` - Check sync status
  - `POST /api/multichain/estimate-sync-fee` - Estimate LayerZero fees

**Supported Chains**:
- Polygon Amoy (Chain ID: 80002)
- Ethereum Sepolia (Chain ID: 11155111)
- BSC Testnet (Chain ID: 97)
- Arbitrum Sepolia (Chain ID: 421614)
- Optimism Sepolia (Chain ID: 11155420)

### 3. Frontend Components

#### CrossChainExplorer.jsx
- **Location**: `frontend/src/components/CrossChainExplorer.jsx`
- **Features**:
  - Unified view of passport across all chains
  - Chain-specific filtering
  - Sync status visualization
  - Direct links to block explorers
  - Real-time data updates

## Deployment Instructions

### Prerequisites
```bash
# Install LayerZero dependencies
cd contracts
npm install @layerzerolabs/solidity-examples

# Install Python dependencies
cd ../backend
pip install web3 asyncio
```

### Step 1: Deploy to Polygon Amoy
```bash
cd contracts
npx hardhat run scripts/deploy-crosschain.js --network polygon-amoy
```

### Step 2: Deploy to Other Chains
```bash
# Ethereum Sepolia
npx hardhat run scripts/deploy-crosschain.js --network ethereum-sepolia

# BSC Testnet
npx hardhat run scripts/deploy-crosschain.js --network bsc-testnet

# Arbitrum Sepolia
npx hardhat run scripts/deploy-crosschain.js --network arbitrum-sepolia

# Optimism Sepolia
npx hardhat run scripts/deploy-crosschain.js --network optimism-sepolia
```

### Step 3: Set Trusted Remotes
After deploying to all chains, set trusted remotes for cross-chain communication:

```javascript
// Example: Connect Polygon Amoy to Ethereum Sepolia
const polygonContract = await ethers.getContractAt(
  "CrossChainPassport",
  POLYGON_ADDRESS
);

await polygonContract.setTrustedRemote(
  10161, // Ethereum Sepolia LZ Chain ID
  ethers.utils.solidityPack(
    ['address', 'address'],
    [ETHEREUM_ADDRESS, POLYGON_ADDRESS]
  )
);
```

### Step 4: Update Backend Configuration
Update `multichain_routes.py` with deployed contract addresses:

```python
default_contracts = {
    "polygon_amoy": "0xYOUR_POLYGON_ADDRESS",
    "ethereum_sepolia": "0xYOUR_ETHEREUM_ADDRESS",
    "bsc_testnet": "0xYOUR_BSC_ADDRESS",
    "arbitrum_sepolia": "0xYOUR_ARBITRUM_ADDRESS",
    "optimism_sepolia": "0xYOUR_OPTIMISM_ADDRESS"
}
```

### Step 5: Frontend Integration
Add CrossChainExplorer to your app:

```javascript
import CrossChainExplorer from './components/CrossChainExplorer';

// In your component
<CrossChainExplorer walletAddress={userWallet} />
```

## Testing

### 1. Test Local Passport Update
```bash
# On Polygon Amoy
cast send $CONTRACT_ADDRESS \
  "updatePassport(uint256)" 750 \
  --rpc-url $POLYGON_RPC \
  --private-key $PRIVATE_KEY
```

### 2. Test Cross-Chain Sync
```bash
# Estimate fee
cast call $CONTRACT_ADDRESS \
  "estimateFee(uint16,address)" 10161 $USER_ADDRESS \
  --rpc-url $POLYGON_RPC

# Sync to Ethereum Sepolia
cast send $CONTRACT_ADDRESS \
  "syncToChain(uint16)" 10161 \
  --value 0.001ether \
  --rpc-url $POLYGON_RPC \
  --private-key $PRIVATE_KEY
```

### 3. Test API Aggregator
```bash
# Get passport from all chains
curl http://localhost:9002/api/multichain/passport/0xYOUR_ADDRESS

# Check sync status
curl http://localhost:9002/api/multichain/sync-status/0xYOUR_ADDRESS
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│              CrossChainExplorer Component                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Aggregator                      │
│           multichain_routes.py (FastAPI)                 │
└─────┬──────────┬──────────┬──────────┬──────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Polygon │ │Ethereum │ │   BSC   │ │Arbitrum │
│  Amoy   │ │ Sepolia │ │ Testnet │ │ Sepolia │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴───────────┴───────────┘
                     │
              LayerZero Network
         (Cross-Chain Messaging)
```

## Key Features

### 1. Event-Based Message Validation
- Messages include timestamp for freshness check
- Only newer data updates existing passport
- Prevents replay attacks

### 2. Retry Mechanisms
- LayerZero's built-in retry for failed messages
- Configurable gas limits per chain
- Automatic fallback to manual retry

### 3. State Consistency
- Timestamp-based conflict resolution
- Most recent update wins
- Audit trail via events

### 4. Developer Experience
- Single API endpoint for all chains
- Automatic chain detection
- Unified error handling
- Real-time sync status

## Gas Optimization

### Estimated Costs (Testnet)
- Local update: ~50,000 gas
- Cross-chain sync: ~200,000 gas + LayerZero fee (~0.001 ETH)
- Batch sync (5 chains): ~0.005 ETH total

### Optimization Tips
1. Batch updates when possible
2. Use LayerZero's relayer for better rates
3. Sync only when score changes significantly
4. Cache frequently accessed data

## Security Considerations

1. **Trusted Remotes**: Only set trusted remotes for verified contracts
2. **Message Validation**: Always validate source chain and sender
3. **Reentrancy**: Use OpenZeppelin's ReentrancyGuard if needed
4. **Access Control**: Restrict admin functions to owner
5. **Rate Limiting**: Implement rate limits on sync operations

## Monitoring

### Events to Monitor
```solidity
event PassportSynced(address indexed owner, uint256 creditScore, uint16 sourceChain);
event PassportUpdated(address indexed owner, uint256 newScore);
event CrossChainMessageSent(uint16 indexed dstChainId, address indexed owner);
```

### Metrics to Track
- Cross-chain message success rate
- Average sync time per chain
- Gas costs per operation
- Failed message count
- Sync lag (time difference between chains)

## Troubleshooting

### Message Not Received
1. Check LayerZero relayer status
2. Verify trusted remote is set correctly
3. Ensure sufficient gas for destination chain
4. Check LayerZero Scan for message status

### Sync Status Out of Date
1. Verify timestamp comparison logic
2. Check for failed transactions
3. Manually trigger sync if needed
4. Review event logs for errors

## Next Steps (Wave 7)

1. **Reputation DAO Integration**
   - Governance for cross-chain parameters
   - Voting on trusted chains
   - Dispute resolution across chains

2. **Advanced Features**
   - Automatic sync on score changes
   - Multi-hop routing for unsupported chains
   - Cross-chain credit score aggregation
   - Weighted average across chains

3. **Performance Improvements**
   - Batch message processing
   - Optimistic updates with rollback
   - Caching layer for frequently accessed data

## Resources

- [LayerZero Docs](https://layerzero.gitbook.io/)
- [Testnet Faucets](https://faucet.polygon.technology/)
- [LayerZero Scan](https://testnet.layerzeroscan.com/)
- [Hardhat Multi-Network Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)

## Support

For issues or questions:
- GitHub Issues: https://github.com/IdcuqS07/Aura-V.1.1/issues
- Discord: [Coming Soon]
- Email: support@aurapass.xyz

---

**Wave 6 Status**: ✅ Implementation Complete
**Next Wave**: Wave 7 - Reputation DAO
**Last Updated**: December 2025
