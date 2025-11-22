# Passport Data Flow - User Journey

## 🔄 Complete Flow: Multi-chain Wallet → Dynamic Passport → Real-time API

```
User Connect Wallet (EVM/Multi-chain) → Create Passport → Data Collectors → Scoring Engine → Storage (Hybrid) → API Layer → Partner Integration
```

---

## Step 1: User Connects Wallet (Multi-chain)

```javascript
// Frontend - Support multiple chains
const wallet = await connectWallet();
const addresses = {
  ethereum: wallet.address,
  polygon: wallet.address,
  bsc: wallet.address,
  arbitrum: wallet.address,
  optimism: wallet.address
};
```

**Output:** User wallet addresses across chains

---

## Step 2: User Creates Passport (Opt-in Data Sources)

```javascript
// User chooses data sources (opt-in)
const dataSources = [
  'github',      // Code contributions
  'twitter',     // Social reputation
  'wallet',      // On-chain activity
  'defi',        // Lending history
  'nft',         // NFT holdings
  'ens',         // ENS domain
  'gitcoin',     // Gitcoin Passport
  'lens'         // Lens Protocol
];

// User gives consent (GDPR compliant)
const consent = await requestConsent(dataSources);

// Create passport
const passport = await createPassport(addresses, dataSources);
```

**Output:** 
```json
{
  "passport_id": "PASS-ABC123",
  "tx_hash": "0xdef456...",
  "status": "created",
  "data_sources": ["github", "twitter", "wallet", "defi", "nft", "ens", "gitcoin", "lens"]
}
```

---

## Step 3: Data Collectors (Parallel Fetching)

```javascript
// Aura Oracle - Data Collectors
const collectors = {
  github: new GitHubCollector(),
  twitter: new TwitterCollector(),
  wallet: new WalletScanner(), // Alchemy API
  defi: new DeFiIndexer(),     // Aave, Uniswap, Compound
  nft: new NFTCollector(),
  ens: new ENSResolver(),
  gitcoin: new GitcoinPassport(),
  lens: new LensProtocol()
};

// Parallel data collection
const data = await Promise.all([
  collectors.github.fetch(addresses),
  collectors.twitter.fetch(addresses),
  collectors.wallet.scan(addresses),
  collectors.defi.index(addresses),
  collectors.nft.fetch(addresses),
  collectors.ens.resolve(addresses),
  collectors.gitcoin.getScore(addresses),
  collectors.lens.getProfile(addresses)
]);
```

**Output:**
```json
{
  "github": { "score": 85, "contributions": 1250, "repos": 45 },
  "twitter": { "score": 75, "followers": 5000, "engagement": 0.12 },
  "wallet": { "score": 90, "tx_count": 450, "volume_usd": 125500 },
  "defi": { "score": 95, "borrowed": 50000, "repayment_rate": 100 },
  "nft": { "score": 70, "holdings": 12, "floor_value": 5.2 },
  "ens": { "score": 80, "has_domain": true, "domain": "user.eth" },
  "gitcoin": { "score": 88, "passport_score": 25.5 },
  "lens": { "score": 65, "has_profile": true, "followers": 320 }
}
```

---

## Step 4: Scoring Engine (Real-time Computation)

```javascript
// Scoring Engine
class ScoringEngine {
  async compute(data) {
    // 1. Normalize data
    const normalized = this.normalize(data);
    
    // 2. Analyze risk patterns
    const patterns = this.analyzePatterns(normalized);
    
    // 3. Weighted aggregation
    const creditScore = (
      normalized.github * 0.15 +
      normalized.twitter * 0.10 +
      normalized.wallet * 0.25 +
      normalized.defi * 0.35 +
      normalized.onchain * 0.15
    ) * 10;
    
    // 4. Risk assessment
    const riskLevel = this.assessRisk(creditScore, patterns);
    
    return { creditScore, riskLevel, patterns };
  }
}

// Schedules:
// • Event-driven: Big transactions trigger immediate update
// • Batch: Recompute every 5 minutes
// • Partner Force Refresh: Rate-limited API endpoint
```

**Output:**
```json
{
  "credit_score": 850,
  "risk_level": "low",
  "patterns": {
    "consistent_repayment": true,
    "high_activity": true,
    "diversified_portfolio": true
  }
}
```

---

## Step 5: Storage (Hybrid Architecture)

```javascript
// Off-chain Storage (MongoDB/Redis)
await db.passports.insertOne({
  passport_id: "PASS-ABC123",
  owner: address,
  credit_score: 850,
  risk_level: "low",
  data_sources: data,
  last_updated: new Date(),
  created_at: new Date()
});

// Cache for fast access (Redis)
await redis.setex(
  `passport:${address}`,
  300, // 5 minutes TTL
  JSON.stringify({ score: 850, risk: "low" })
);

// On-chain Commitment (Daily)
// Merkle root of all scores updated every 24 hours
const merkleRoot = computeMerkleRoot(allPassports);
await passportContract.updateDailyCommitment(merkleRoot);
```

**Output:**
```json
{
  "passport_id": "PASS-ABC123",
  "off_chain": {
    "score": 850,
    "datapoints": {...},
    "last_updated": "<5 minutes"
  },
  "on_chain": {
    "daily_commitment": "0xabc123...",
    "merkle_root": "0xdef456...",
    "updated_every": "24 hours"
  }
}
```

---

## Step 6: Continuous Updates (Multi-trigger)

```javascript
// 1. Event-driven updates (Big transactions)
web3.eth.subscribe('logs', {
  address: userWallet,
  topics: ['Transfer', 'Borrow', 'Repay']
}).on('data', async (event) => {
  if (event.value > threshold) {
    await updatePassportImmediately(userAddress);
  }
});

// 2. Batch updates (Every 5 minutes)
setInterval(async () => {
  const activePassports = await db.passports.find({ isActive: true });
  
  for (const passport of activePassports) {
    const newData = await collectAllData(passport.owner);
    const newScore = await computeScore(newData);
    
    await db.passports.updateOne(
      { passport_id: passport.passport_id },
      { $set: { credit_score: newScore, last_updated: new Date() }}
    );
  }
}, 5 * 60 * 1000);

// 3. Partner force refresh (Rate-limited)
app.post('/api/refresh/:address', rateLimiter, async (req, res) => {
  await updatePassportImmediately(req.params.address);
  res.json({ updated: true });
});
```

**Output:** Score always fresh (max 5 min old, or instant on big events)

---

## Step 7: API Layer (Partner Integration)

```javascript
// GET /passport/{address} - Get real-time passport
const response = await fetch(
  'https://api.aurapass.xyz/v1/passport/0x742d35...',
  { headers: { 'Authorization': 'Bearer API_KEY' }}
);

// GET /refresh/{address} - Force refresh (Partner only, rate-limited)
const refresh = await fetch(
  'https://api.aurapass.xyz/v1/refresh/0x742d35...',
  { 
    method: 'POST',
    headers: { 'Authorization': 'Bearer API_KEY' }
  }
);
```

**Output:**
```json
{
  "passport_id": "PASS-ABC123",
  "owner": "0x742d35...",
  "credit_score": 850,
  "risk_level": "low",
  "verified": true,
  "computed_at": "2025-11-21T12:00:00Z",
  "timestamp": "2 seconds ago",
  "proof": {
    "commitment": "0xabc123...",
    "signature": "0xdef456...",
    "merkle_proof": ["0x111...", "0x222..."]
  },
  "optional_zk_proof": {
    "threshold_met": true,
    "nullifier": "0x999..."
  }
}
```

---

## Step 8: Partner Uses Data (Lending/Game/DeFi)

```javascript
// Lending protocol checks credit
if (passport.credit_score >= 750) {
  // Approve loan
  await lendingContract.approveLoan(
    passport.owner,
    loanAmount,
    passport.proof
  );
} else {
  // Reject or offer higher interest rate
  await lendingContract.rejectLoan(passport.owner);
}

// Optional: ZK validation (privacy-preserving)
const zkValid = await verifyZKProof(
  passport.optional_zk_proof,
  750 // threshold
);
```

**Output:** Loan approved ✅ or Rejected ❌

---

## 📊 Visual Flow

```
┌─────────────┐
│   User      │
│ Connect     │
│  Wallet     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Create    │
│  Passport   │
│ (Choose     │
│  Sources)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Aura Oracle                   │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ GitHub   │  │ Twitter  │   │
│  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐   │
│  │ Wallet   │  │  DeFi    │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  → Compute Score: 850           │
│  → Risk Level: Low              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Storage                       │
│                                 │
│  Off-chain (MongoDB)            │
│  ├─ Score: 850                  │
│  ├─ Data: {...}                 │
│  └─ Updated: Every 5 min        │
│                                 │
│  On-chain (Smart Contract)      │
│  ├─ Commitment: 0xabc...        │
│  └─ Updated: Every 24 hours     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   API Endpoint                  │
│                                 │
│  GET /passport/{address}        │
│  → Returns real-time score      │
│  → Max 5 min old                │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│  Partner    │
│  (Lending   │
│  Protocol)  │
│             │
│  Check      │
│  Score ≥750 │
│  → Approve  │
└─────────────┘
```

---

## ⏱️ Timeline

| Step | Time | Frequency |
|------|------|-----------|
| Connect Wallet | Instant | Once |
| Create Passport | ~30s | Once |
| Data Collection | ~5s | Every 5 min |
| Score Computation | ~500ms | Every 5 min |
| Store Off-chain | ~100ms | Every 5 min |
| Commit On-chain | ~30s | Every 24 hours |
| API Access | <200ms | On-demand |

---

## 🔐 Security at Each Step

**Step 1-2:** User signs with wallet (authentication)
**Step 3:** Secure API calls to data sources
**Step 4:** Server-side computation (no manipulation)
**Step 5:** Cryptographic commitment on-chain
**Step 6:** Background job (isolated)
**Step 7:** API key + rate limiting
**Step 8:** Proof verification on-chain

---

## 💾 Data Storage

**Off-chain (MongoDB):**
```json
{
  "passport_id": "PASS-ABC123",
  "owner": "0x742d35...",
  "credit_score": 850,
  "last_updated": "2025-11-21T12:00:00Z",
  "data_commitment": "0xabc123..."
}
```

**On-chain (Smart Contract):**
```solidity
struct Passport {
    bytes32 passportId;
    address owner;
    bytes32 commitment;
    uint256 lastUpdate;
}
```

---

## 🔄 Update Cycle

```
Create → Update (5 min) → Update (5 min) → ... → Commit (24h) → Repeat
```

**Every 5 minutes:**
- Fetch latest data
- Compute new score
- Update database

**Every 24 hours:**
- Generate commitment
- Update on-chain
- Emit event

---

## 📱 User Experience

**User sees:**
1. Connect wallet button
2. Choose data sources (checkboxes)
3. "Creating passport..." (loading)
4. "Passport created! Score: 850" ✅
5. Dashboard with real-time score

**Partner sees:**
```json
{
  "credit_score": 850,
  "risk_level": "low",
  "verified": true
}
```

---

## 🎯 Key Points

✅ **User owns data** - Can disconnect sources anytime
✅ **Always fresh** - Max 5 min old
✅ **Trustless** - Cryptographic proofs
✅ **Private** - User chooses privacy level
✅ **Fast** - API response <200ms
✅ **Scalable** - Off-chain computation
✅ **Multi-chain** - Works across 5 chains

---

**Flow Complete!** 🎉

From wallet connection to API access in ~30 seconds, then continuously updated every 5 minutes forever.


---

## 📊 Enhanced Visual Flow Diagram

```
┌───────────────────────────────┐
│             User              │
│  Connect Wallet (EVM/Multich) │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Create Passport        │
│  Choose Data Sources (opt-in) │
│   GitHub / Twitter / DeFi     │
│   NFT / ENS / Gitcoin / Lens  │
└───────────────┬───────────────┘
                │
                ▼
        ┌─────────────────┐
        │   Aura Oracle   │
        └───────┬─────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│             Data Collectors                │
│                                            │
│  ┌─────────────┐   ┌──────────────┐       │
│  │  GitHub API │   │ Twitter API  │       │
│  └─────────────┘   └──────────────┘       │
│                                            │
│  ┌─────────────┐   ┌──────────────┐       │
│  │ Wallet Scan │   │ DeFi Indexer │       │
│  │ (Alchemy)   │   │(Aave, Uni...)│       │
│  └─────────────┘   └──────────────┘       │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│             Scoring Engine                 │
│                                            │
│ → Normalize data                           │
│ → Analyze risk patterns                    │
│ → Compute Score (e.g., 850)                │
│ → Compute Risk (Low/Med/High)              │
│                                            │
│ Schedules:                                  │
│   • Event-driven (big transactions)         │
│   • Recompute every 5 min (batch)           │
│   • Partner Force Refresh (rate limited)    │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│                Storage                     │
│                                            │
│ Off-chain (MongoDB/Redis):                 │
│   • score: 850                             │
│   • datapoints: {...}                      │
│   • last_updated: <5 minutes               │
│                                            │
│ On-chain (Smart Contract):                 │
│   • daily commitment                       │
│   • merkle root of all scores              │
│   • updated every 24 hours                 │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│               API Layer                    │
│                                            │
│ GET /passport/{address}                    │
│   → Returns: score, risk, timestamp        │
│   → Optional: ZK-proof threshold check     │
│                                            │
│ GET /refresh/{address} (Partner Only)      │
│   → Forces score recalculation             │
│   → Rate-limited (anti abuse)              │
└───────────────┬────────────────────────────┘
                │
                ▼
┌───────────────────────────────┐
│            Partner             │
│   Lending / Game / DeFi App   │
│                               │
│ Check: Score ≥ 750 ?           │
│ → Approve / Reject            │
│                               │
│ (Optional ZK validation)      │
└───────────────────────────────┘
```

---

## 🔄 Update Triggers

### 1. Event-driven (Immediate)
- Large transactions (>$10K)
- New DeFi position opened
- Loan repayment completed
- NFT purchase/sale

### 2. Batch Updates (Every 5 minutes)
- All active passports
- Background job
- Parallel processing

### 3. Partner Force Refresh (On-demand)
- Rate-limited: 10 calls/hour
- Premium partners only
- Immediate recalculation

---

## 🎯 Key Improvements

✅ **Multi-chain Support** - ETH, Polygon, BSC, Arbitrum, Optimism
✅ **8 Data Sources** - GitHub, Twitter, Wallet, DeFi, NFT, ENS, Gitcoin, Lens
✅ **3 Update Triggers** - Event-driven, Batch, Force Refresh
✅ **Hybrid Storage** - Off-chain (fast) + On-chain (trustless)
✅ **Partner API** - Force refresh capability
✅ **ZK Privacy** - Optional threshold proofs

---

**Updated:** 2025-11-21
**Version:** 2.0 (Enhanced Multi-chain Architecture)
