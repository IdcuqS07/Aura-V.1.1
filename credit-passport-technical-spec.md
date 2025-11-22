# Credit Passport Technical Specification V.1.1

## 📋 Design Decisions (Finalized)

### 1. Update Frequency ✅
**Decision:** Hybrid Model
- **Off-chain recalculation:** Every 5 minutes
- **On-chain commitment:** Every 24 hours
- **Event-driven:** Large transactions (>$1000)

**Implementation:**
```javascript
// Background job - every 5 minutes
setInterval(async () => {
  await recalculateAllPassports();
}, 5 * 60 * 1000);

// On-chain commit - every 24 hours
setInterval(async () => {
  await commitToBlockchain();
}, 24 * 60 * 60 * 1000);

// Event-driven - large transactions
blockchain.on('Transfer', async (event) => {
  if (event.value > 1000) {
    await immediateRecalculate(event.from);
  }
});
```

---

### 2. Data Sources ✅
**Priority List:**

**Tier 1 (Must Have):**
- ✅ GitHub activity
- ✅ Twitter/X engagement
- ✅ Wallet transactions
- ✅ DeFi protocols (Aave, Compound, Uniswap)

**Tier 2 (High Priority):**
- ✅ Gitcoin Passport score
- ✅ ENS domains
- ✅ NFT holdings
- ✅ DAO participation

**Tier 3 (Nice to Have):**
- Worldcoin verification
- Lens Protocol
- Farcaster
- Discord/Telegram

**All sources are OPTIONAL** - User chooses which to connect

---

### 3. On-chain Updates ✅
**Decision:** Time-based (24 hours)

**Logic:**
```javascript
async function shouldCommitOnChain(passport) {
  const lastCommit = passport.last_onchain_commit;
  const now = Date.now();
  const hoursSinceCommit = (now - lastCommit) / (1000 * 60 * 60);
  
  // Commit every 24 hours
  return hoursSinceCommit >= 24;
}

async function commitToBlockchain() {
  const passports = await db.passports.find({ isActive: true });
  
  for (const passport of passports) {
    if (await shouldCommitOnChain(passport)) {
      const commitment = generateCommitment(passport);
      
      await passportContract.updateCommitment(
        passport.passport_id,
        commitment,
        passport.credit_score
      );
      
      await db.passports.updateOne(
        { passport_id: passport.passport_id },
        { $set: { last_onchain_commit: Date.now() } }
      );
    }
  }
}
```

**Gas Optimization:**
- Batch commits (multiple passports in 1 tx)
- Use L2 (Polygon, Arbitrum, Optimism)
- Commit only hash, not full data

---

### 4. Pricing Model ✅
**Decision:** Freemium + Revenue Share

**Tier Structure:**

**Free Tier:**
- 1,000 API calls/month
- Basic verification only
- Public data sources only
- Community support

**Pro Tier ($99/month):**
- 50,000 API calls/month
- Detailed breakdown
- All data sources
- Email support
- Webhook notifications

**Enterprise Tier (Custom):**
- Unlimited API calls
- Custom integrations
- Dedicated support
- SLA guarantee
- White-label option

**Revenue Share (for Lending Protocols):**
- Free API access
- 0.3% of loan value
- Win-win model
- Minimum $1,000/month

**Implementation:**
```javascript
const PRICING = {
  free: {
    calls_per_month: 1000,
    price: 0,
    features: ['basic_verification']
  },
  pro: {
    calls_per_month: 50000,
    price: 99,
    features: ['detailed_breakdown', 'webhooks', 'all_sources']
  },
  enterprise: {
    calls_per_month: Infinity,
    price: 'custom',
    features: ['unlimited', 'custom_integration', 'sla']
  },
  revenue_share: {
    calls_per_month: Infinity,
    price: 0,
    revenue_share: 0.003, // 0.3%
    minimum_monthly: 1000
  }
};
```

---

### 5. Privacy Level ✅
**Decision:** Tiered Privacy (User Choice)

**Privacy Levels:**

**Level 1: Public (Default)**
```json
{
  "credit_score": 850,
  "risk_level": "low",
  "verified": true
}
```

**Level 2: Detailed (Opt-in)**
```json
{
  "credit_score": 850,
  "breakdown": {
    "github": 85,
    "wallet": 90,
    "defi": 95
  },
  "risk_factors": [...]
}
```

**Level 3: ZK Proof (Maximum Privacy)**
```json
{
  "proof": "0xabc123...",
  "threshold_met": true,
  "nullifier": "0xdef456..."
}
```

**User Control:**
```javascript
// User sets privacy level
await passport.setPrivacyLevel('zk_proof');

// Partner requests data
const data = await aura.getPassport(address, {
  requester: partnerAddress,
  purpose: 'loan_approval'
});

// Returns data based on user's privacy setting
```

---

## 🌐 Multi-chain Architecture

### Supported Chains ✅
1. **Ethereum Mainnet**
2. **Binance Smart Chain (BSC)**
3. **Polygon**
4. **Arbitrum**
5. **Optimism**

### Cross-chain Score Aggregation

**Data Collection:**
```javascript
async function aggregateCrossChainData(userAddress) {
  // Fetch data from all chains in parallel
  const [ethData, bscData, polygonData, arbData, opData] = 
    await Promise.all([
      fetchChainData('ethereum', userAddress),
      fetchChainData('bsc', userAddress),
      fetchChainData('polygon', userAddress),
      fetchChainData('arbitrum', userAddress),
      fetchChainData('optimism', userAddress)
    ]);
  
  return {
    ethereum: ethData,
    bsc: bscData,
    polygon: polygonData,
    arbitrum: arbData,
    optimism: opData
  };
}
```

**Score Computation:**
```javascript
function computeCrossChainScore(chainData) {
  const scores = {};
  
  // Compute score per chain
  for (const [chain, data] of Object.entries(chainData)) {
    scores[chain] = {
      wallet_score: computeWalletScore(data.transactions),
      defi_score: computeDeFiScore(data.defi_activity),
      nft_score: computeNFTScore(data.nft_holdings)
    };
  }
  
  // Weighted aggregation
  const totalScore = Object.entries(scores).reduce((acc, [chain, score]) => {
    const weight = CHAIN_WEIGHTS[chain]; // ETH: 0.4, others: 0.15
    return acc + (
      score.wallet_score * weight * 0.3 +
      score.defi_score * weight * 0.5 +
      score.nft_score * weight * 0.2
    );
  }, 0);
  
  return {
    total_score: totalScore * 1000, // Scale to 0-1000
    chain_breakdown: scores,
    chains_active: Object.keys(scores).length
  };
}

const CHAIN_WEIGHTS = {
  ethereum: 0.40,  // Highest weight
  polygon: 0.15,
  bsc: 0.15,
  arbitrum: 0.15,
  optimism: 0.15
};
```

**Cross-chain Passport Contract:**
```solidity
// Deployed on each chain
contract CrossChainPassport {
    struct Passport {
        bytes32 passportId;
        address owner;
        bytes32 commitment;
        uint256 lastUpdate;
        mapping(string => bytes32) chainCommitments; // chain => commitment
    }
    
    mapping(address => Passport) public passports;
    
    // Update commitment for specific chain
    function updateChainCommitment(
        string memory chain,
        bytes32 commitment
    ) external {
        require(passports[msg.sender].owner == msg.sender, "Not owner");
        passports[msg.sender].chainCommitments[chain] = commitment;
        passports[msg.sender].lastUpdate = block.timestamp;
        
        emit ChainCommitmentUpdated(msg.sender, chain, commitment);
    }
    
    // Get cross-chain commitment
    function getCrossChainCommitment(
        address user,
        string[] memory chains
    ) external view returns (bytes32[] memory) {
        bytes32[] memory commitments = new bytes32[](chains.length);
        for (uint i = 0; i < chains.length; i++) {
            commitments[i] = passports[user].chainCommitments[chains[i]];
        }
        return commitments;
    }
}
```

---

## 🔄 Passport Lifecycle

### 1. Creation (Always Active)
```javascript
async function createPassport(userAddress, dataSources) {
  // 1. Collect initial data
  const initialData = await collectData(userAddress, dataSources);
  
  // 2. Compute initial score
  const initialScore = await computeScore(initialData);
  
  // 3. Generate commitment
  const commitment = generateCommitment(initialData);
  
  // 4. Deploy on-chain
  const tx = await passportContract.createPassport(
    userAddress,
    commitment
  );
  
  // 5. Store in database
  await db.passports.insertOne({
    passport_id: generatePassportId(userAddress),
    owner: userAddress,
    credit_score: initialScore,
    data_sources: dataSources,
    created_at: new Date(),
    last_updated: new Date(),
    last_onchain_commit: new Date(),
    is_active: true,
    never_expires: true
  });
  
  return {
    passport_id: generatePassportId(userAddress),
    tx_hash: tx.hash,
    initial_score: initialScore
  };
}
```

### 2. Continuous Updates (Every 5 minutes)
```javascript
async function continuousUpdate() {
  const activePassports = await db.passports.find({ 
    is_active: true 
  });
  
  for (const passport of activePassports) {
    // Fetch latest data
    const latestData = await collectData(
      passport.owner,
      passport.data_sources
    );
    
    // Compute new score
    const newScore = await computeScore(latestData);
    
    // Update database
    await db.passports.updateOne(
      { passport_id: passport.passport_id },
      {
        $set: {
          credit_score: newScore,
          last_updated: new Date(),
          data_snapshot: latestData
        },
        $push: {
          score_history: {
            score: newScore,
            timestamp: new Date()
          }
        }
      }
    );
  }
}

// Run every 5 minutes
setInterval(continuousUpdate, 5 * 60 * 1000);
```

### 3. On-chain Commit (Every 24 hours)
```javascript
async function dailyOnChainCommit() {
  const passports = await db.passports.find({
    is_active: true,
    last_onchain_commit: {
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });
  
  // Batch commits for gas efficiency
  const batch = [];
  for (const passport of passports) {
    const commitment = generateCommitment(passport.data_snapshot);
    batch.push({
      passport_id: passport.passport_id,
      commitment: commitment,
      score: passport.credit_score
    });
  }
  
  // Submit batch transaction
  await passportContract.batchUpdateCommitments(batch);
  
  // Update database
  await db.passports.updateMany(
    { passport_id: { $in: batch.map(b => b.passport_id) } },
    { $set: { last_onchain_commit: new Date() } }
  );
}

// Run every 24 hours
setInterval(dailyOnChainCommit, 24 * 60 * 60 * 1000);
```

### 4. No Expiry
```javascript
// Passport never expires
// Always active unless user explicitly deactivates

async function deactivatePassport(passportId, userAddress) {
  // User can deactivate (for privacy/GDPR)
  await db.passports.updateOne(
    { passport_id: passportId, owner: userAddress },
    { $set: { is_active: false, deactivated_at: new Date() } }
  );
  
  // Mark on-chain as inactive
  await passportContract.deactivate(passportId);
}

async function reactivatePassport(passportId, userAddress) {
  // User can reactivate anytime
  await db.passports.updateOne(
    { passport_id: passportId, owner: userAddress },
    { $set: { is_active: true, reactivated_at: new Date() } }
  );
  
  await passportContract.activate(passportId);
}
```

---

## 🛡️ Dispute Mechanism

### User Dispute Flow

**1. Submit Dispute:**
```javascript
async function submitDispute(passportId, reason, evidence) {
  const dispute = {
    dispute_id: generateDisputeId(),
    passport_id: passportId,
    user: passport.owner,
    reason: reason,
    evidence: evidence, // URLs, screenshots, proofs
    status: 'pending',
    submitted_at: new Date()
  };
  
  await db.disputes.insertOne(dispute);
  
  // Notify admin
  await notifyAdmin(dispute);
  
  return dispute.dispute_id;
}
```

**2. Review Process:**
```javascript
async function reviewDispute(disputeId) {
  const dispute = await db.disputes.findOne({ dispute_id: disputeId });
  
  // AI-assisted review
  const aiReview = await aiReviewDispute(dispute);
  
  if (aiReview.confidence > 0.9) {
    // Auto-approve if AI is confident
    return await approveDispute(disputeId, aiReview);
  } else {
    // Manual review required
    return await escalateToHuman(disputeId);
  }
}
```

**3. Resolution:**
```javascript
async function resolveDispute(disputeId, decision, newScore) {
  await db.disputes.updateOne(
    { dispute_id: disputeId },
    {
      $set: {
        status: decision, // 'approved' or 'rejected'
        resolved_at: new Date(),
        new_score: newScore
      }
    }
  );
  
  if (decision === 'approved') {
    // Update passport score
    await db.passports.updateOne(
      { passport_id: dispute.passport_id },
      {
        $set: {
          credit_score: newScore,
          last_updated: new Date()
        },
        $push: {
          dispute_history: {
            dispute_id: disputeId,
            old_score: dispute.old_score,
            new_score: newScore,
            resolved_at: new Date()
          }
        }
      }
    );
    
    // Notify user
    await notifyUser(dispute.user, 'Dispute approved');
  }
}
```

**Dispute Reasons:**
- Incorrect data source
- Outdated information
- Technical error
- Score calculation error
- Missing activity

---

## 📊 Data Ownership & GDPR Compliance

### Data Ownership Model

**User Owns:**
- ✅ Raw data (GitHub, Twitter, wallet activity)
- ✅ Right to access
- ✅ Right to delete
- ✅ Right to export
- ✅ Right to dispute

**Aura Owns:**
- ✅ Score algorithm
- ✅ Computation logic
- ✅ Oracle infrastructure
- ✅ API endpoints

**Partners:**
- ❌ Do NOT own data
- ✅ Can READ via API (with user consent)
- ❌ Cannot store raw data
- ✅ Can cache scores (24h max)

### GDPR Compliance

**1. Opt-in (Explicit Consent):**
```javascript
async function createPassportWithConsent(userAddress, dataSources) {
  // User must explicitly consent
  const consent = await requestConsent(userAddress, {
    data_sources: dataSources,
    purpose: 'credit_scoring',
    retention: 'indefinite',
    sharing: 'partners_via_api'
  });
  
  if (!consent.accepted) {
    throw new Error('User consent required');
  }
  
  return await createPassport(userAddress, dataSources);
}
```

**2. Right to Delete:**
```javascript
async function deleteUserData(userAddress) {
  // 1. Delete from database
  await db.passports.deleteOne({ owner: userAddress });
  await db.disputes.deleteMany({ user: userAddress });
  await db.score_history.deleteMany({ user: userAddress });
  
  // 2. Mark on-chain as deleted (cannot delete blockchain data)
  await passportContract.markAsDeleted(userAddress);
  
  // 3. Notify partners to delete cached data
  await notifyPartnersToDelete(userAddress);
  
  // 4. Log deletion (for compliance)
  await db.deletion_log.insertOne({
    user: userAddress,
    deleted_at: new Date(),
    reason: 'user_request'
  });
}
```

**3. Data Minimization:**
```javascript
// Only store what's necessary
const dataToStore = {
  // Store
  passport_id: '...',
  owner: '0x...',
  credit_score: 850,
  last_updated: Date,
  
  // Do NOT store
  // github_username: 'user123', ❌
  // twitter_handle: '@user', ❌
  // wallet_balance: 125000, ❌
  
  // Only store hashes
  data_commitment: keccak256(rawData),
  source_hashes: {
    github: keccak256(githubData),
    twitter: keccak256(twitterData)
  }
};
```

**4. Data Retention:**
```javascript
const RETENTION_POLICY = {
  // Active passport: indefinite
  active_passport: Infinity,
  
  // Inactive passport: 90 days
  inactive_passport: 90 * 24 * 60 * 60 * 1000,
  
  // Score history: 1 year
  score_history: 365 * 24 * 60 * 60 * 1000,
  
  // Dispute records: 2 years
  disputes: 2 * 365 * 24 * 60 * 60 * 1000,
  
  // Raw data: NEVER stored
  raw_data: 0
};

// Cleanup job
async function cleanupOldData() {
  const now = Date.now();
  
  // Delete inactive passports
  await db.passports.deleteMany({
    is_active: false,
    deactivated_at: {
      $lt: new Date(now - RETENTION_POLICY.inactive_passport)
    }
  });
  
  // Delete old score history
  await db.score_history.deleteMany({
    timestamp: {
      $lt: new Date(now - RETENTION_POLICY.score_history)
    }
  });
}
```

**5. Right to Export:**
```javascript
async function exportUserData(userAddress) {
  const passport = await db.passports.findOne({ owner: userAddress });
  const history = await db.score_history.find({ user: userAddress });
  const disputes = await db.disputes.find({ user: userAddress });
  
  return {
    passport: passport,
    score_history: history,
    disputes: disputes,
    exported_at: new Date(),
    format: 'JSON'
  };
}
```

---

## 🔐 Security Measures

### 1. Data Encryption
- **In Transit:** TLS 1.3
- **At Rest:** AES-256
- **Keys:** AWS KMS / HashiCorp Vault

### 2. Access Control
- **API Keys:** Rate limited
- **OAuth 2.0:** For user authentication
- **Role-based:** Admin, User, Partner

### 3. Audit Logging
```javascript
// Log all access
await db.audit_log.insertOne({
  action: 'passport_accessed',
  user: userAddress,
  partner: partnerAddress,
  timestamp: new Date(),
  ip: req.ip,
  user_agent: req.headers['user-agent']
});
```

---

## 📈 Performance Targets

### Latency
- **API Response:** <200ms (p95)
- **Score Computation:** <500ms
- **On-chain Commit:** <30s

### Throughput
- **API Requests:** 10,000 req/s
- **Concurrent Users:** 100,000
- **Passports:** 1,000,000+

### Availability
- **Uptime:** 99.9%
- **RTO:** <1 hour
- **RPO:** <5 minutes

---

## 🚀 Implementation Timeline

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Multi-chain data aggregation
- [ ] Score computation engine
- [ ] Database schema
- [ ] Background jobs

### Phase 2: Smart Contracts (Week 3)
- [ ] CrossChainPassport contract
- [ ] Batch commit mechanism
- [ ] Deploy to all chains

### Phase 3: API & Privacy (Week 4)
- [ ] RESTful API
- [ ] Privacy levels
- [ ] ZK proof integration
- [ ] Rate limiting

### Phase 4: Dispute & GDPR (Week 5)
- [ ] Dispute mechanism
- [ ] GDPR compliance
- [ ] Data deletion
- [ ] Export functionality

### Phase 5: Testing & Launch (Week 6)
- [ ] Integration testing
- [ ] Security audit
- [ ] Partner onboarding
- [ ] Production launch

---

## ✅ Summary of Decisions

| Feature | Decision |
|---------|----------|
| **Update Frequency** | 5 minutes (off-chain), 24 hours (on-chain) |
| **Data Sources** | GitHub, Twitter, Wallet, DeFi, Gitcoin, ENS, NFT, DAO |
| **On-chain Updates** | Every 24 hours (time-based) |
| **Pricing** | Freemium + Revenue Share |
| **Privacy** | Tiered (Public, Detailed, ZK Proof) |
| **Multi-chain** | ETH, BSC, Polygon, Arbitrum, Optimism |
| **Passport Validity** | Always active, no expiry |
| **Dispute** | User submit → AI/Manual review → Resolution |
| **Data Ownership** | User owns data, Aura owns algorithm |
| **GDPR** | Opt-in, Right to delete, Data minimization |

---

**Status:** Ready for Implementation
**Next Step:** Start Phase 1 Development
**Document Version:** 1.1
**Last Updated:** 2025-11-21
