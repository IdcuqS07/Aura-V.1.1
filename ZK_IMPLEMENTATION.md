# 🔐 ZK Threshold Proof Implementation

## Overview
Complete implementation of Zero-Knowledge Threshold Proof system for Aura Protocol.

## Components

### 1. Circom Circuit (`circuits/threshold.circom`)
- **Inputs**: GitHub score, Twitter score, wallet age, transaction count
- **Threshold**: Minimum score required (default: 50)
- **Output**: Proof that score ≥ threshold without revealing actual score
- **Privacy**: Individual scores remain private

### 2. Proof Generation (`circuits/generate_proof.js`)
- Generate ZK proof from user data
- Format proof for Solidity verification
- Verify proof off-chain

### 3. Smart Contract (`contracts/contracts/ZKThresholdBadge.sol`)
- Verify ZK proofs on-chain
- Mint soulbound badges
- Prevent double-spending with nullifiers

### 4. Backend Service (`backend/zk_proof_service.py`)
- Calculate user scores
- Generate proofs via Node.js
- API endpoints for proof operations

### 5. Frontend Integration (`frontend/src/services/zkProofService.js`)
- User-friendly proof generation
- Badge minting interface
- Score calculation display

## Setup Instructions

### 1. Install Dependencies
```bash
cd circuits
npm install circomlib snarkjs
```

### 2. Compile Circuit
```bash
chmod +x compile.sh
./compile.sh
```

### 3. Deploy Contracts
```bash
cd ../contracts
npx hardhat run scripts/deploy-zk-threshold.js --network amoy
```

### 4. Update Backend
```bash
cd ../backend
pip install -r requirements.txt
```

### 5. Configure Frontend
```bash
cd ../frontend
# Add to .env:
REACT_APP_ZK_BADGE_ADDRESS=<deployed_address>
```

## Usage Flow

### User Journey
1. **Calculate Score**: User checks their credibility score
2. **Generate Proof**: System generates ZK proof if score ≥ threshold
3. **Mint Badge**: User mints badge on-chain with proof
4. **Verification**: Smart contract verifies proof and mints NFT

### API Endpoints

**Calculate Score**
```bash
POST /api/zk/calculate-score
{
  "wallet_address": "0x..."
}
```

**Generate Proof**
```bash
POST /api/zk/generate-proof
{
  "wallet_address": "0x...",
  "threshold": 50
}
```

**Verify Proof**
```bash
POST /api/zk/verify-proof
{
  "proof": {...},
  "publicSignals": [...]
}
```

## Score Calculation

| Component | Max Score |
|-----------|-----------|
| GitHub Verified | 30 |
| Twitter Verified | 20 |
| Wallet Age | 25 |
| Transaction Count | 25 |
| **Total** | **100** |

### Formulas
- **Wallet Age**: min(25, days / 10)
- **Transactions**: min(25, count / 5)

## Testing

### Test Circuit
```bash
cd circuits
node test_threshold.js
```

### Test Smart Contract
```bash
cd contracts
npx hardhat test test/ZKThresholdBadge.test.js
```

### Test Backend
```bash
cd backend
python -m pytest test_zk_proof.py
```

## Security Features

1. **Zero-Knowledge**: Scores remain private
2. **Nullifiers**: Prevent proof reuse
3. **Soulbound**: Badges non-transferable
4. **Threshold**: Minimum score requirement
5. **On-chain Verification**: Trustless validation

## Deployment Checklist

- [ ] Compile circuits
- [ ] Generate proving/verification keys
- [ ] Deploy verifier contract
- [ ] Deploy badge contract
- [ ] Update backend config
- [ ] Update frontend config
- [ ] Test end-to-end flow
- [ ] Deploy to production

## Files Created

**Circuits:**
- `circuits/threshold.circom` - Main circuit
- `circuits/compile.sh` - Compilation script
- `circuits/generate_proof.js` - Proof generation
- `circuits/test_threshold.js` - Testing

**Contracts:**
- `contracts/contracts/ZKThresholdBadge.sol` - Badge contract
- `contracts/contracts/ThresholdVerifier.sol` - Auto-generated verifier
- `contracts/scripts/deploy-zk-threshold.js` - Deployment

**Backend:**
- `backend/zk_proof_service.py` - Proof service
- `backend/zk_routes.py` - API routes

**Frontend:**
- `frontend/src/services/zkProofService.js` - Frontend service

## Next Steps

1. Compile circuits: `cd circuits && ./compile.sh`
2. Deploy contracts: `cd contracts && npx hardhat run scripts/deploy-zk-threshold.js --network amoy`
3. Test integration: `node circuits/test_threshold.js`
4. Update production config
5. Deploy to VPS

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Guide](https://github.com/iden3/snarkjs)
- [Groth16 Protocol](https://eprint.iacr.org/2016/260.pdf)
