# 🚀 ZK Threshold Proof - Quick Start

## 1-Command Setup

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /circuits"
npm install && ./compile.sh
```

## Deploy to Polygon Amoy

```bash
cd ../contracts
npx hardhat run scripts/deploy-zk-threshold.js --network amoy
```

## Test Locally

```bash
cd ../circuits
node test_threshold.js
```

## Integration Steps

### Backend
Add to `server.py`:
```python
from zk_routes import zk_bp
app.register_blueprint(zk_bp)
```

### Frontend
```javascript
import zkProofService from './services/zkProofService';

// Calculate score
const score = await zkProofService.calculateScore(walletAddress);

// Generate proof
const proof = await zkProofService.generateProof(walletAddress, 50);

// Mint badge
const receipt = await zkProofService.mintZKBadge(proof, signer);
```

## Score Thresholds

- **Bronze**: 25 points
- **Silver**: 50 points
- **Gold**: 75 points

## Quick Test

```bash
# Test with sample data
node circuits/generate_proof.js 50 12345 30 20 15 10 secret123
```

Expected output: Proof valid = true (score: 75)
