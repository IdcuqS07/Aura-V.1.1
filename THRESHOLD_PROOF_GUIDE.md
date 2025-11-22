# 🔐 ZK Threshold Proof Implementation

## Overview
Implementasi Zero-Knowledge proof untuk membuktikan bahwa user score ≥ threshold tanpa mengungkapkan score sebenarnya.

## Score Calculation
Total score maksimal: **100 points**

- **GitHub Verification**: 30 points
- **Twitter Verification**: 20 points  
- **Wallet Age**: 25 points (1 point per 10 days)
- **Transaction Count**: 25 points (1 point per 5 transactions)

## API Endpoints

### 1. Generate Threshold Proof
```bash
POST /api/threshold/generate
```

**Request:**
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "github_verified": true,
  "twitter_verified": true,
  "wallet_age_days": 180,
  "transaction_count": 50,
  "threshold": 50
}
```

**Response:**
```json
{
  "proof_hash": "abc123...",
  "is_valid": true,
  "threshold": 50,
  "nullifier": "def456...",
  "message": "Score meets threshold"
}
```

### 2. Verify Proof
```bash
POST /api/threshold/verify?proof_hash=abc123&nullifier=def456&threshold=50
```

### 3. Calculate Score (Testing Only)
```bash
GET /api/threshold/score/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1?github_verified=true&twitter_verified=true&wallet_age_days=180&transaction_count=50
```

## Circuit Files

- **threshold.circom**: ZK circuit untuk threshold proof
- **poh.circom**: Proof of Humanity circuit

## Testing

```bash
# Test score calculation
curl "http://localhost:8080/api/threshold/score/0xABC?github_verified=true&twitter_verified=true&wallet_age_days=100&transaction_count=30"

# Generate proof
curl -X POST http://localhost:8080/api/threshold/generate \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xABC",
    "github_verified": true,
    "twitter_verified": true,
    "wallet_age_days": 100,
    "transaction_count": 30,
    "threshold": 50
  }'
```

## Use Cases

1. **DeFi Lending**: Prove creditworthiness without revealing exact score
2. **DAO Voting**: Prove reputation threshold for voting rights
3. **Airdrops**: Prove eligibility without exposing all credentials
4. **Access Control**: Prove minimum score for premium features

## Status
✅ Circuit implemented (threshold.circom)
✅ Backend service created
✅ API routes added
✅ Score calculation logic
🔄 Full ZK proof generation (requires circuit compilation)
