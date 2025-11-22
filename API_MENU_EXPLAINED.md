# 🔑 Menu API - Explained

## 🎯 Apa itu Menu API?

**Menu API** adalah dashboard untuk **Proof-as-a-Service** - layanan API yang memungkinkan developer eksternal menggunakan Aura Protocol untuk generate dan verify ZK proofs.

---

## 💡 Konsep: Proof-as-a-Service (PaaS)

### Problem:
```
Developer ingin integrate ZK proof verification ke aplikasi mereka
❌ Harus build infrastructure sendiri
❌ Harus deploy smart contracts
❌ Harus manage proof generation
❌ Complex & expensive
```

### Solution: Aura Protocol API
```
✅ Simple REST API
✅ Generate ZK proofs via API call
✅ Verify proofs instantly
✅ No infrastructure needed
✅ Pay-as-you-go pricing
```

---

## 🎯 Tujuan Menu API

### 1. **API Key Management**
```
User bisa:
- Generate API keys
- Pilih pricing tier (Free/Pro/Enterprise)
- Monitor usage
- Track rate limits
```

### 2. **Monetization**
```
Pricing Tiers:
- Free: 100 requests/day ($0)
- Pro: 1,000 requests/day ($29/mo)
- Enterprise: 10,000 requests/day ($199/mo)
```

### 3. **Developer Portal**
```
Provide:
- API documentation
- Code examples
- Integration guides
- Quick start tutorials
```

---

## 📊 Isi Menu API

### 1. Pricing Tiers (Choose Your Plan)
```
┌─────────────────────────────────────┐
│  Free          Pro         Enterprise│
│  $0            $29/mo      $199/mo   │
│  100/day       1,000/day   10,000/day│
│                                      │
│  [Select]      [Select]    [Select]  │
└─────────────────────────────────────┘

[Generate API Key Button]
```

**Features per Tier:**

**Free:**
- Basic API access
- Community support
- Public documentation

**Pro (Popular):**
- Priority support
- Advanced analytics
- Webhook notifications

**Enterprise:**
- Dedicated support
- Custom integration
- SLA guarantee

### 2. Your API Keys (Management)
```
┌─────────────────────────────────────┐
│  PRO | Active                        │
│  aura_sk_1234567890abcdef [Copy]    │
│  Created: Jan 7, 2025                │
│                                      │
│  Requests Used: 245                  │
│  Rate Limit: 1,000/day               │
│  Remaining: 755                      │
│                                      │
│  Usage: ████████░░ 24.5%             │
└─────────────────────────────────────┘
```

**Info Displayed:**
- API key (with copy button)
- Tier badge
- Active/Inactive status
- Creation date
- Usage statistics
- Rate limit info
- Usage bar (visual)

### 3. Developer Resources
```
┌─────────────────────────────────────┐
│  📚 Developer Resources              │
│                                      │
│  [API Documentation]                 │
│  Complete API reference              │
│                                      │
│  [Integration Guide]                 │
│  Quick start & examples              │
│                                      │
│  [Code Examples]                     │
│  JS, Python, Solidity                │
└─────────────────────────────────────┘
```

---

## 🔧 API Endpoints (Yang Disediakan)

### 1. Generate ZK Proof
```bash
POST /api/v1/proof/generate
Headers: X-API-Key: your_key

Body:
{
  "user_id": "0x...",
  "wallet_address": "0x..."
}

Response:
{
  "success": true,
  "proof": {
    "proof_hash": "0x...",
    "credit_score": 750,
    "risk_level": "low"
  }
}
```

### 2. Verify ZK Proof
```bash
POST /api/v1/proof/verify
Headers: X-API-Key: your_key

Body:
{
  "proof_hash": "0x...",
  "user_id": "0x..."
}

Response:
{
  "success": true,
  "is_valid": true,
  "verified_at": "2025-01-07T..."
}
```

### 3. Query Passport
```bash
POST /api/v1/passport/query
Headers: X-API-Key: your_key

Body:
{
  "wallet_address": "0x..."
}

Response:
{
  "success": true,
  "passport": {
    "credit_score": 750,
    "grade": "Very Good",
    "risk_level": "low"
  }
}
```

---

## 💼 Use Cases

### 1. DeFi Lending Platform
```javascript
// Check user credit before lending
const response = await fetch('https://api.auraprotocol.com/v1/passport/query', {
  method: 'POST',
  headers: {
    'X-API-Key': 'aura_sk_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    wallet_address: borrowerAddress
  })
});

const { passport } = await response.json();

if (passport.credit_score >= 700) {
  // Approve loan with better terms
  approveLoan(borrowerAddress, {
    amount: 10000,
    interestRate: 5,
    collateralRatio: 110
  });
}
```

### 2. NFT Marketplace (Gated Access)
```javascript
// Verify user has good reputation
const proof = await generateProof(userAddress);

if (proof.credit_score >= 600) {
  // Grant access to premium NFT drops
  grantPremiumAccess(userAddress);
}
```

### 3. DAO Voting (Weighted by Reputation)
```javascript
// Get user's reputation score
const passport = await queryPassport(voterAddress);

// Weight vote by credit score
const voteWeight = passport.credit_score / 1000;
recordVote(voterAddress, voteWeight);
```

---

## 🎯 Business Model

### Revenue Streams:

**1. API Subscriptions**
```
Free: $0 (lead generation)
Pro: $29/mo × users
Enterprise: $199/mo × users
```

**2. Usage-Based Pricing (Future)**
```
$0.01 per API call above tier limit
```

**3. Custom Integrations (Future)**
```
White-label solutions
Custom SLAs
Dedicated infrastructure
```

### Target Customers:

**1. DeFi Protocols**
- Lending platforms (Aave, Compound)
- DEXs with reputation systems
- Yield aggregators

**2. NFT Platforms**
- Marketplaces (OpenSea, Blur)
- Gated communities
- Creator platforms

**3. DAOs**
- Governance platforms
- Reputation-weighted voting
- Contributor scoring

**4. Web3 Apps**
- Social platforms
- Gaming platforms
- Identity solutions

---

## 🔐 Security Features

### API Key Security:
```
✅ Keys are hashed in database
✅ Rate limiting per key
✅ Usage tracking
✅ Can be revoked anytime
✅ Tier-based permissions
```

### Request Validation:
```
✅ API key authentication
✅ Request signature verification
✅ Rate limit enforcement
✅ Input sanitization
✅ Error handling
```

---

## 📈 Metrics Tracked

### Per API Key:
```
- Total requests made
- Requests remaining
- Usage percentage
- Last used timestamp
- Error rate
- Response time
```

### Global Analytics:
```
- Total API calls
- Active API keys
- Revenue per tier
- Most used endpoints
- Error rates
- Uptime
```

---

## 🚀 Integration Example

### JavaScript/TypeScript:
```javascript
import { AuraAPI } from '@aura-protocol/sdk';

const aura = new AuraAPI({
  apiKey: 'aura_sk_...'
});

// Generate proof
const proof = await aura.proof.generate({
  userId: '0x...',
  walletAddress: '0x...'
});

// Verify proof
const isValid = await aura.proof.verify({
  proofHash: proof.proof_hash,
  userId: '0x...'
});

// Query passport
const passport = await aura.passport.query({
  walletAddress: '0x...'
});
```

### Python:
```python
from aura_protocol import AuraAPI

aura = AuraAPI(api_key='aura_sk_...')

# Generate proof
proof = aura.proof.generate(
    user_id='0x...',
    wallet_address='0x...'
)

# Verify proof
is_valid = aura.proof.verify(
    proof_hash=proof['proof_hash'],
    user_id='0x...'
)
```

### Solidity:
```solidity
interface IAuraOracle {
    function verifyProof(
        bytes32 proofHash,
        address user
    ) external view returns (bool);
}

contract MyDeFiProtocol {
    IAuraOracle public auraOracle;
    
    function checkUserCredit(address user) public view returns (uint256) {
        // Query Aura Oracle
        return auraOracle.getCreditScore(user);
    }
}
```

---

## ✅ Summary

**Menu API adalah:**
- 🔑 Dashboard untuk manage API keys
- 💰 Pricing tiers (Free/Pro/Enterprise)
- 📊 Usage monitoring & analytics
- 📚 Developer documentation
- 🔧 Proof-as-a-Service platform

**Tujuan:**
- Monetize Aura Protocol
- Enable external integrations
- Provide developer tools
- Scale adoption

**Target:**
- DeFi protocols
- NFT platforms
- DAOs
- Web3 applications

**Value Proposition:**
- Simple API for ZK proofs
- No infrastructure needed
- Pay-as-you-go pricing
- Enterprise-grade reliability

---

**"Proof-as-a-Service: ZK Proofs Made Simple"** 🔑
