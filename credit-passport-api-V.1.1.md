# Credit Passport API V.1.1 - Dynamic Real-time System

## 📋 Executive Summary

Aura Protocol mengimplementasikan **Dynamic Credit Passport** yang tidak menyimpan nilai reputasi statis on-chain, melainkan menggunakan sistem **pointer/commitment** dengan **real-time re-evaluation**. Sistem ini memungkinkan data sumber off-chain dan hasil perhitungan reputasi diperbarui secara kontinyu, sehingga mitra dapat mengakses data kredit yang selalu terkini melalui API.

---

## 🎯 Konsep Inti

### Masalah Sistem Statis
- ❌ Data on-chain cepat usang
- ❌ Tidak mencerminkan aktivitas terkini user
- ❌ Biaya gas tinggi untuk update berkala
- ❌ Tidak scalable untuk data kompleks

### Solusi Aura: Hybrid Dynamic System
```
Off-chain Data Sources → Real-time Oracle → On-chain Commitment → API Access
```

**Prinsip:**
1. On-chain hanya menyimpan **commitment/pointer**
2. Off-chain melakukan **continuous monitoring**
3. Oracle melakukan **real-time computation**
4. API menyajikan **data terkini** dengan proof

---

## 🏗️ Arsitektur Sistem

### 1. On-chain Layer: Passport Commitment

**Smart Contract Structure:**
```solidity
struct PassportCommitment {
    bytes32 passportId;           // Unique identifier
    address owner;                // Wallet address
    bytes32 dataCommitment;       // Hash of data sources
    uint256 issuedAt;             // Creation timestamp
    uint256 lastVerified;         // Last verification time
    string oracleEndpoint;        // API endpoint
    bool isActive;                // Status
}

mapping(address => PassportCommitment) public passports;
mapping(bytes32 => bool) public commitments;
```

**Yang TIDAK disimpan on-chain:**
- Credit score
- Transaction count
- Reputation value
- Activity history
- Social media data

**Yang disimpan on-chain:**
- Passport ID (pointer)
- Owner address
- Data commitment hash
- Oracle endpoint
- Timestamps
- Status flags

---

### 2. Off-chain Layer: Data Aggregation

**Data Sources:**
```javascript
{
  "passport_id": "PASS-ABC123",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "data_sources": {
    "github": {
      "verified": true,
      "username": "user123",
      "contributions": 1250,
      "repositories": 45,
      "followers": 320,
      "last_activity": "2025-11-21T10:30:00Z",
      "account_age_days": 1825,
      "score": 85
    },
    "twitter": {
      "verified": true,
      "handle": "@user123",
      "followers": 5000,
      "following": 800,
      "tweets": 2500,
      "engagement_rate": 0.12,
      "account_age_days": 1200,
      "score": 75
    },
    "wallet": {
      "address": "0x742d35...",
      "age_days": 730,
      "transaction_count": 450,
      "total_volume_usd": 125500,
      "unique_contracts": 25,
      "nft_holdings": 12,
      "token_diversity": 8,
      "score": 90
    },
    "defi_activity": {
      "protocols_used": ["Aave", "Uniswap", "Compound"],
      "total_borrowed_usd": 50000,
      "total_supplied_usd": 75000,
      "repayment_rate": 100,
      "liquidation_count": 0,
      "active_positions": 3,
      "score": 95
    },
    "onchain_reputation": {
      "ens_domain": true,
      "poh_verified": true,
      "gitcoin_passport_score": 25.5,
      "worldcoin_verified": false,
      "lens_profile": true,
      "score": 88
    }
  },
  "metadata": {
    "computed_at": "2025-11-21T12:00:00Z",
    "computation_time_ms": 245,
    "data_freshness": "real-time",
    "oracle_version": "1.1.0"
  },
  "signature": "0xabc123def456..."
}
```

**Data Collection Methods:**
- **GitHub API**: Real-time activity monitoring
- **Twitter API**: Social engagement tracking
- **Blockchain Indexer**: On-chain transaction analysis
- **DeFi Protocols**: Lending/borrowing history
- **Identity Providers**: Verification status

---

### 3. Oracle Layer: Real-time Computation

**Computation Engine:**
```javascript
class ReputationOracle {
  async computePassport(address) {
    // 1. Fetch all data sources in parallel
    const [github, twitter, wallet, defi, onchain] = await Promise.all([
      this.fetchGithubData(address),
      this.fetchTwitterData(address),
      this.fetchWalletData(address),
      this.fetchDeFiData(address),
      this.fetchOnchainReputation(address)
    ]);
    
    // 2. Compute individual scores
    const scores = {
      github: this.computeGithubScore(github),
      twitter: this.computeTwitterScore(twitter),
      wallet: this.computeWalletScore(wallet),
      defi: this.computeDeFiScore(defi),
      onchain: this.computeOnchainScore(onchain)
    };
    
    // 3. Weighted aggregation
    const creditScore = this.aggregateScores(scores, {
      github: 0.15,
      twitter: 0.10,
      wallet: 0.25,
      defi: 0.35,
      onchain: 0.15
    });
    
    // 4. Risk assessment
    const riskLevel = this.assessRisk(creditScore, defi);
    
    // 5. Generate proof
    const proof = await this.generateProof({
      scores,
      creditScore,
      timestamp: Date.now()
    });
    
    // 6. Sign result
    const signature = await this.signResult({
      address,
      creditScore,
      proof,
      timestamp: Date.now()
    });
    
    return {
      passport_id: this.getPassportId(address),
      credit_score: creditScore,
      reputation_score: this.normalizeScore(creditScore),
      risk_level: riskLevel,
      scores,
      proof,
      signature,
      computed_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
  }
}
```

**Score Computation Logic:**

**GitHub Score (0-100):**
```javascript
githubScore = (
  contributions * 0.3 +
  repositories * 0.2 +
  followers * 0.2 +
  accountAge * 0.2 +
  recentActivity * 0.1
) / maxPossible * 100
```

**Wallet Score (0-100):**
```javascript
walletScore = (
  transactionCount * 0.25 +
  totalVolume * 0.30 +
  walletAge * 0.20 +
  contractInteractions * 0.15 +
  tokenDiversity * 0.10
) / maxPossible * 100
```

**DeFi Score (0-100):**
```javascript
defiScore = (
  repaymentRate * 0.40 +
  totalBorrowed * 0.20 +
  protocolDiversity * 0.20 +
  (1 - liquidationRate) * 0.20
) / maxPossible * 100
```

**Final Credit Score (0-1000):**
```javascript
creditScore = (
  githubScore * 0.15 +
  twitterScore * 0.10 +
  walletScore * 0.25 +
  defiScore * 0.35 +
  onchainScore * 0.15
) * 10
```

---

### 4. API Layer: Real-time Access

**Endpoint Structure:**

**GET /api/passport/{address}/realtime**
```json
{
  "passport_id": "PASS-ABC123",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "credit_score": 850,
  "reputation_score": 92.5,
  "risk_level": "low",
  "status": "active",
  "verified": true,
  "computed_at": "2025-11-21T12:00:00Z",
  "valid_until": "2025-11-21T12:05:00Z",
  "data_freshness": "2 seconds ago",
  "proof": {
    "commitment": "0xdef456...",
    "signature": "0xabc123...",
    "oracle": "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678"
  },
  "breakdown": {
    "github": {
      "score": 85,
      "weight": 0.15,
      "contribution": 12.75
    },
    "twitter": {
      "score": 75,
      "weight": 0.10,
      "contribution": 7.5
    },
    "wallet": {
      "score": 90,
      "weight": 0.25,
      "contribution": 22.5
    },
    "defi": {
      "score": 95,
      "weight": 0.35,
      "contribution": 33.25
    },
    "onchain": {
      "score": 88,
      "weight": 0.15,
      "contribution": 13.2
    }
  },
  "history": {
    "score_trend": "increasing",
    "last_30_days_change": +15,
    "peak_score": 865,
    "lowest_score": 720
  }
}
```

**GET /api/passport/{address}/verify**
```json
{
  "valid": true,
  "passport_id": "PASS-ABC123",
  "credit_score": 850,
  "threshold_met": true,
  "proof_verified": true,
  "signature_valid": true,
  "commitment_match": true,
  "timestamp": "2025-11-21T12:00:00Z"
}
```

**POST /api/passport/create**
```json
{
  "address": "0x742d35...",
  "data_sources": ["github", "twitter", "wallet", "defi"],
  "consent": true
}
```

**Response:**
```json
{
  "passport_id": "PASS-ABC123",
  "tx_hash": "0xdef456...",
  "commitment": "0xabc123...",
  "oracle_endpoint": "https://api.aurapass.xyz/passport/PASS-ABC123",
  "status": "active"
}
```

---

## 🔄 Update Mechanism

### Continuous Re-evaluation

**Background Job (Every 5 minutes):**
```javascript
async function continuousUpdate() {
  const activePassports = await db.passports.find({ 
    isActive: true 
  });
  
  for (const passport of activePassports) {
    try {
      // 1. Fetch latest data
      const latestData = await oracle.fetchAllSources(
        passport.owner
      );
      
      // 2. Compute new score
      const newScore = await oracle.computeScore(latestData);
      
      // 3. Check for significant change
      const oldScore = passport.credit_score;
      const change = Math.abs(newScore - oldScore);
      
      // 4. Update database
      await db.passports.updateOne(
        { passport_id: passport.passport_id },
        {
          $set: {
            credit_score: newScore,
            last_updated: new Date(),
            data_sources: latestData
          },
          $push: {
            score_history: {
              score: newScore,
              timestamp: new Date()
            }
          }
        }
      );
      
      // 5. Update on-chain if significant change
      if (change > 50) { // 5% change
        const newCommitment = hashData(latestData);
        await oracleContract.updateCommitment(
          passport.passport_id,
          newCommitment
        );
      }
      
      // 6. Emit event
      eventEmitter.emit('passport:updated', {
        passport_id: passport.passport_id,
        old_score: oldScore,
        new_score: newScore,
        change: change
      });
      
    } catch (error) {
      logger.error(`Update failed for ${passport.passport_id}:`, error);
    }
  }
}

// Run every 5 minutes
setInterval(continuousUpdate, 5 * 60 * 1000);
```

**Event-driven Updates:**
```javascript
// Listen to blockchain events
web3.eth.subscribe('logs', {
  address: userWallet,
  topics: ['Transfer', 'Borrow', 'Repay']
}).on('data', async (event) => {
  // Trigger immediate update
  await oracle.updatePassport(userAddress);
});

// Listen to social media webhooks
app.post('/webhook/github', async (req, res) => {
  const { user, event } = req.body;
  if (event === 'push' || event === 'pull_request') {
    await oracle.updatePassport(user.wallet);
  }
});
```

---

## 🔐 Security & Trust Model

### 1. Data Commitment
```javascript
// Generate commitment hash
function generateCommitment(passportData) {
  return keccak256(
    passportData.passport_id,
    passportData.owner,
    JSON.stringify(passportData.data_sources),
    passportData.computed_at,
    passportData.oracle_signature
  );
}

// Verify commitment
function verifyCommitment(passportData, onchainCommitment) {
  const computed = generateCommitment(passportData);
  return computed === onchainCommitment;
}
```

### 2. Oracle Signature
```javascript
// Oracle signs the result
async function signPassportData(passportData) {
  const message = {
    passport_id: passportData.passport_id,
    credit_score: passportData.credit_score,
    computed_at: passportData.computed_at,
    data_hash: hashData(passportData.data_sources)
  };
  
  const signature = await oraclePrivateKey.sign(
    JSON.stringify(message)
  );
  
  return {
    ...passportData,
    signature,
    oracle: oracleAddress
  };
}

// Verify signature
function verifyOracleSignature(passportData) {
  const message = {
    passport_id: passportData.passport_id,
    credit_score: passportData.credit_score,
    computed_at: passportData.computed_at,
    data_hash: hashData(passportData.data_sources)
  };
  
  return ecrecover(
    JSON.stringify(message),
    passportData.signature
  ) === oracleAddress;
}
```

### 3. ZK Proof for Threshold Verification
```circom
pragma circom 2.0.0;

template CreditThresholdProof() {
    signal input credit_score;
    signal input threshold;
    signal input secret;
    signal output is_valid;
    signal output nullifier;
    
    // Check if score >= threshold
    component check = GreaterEqThan(32);
    check.in[0] <== credit_score;
    check.in[1] <== threshold;
    is_valid <== check.out;
    
    // Generate nullifier
    component hash = Poseidon(2);
    hash.inputs[0] <== credit_score;
    hash.inputs[1] <== secret;
    nullifier <== hash.out;
}
```

**Usage:**
```javascript
// User proves score >= 750 without revealing actual score
const proof = await generateZKProof({
  credit_score: 850,
  threshold: 750,
  secret: userSecret
});

// Verifier checks proof
const isValid = await verifyZKProof(proof);
// Returns: true (without knowing actual score)
```

---

## 📡 Partner Integration

### SDK for Partners

**JavaScript/TypeScript:**
```typescript
import { AuraPassportSDK } from '@aura-protocol/sdk';

const aura = new AuraPassportSDK({
  apiKey: 'your_api_key',
  network: 'polygon'
});

// Get real-time passport data
const passport = await aura.getPassport(userAddress);

console.log(passport.credit_score); // 850
console.log(passport.risk_level);   // "low"
console.log(passport.verified);     // true

// Verify threshold without revealing score
const meetsThreshold = await aura.verifyThreshold(
  userAddress,
  750 // minimum score required
);

if (meetsThreshold) {
  // Approve loan
  await lendingContract.approve(userAddress, amount);
}
```

**Solidity Integration:**
```solidity
interface IAuraOracle {
    function verifyPassport(
        address user,
        uint256 minScore,
        bytes calldata proof
    ) external view returns (bool);
}

contract LendingProtocol {
    IAuraOracle public auraOracle;
    
    function requestLoan(
        uint256 amount,
        bytes calldata creditProof
    ) external {
        // Verify credit score >= 750
        require(
            auraOracle.verifyPassport(
                msg.sender,
                750,
                creditProof
            ),
            "Insufficient credit score"
        );
        
        // Approve loan
        _approveLoan(msg.sender, amount);
    }
}
```

**REST API:**
```bash
# Get passport data
curl https://api.aurapass.xyz/v1/passport/0x742d35.../realtime \
  -H "Authorization: Bearer YOUR_API_KEY"

# Verify threshold
curl -X POST https://api.aurapass.xyz/v1/passport/verify \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "address": "0x742d35...",
    "threshold": 750,
    "proof": "0xabc123..."
  }'
```

---

## 💡 Key Benefits

### 1. Always Fresh Data
- ✅ Real-time updates every 5 minutes
- ✅ Event-driven updates for critical changes
- ✅ No stale data
- ✅ Reflects current user behavior

### 2. Cost Efficient
- ✅ Minimal on-chain storage
- ✅ No frequent on-chain updates
- ✅ Off-chain computation
- ✅ Pay only for API calls

### 3. Scalable
- ✅ Add new data sources easily
- ✅ Horizontal scaling of oracle
- ✅ Caching layer for performance
- ✅ Rate limiting for abuse prevention

### 4. Privacy Preserving
- ✅ ZK proofs for threshold verification
- ✅ User controls data sources
- ✅ Selective disclosure
- ✅ No raw data exposure

### 5. Composable
- ✅ Standard API for integration
- ✅ Multiple SDK languages
- ✅ On-chain verification
- ✅ Cross-protocol compatibility

### 6. Trustless
- ✅ Cryptographic proofs
- ✅ Oracle signatures
- ✅ On-chain commitments
- ✅ Verifiable computation

---

## 🚀 Implementation Roadmap

### Phase 1: Oracle Service (Weeks 1-2)
- [ ] Data aggregation engine
- [ ] Score computation logic
- [ ] Signature mechanism
- [ ] Background update jobs
- [ ] Event listeners

### Phase 2: Smart Contracts (Week 3)
- [ ] PassportCommitment contract
- [ ] Oracle verification logic
- [ ] Update mechanism
- [ ] Access control
- [ ] Events & logs

### Phase 3: API Layer (Week 4)
- [ ] RESTful endpoints
- [ ] Authentication & authorization
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Monitoring & logging

### Phase 4: SDK & Documentation (Week 5)
- [ ] JavaScript/TypeScript SDK
- [ ] Solidity library
- [ ] API documentation
- [ ] Integration examples
- [ ] Testing suite

### Phase 5: Partner Integration (Week 6+)
- [ ] Partner onboarding
- [ ] Custom integrations
- [ ] Support & maintenance
- [ ] Performance optimization
- [ ] Feature requests

---

## 🤔 Discussion Points

### 1. Update Frequency
**Question:** Seberapa sering data di-update?

**Options:**
- Real-time (setiap transaksi)
- 1 menit
- 5 menit
- 1 jam
- Event-driven

**Trade-offs:**
- Frequency ↑ = Freshness ↑, Cost ↑
- Frequency ↓ = Cost ↓, Staleness ↑

---

### 2. Data Sources
**Question:** Sumber data apa saja yang mau diintegrasikan?

**Current:**
- GitHub
- Twitter
- Wallet activity
- DeFi protocols
- On-chain reputation

**Potential:**
- LinkedIn
- Discord
- Telegram
- NFT holdings
- DAO participation
- Gitcoin Passport
- Worldcoin
- Lens Protocol
- Farcaster

---

### 3. On-chain Updates
**Question:** Kapan perlu update commitment on-chain?

**Options:**
- Setiap update (expensive)
- Significant change (>5%)
- Periodic (daily/weekly)
- User-triggered
- Never (pure off-chain)

**Considerations:**
- Gas costs
- Data integrity
- Trust model
- Partner requirements

---

### 4. Pricing Model
**Question:** Gratis atau pay-per-query untuk mitra?

**Options:**
- Free tier (limited calls)
- Pay-per-query ($0.001/call)
- Subscription ($99/month)
- Revenue share (% of loan)
- Freemium model

**Considerations:**
- Infrastructure costs
- Market positioning
- Partner adoption
- Sustainability

---

### 5. Privacy Level
**Question:** Level privacy apa yang diinginkan user?

**Options:**
- Full transparency (all data visible)
- Selective disclosure (user chooses)
- ZK proofs only (no data revealed)
- Tiered privacy (basic/premium)

**Considerations:**
- User control
- Partner needs
- Regulatory compliance
- Technical complexity

---

## 📊 Technical Specifications

### System Requirements
- **Backend:** Node.js 18+, Python 3.10+
- **Database:** MongoDB, Redis (cache)
- **Blockchain:** Polygon (Amoy testnet → Mainnet)
- **Oracle:** Chainlink-compatible
- **API:** RESTful, GraphQL (optional)

### Performance Targets
- **API Response Time:** <200ms (p95)
- **Update Frequency:** 5 minutes
- **Uptime:** 99.9%
- **Throughput:** 1000 req/s
- **Data Freshness:** <5 minutes

### Security Standards
- **Encryption:** TLS 1.3
- **Authentication:** API keys, OAuth 2.0
- **Signatures:** ECDSA (secp256k1)
- **Proofs:** ZK-SNARKs (Groth16)
- **Audits:** Smart contract audits

---

## 📚 References

- [Chainlink Oracle Documentation](https://docs.chain.link/)
- [The Graph Protocol](https://thegraph.com/docs/)
- [ZK-SNARKs with Circom](https://docs.circom.io/)
- [EIP-712: Typed Data Signing](https://eips.ethereum.org/EIPS/eip-712)
- [Polygon Documentation](https://docs.polygon.technology/)

---

## 📝 Version History

- **V.1.1** (2025-11-21): Initial design document
- Dynamic passport concept
- Real-time oracle architecture
- API specification
- Discussion points

---

## 👥 Contributors

- Aura Protocol Team
- Community Feedback
- Partner Requirements

---

**Document Status:** Draft for Discussion
**Last Updated:** 2025-11-21
**Next Review:** After discussion of 5 key questions
