# Passport Data Flow - User Journey

## 🔄 Complete Flow: Wallet → Passport → API

```
User Connect Wallet → Create Passport → Data Collection → Score Computation → API Access
```

---

## Step 1: User Connects Wallet

```javascript
// Frontend
const address = await connectWallet(); // "0x742d35..."
```

**Output:** User wallet address

---

## Step 2: User Creates Passport

```javascript
// User chooses data sources
const dataSources = [
  'github',
  'twitter', 
  'wallet',
  'defi'
];

// User gives consent
const consent = await requestConsent(dataSources);

// Create passport
const passport = await createPassport(address, dataSources);
```

**Output:** 
```json
{
  "passport_id": "PASS-ABC123",
  "tx_hash": "0xdef456...",
  "status": "created"
}
```

---

## Step 3: Data Collection (Background)

```javascript
// Aura Oracle collects data from all sources
const data = {
  github: await fetchGithub(address),      // contributions, repos
  twitter: await fetchTwitter(address),    // followers, engagement
  wallet: await fetchWallet(address),      // txs, volume, age
  defi: await fetchDeFi(address)          // borrows, repays
};
```

**Output:**
```json
{
  "github": { "score": 85, "contributions": 1250 },
  "twitter": { "score": 75, "followers": 5000 },
  "wallet": { "score": 90, "tx_count": 450 },
  "defi": { "score": 95, "borrowed": 50000 }
}
```

---

## Step 4: Score Computation

```javascript
// Weighted aggregation
const creditScore = (
  data.github.score * 0.15 +
  data.twitter.score * 0.10 +
  data.wallet.score * 0.25 +
  data.defi.score * 0.35 +
  data.onchain.score * 0.15
) * 10;

// Risk assessment
const riskLevel = creditScore >= 750 ? 'low' : 
                  creditScore >= 600 ? 'medium' : 'high';
```

**Output:**
```json
{
  "credit_score": 850,
  "risk_level": "low"
}
```

---

## Step 5: Store & Commit

```javascript
// Store in database (off-chain)
await db.passports.insertOne({
  passport_id: "PASS-ABC123",
  owner: address,
  credit_score: 850,
  data_sources: data,
  created_at: new Date()
});

// Commit to blockchain (on-chain)
const commitment = keccak256(data);
await passportContract.createPassport(address, commitment);
```

**Output:**
```json
{
  "passport_id": "PASS-ABC123",
  "commitment": "0xabc123...",
  "tx_hash": "0xdef456..."
}
```

---

## Step 6: Continuous Updates (Every 5 min)

```javascript
// Background job
setInterval(async () => {
  // Re-fetch data
  const newData = await collectAllData(address);
  
  // Re-compute score
  const newScore = await computeScore(newData);
  
  // Update database
  await db.passports.updateOne(
    { passport_id: "PASS-ABC123" },
    { $set: { credit_score: newScore, last_updated: new Date() }}
  );
}, 5 * 60 * 1000);
```

**Output:** Score always fresh (max 5 min old)

---

## Step 7: Partner Accesses API

```javascript
// Partner calls API
const response = await fetch(
  'https://api.aurapass.xyz/v1/passport/0x742d35.../realtime',
  { headers: { 'Authorization': 'Bearer API_KEY' }}
);

const passport = await response.json();
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
  "valid_until": "2025-11-21T12:05:00Z",
  "proof": {
    "commitment": "0xabc123...",
    "signature": "0xdef456..."
  }
}
```

---

## Step 8: Partner Uses Data

```javascript
// Lending protocol checks credit
if (passport.credit_score >= 750) {
  // Approve loan
  await lendingContract.approveLoan(
    passport.owner,
    loanAmount,
    passport.proof
  );
}
```

**Output:** Loan approved ✅

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
