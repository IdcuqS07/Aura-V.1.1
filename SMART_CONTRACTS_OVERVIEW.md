# 🔗 Aura Protocol - Smart Contracts Overview

## 📋 Deployed Contracts (Polygon Amoy Testnet)

### 1. SimpleZKBadge (ZK-ID Badge NFT)
**Address**: `0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678`  
**Explorer**: https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678

**Features:**
- ✅ ERC-721 Soulbound NFT (non-transferable)
- ✅ ZK Proof verification
- ✅ Badge types: uniqueness, identity, reputation
- ✅ Authorized minter system
- ✅ User badge tracking

**Key Functions:**
```solidity
// Issue badge (authorized minters only)
function issueBadge(address recipient, string badgeType, string zkProofHash) 
    returns (uint256)

// Get user's badges
function getUserBadges(address user) 
    returns (uint256[] memory)

// Authorize minter
function authorizeMinter(address minter)

// Total badges issued
function totalSupply() returns (uint256)
```

**Soulbound Features:**
- ❌ Cannot transfer
- ❌ Cannot approve
- ❌ Cannot sell
- ✅ Permanent identity proof

---

### 2. CreditPassport (Credit Score NFT)
**Address**: `0x1112373c9954B9bbFd91eb21175699b609A1b551`  
**Explorer**: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551

**Features:**
- ✅ ERC-721 Soulbound NFT
- ✅ Dynamic credit score (0-1000)
- ✅ User can mint their own passport (permissionless)
- ✅ Score calculation algorithm
- ✅ On-chain credit history

**Key Functions:**
```solidity
// User mints their own passport
function mintPassport(uint256 pohScore, uint256 badgeCount) 
    returns (uint256)

// Protocol issues passport (authorized)
function issuePassport(address recipient, uint256 pohScore, uint256 badgeCount) 
    returns (uint256)

// Update credit score
function updateScore(address user, uint256 pohScore, uint256 badgeCount, uint256 onchainActivity)

// Get passport data
function getPassport(address user) 
    returns (Passport memory)

// Calculate credit score
function calculateCreditScore(uint256 pohScore, uint256 badgeCount, uint256 onchainActivity) 
    returns (uint256)
```

**Credit Score Formula:**
```
Credit Score = (PoH Score × 4) + (Badge Count × 50) + Bonus + On-chain Activity

Where:
- PoH Score: 0-100 (Proof of Humanity score)
- Badge Count: Number of badges owned
- Bonus: +100 if score > 700
- On-chain Activity: Transaction history score
- Max Score: 1000
```

**Passport Structure:**
```solidity
struct Passport {
    uint256 id;              // Token ID
    address owner;           // Passport owner
    uint256 creditScore;     // 0-1000
    uint256 pohScore;        // Proof of Humanity score
    uint256 badgeCount;      // Number of badges
    uint256 onchainActivity; // On-chain activity score
    uint256 issuedAt;        // Creation timestamp
    uint256 lastUpdated;     // Last update timestamp
}
```

---

### 3. ProofRegistry (ZK Proof Verification)
**Address**: `0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B`  
**Explorer**: https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B

**Features:**
- ✅ On-chain proof storage
- ✅ Proof verification
- ✅ User proof tracking
- ✅ Proof revocation

**Key Functions:**
```solidity
// Register new proof
function registerProof(string proofHash, address user)

// Verify proof validity
function verifyProof(string proofHash) 
    returns (bool)

// Revoke proof
function revokeProof(string proofHash)

// Get user's proofs
function getUserProofs(address user) 
    returns (string[] memory)

// Get proof details
function getProof(string proofHash) 
    returns (Proof memory)
```

**Proof Structure:**
```solidity
struct Proof {
    string proofHash;    // ZK proof hash
    address user;        // Proof owner
    uint256 timestamp;   // Registration time
    bool isValid;        // Validity status
}
```

---

## 🆕 SimpleZKBadgeV2 (Latest Version)
**Address**: `0x3d586E681b12B07825F17Ce19B28e1F576a1aF89`  
**Explorer**: https://amoy.polygonscan.com/address/0x3d586E681b12B07825F17Ce19B28e1F576a1aF89

**New Features:**
- ✅ **Permissionless minting** - Anyone can mint
- ✅ **Cooldown period** - 1 hour between mints
- ✅ **One badge per type** - Prevent spam
- ✅ **Soulbound** - Non-transferable

---

## 📊 Contract Statistics

### Network Information
- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com

### Deployer
- **Address**: `0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974`

### Deployment Dates
- SimpleZKBadge: January 2025
- CreditPassport: January 2025
- ProofRegistry: January 2025
- SimpleZKBadgeV2: November 7, 2025

---

## 🔧 Integration Guide

### 1. Connect to Contracts

**Using Web3.js:**
```javascript
const Web3 = require('web3');
const web3 = new Web3('https://rpc-amoy.polygon.technology');

// SimpleZKBadge
const badgeContract = new web3.eth.Contract(
    BADGE_ABI,
    '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678'
);

// CreditPassport
const passportContract = new web3.eth.Contract(
    PASSPORT_ABI,
    '0x1112373c9954B9bbFd91eb21175699b609A1b551'
);
```

**Using Ethers.js:**
```javascript
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider(
    'https://rpc-amoy.polygon.technology'
);

const badgeContract = new ethers.Contract(
    '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678',
    BADGE_ABI,
    provider
);
```

### 2. Read User Data

```javascript
// Get user badges
const badges = await badgeContract.methods.getUserBadges(userAddress).call();

// Get user passport
const passport = await passportContract.methods.getPassport(userAddress).call();
console.log('Credit Score:', passport.creditScore);

// Verify proof
const isValid = await proofRegistry.methods.verifyProof(proofHash).call();
```

### 3. Mint Passport (User)

```javascript
// User mints their own passport
const tx = await passportContract.methods.mintPassport(
    pohScore,      // 0-100
    badgeCount     // Number of badges
).send({ from: userAddress });

console.log('Passport minted:', tx.transactionHash);
```

---

## 🎯 Use Cases

### 1. DeFi Lending
```javascript
// Check credit score before lending
const passport = await passportContract.methods.getPassport(borrower).call();

if (passport.creditScore >= 700) {
    // Approve loan with better rate
    approveWithRate(0.05); // 5% APR
} else if (passport.creditScore >= 500) {
    // Approve with standard rate
    approveWithRate(0.10); // 10% APR
} else {
    // Reject or require collateral
    requireCollateral();
}
```

### 2. Identity Verification
```javascript
// Check if user has ZK-ID badge
const badges = await badgeContract.methods.getUserBadges(user).call();
const hasIdentityBadge = badges.length > 0;

if (hasIdentityBadge) {
    // Grant access to premium features
    grantPremiumAccess();
}
```

### 3. Reputation System
```javascript
// Calculate reputation based on passport
const passport = await passportContract.methods.getPassport(user).call();
const reputation = {
    score: passport.creditScore,
    grade: getGrade(passport.creditScore),
    badges: passport.badgeCount,
    trustLevel: getTrustLevel(passport.creditScore)
};
```

---

## 🔐 Security Features

### Soulbound (Non-transferable)
- ✅ Prevents badge/passport trading
- ✅ Ensures identity integrity
- ✅ Cannot be sold or transferred

### Access Control
- ✅ Owner-only functions
- ✅ Authorized minter system
- ✅ Proof verification

### On-chain Verification
- ✅ All data stored on-chain
- ✅ Transparent and auditable
- ✅ Immutable proof registry

---

## 📝 Contract Files

### Main Contracts
1. `contracts/SimpleZKBadge.sol` - ZK-ID Badge NFT
2. `contracts/CreditPassport.sol` - Credit Passport NFT
3. `contracts/ProofRegistry.sol` - Proof verification
4. `contracts/SimpleZKBadgeV2.sol` - Badge V2 (permissionless)

### Deployment Scripts
- `scripts/deploy.js` - Deploy all contracts
- `scripts/deploy-credit-passport.js` - Deploy passport
- `scripts/deploy-badge-v2.js` - Deploy badge V2
- `scripts/authorize-user.js` - Authorize minters

### Test Files
- `test/SimpleZKBadge.test.js` - Badge contract tests

---

## 🚀 Next Steps

### For Developers
1. Read contract ABIs from `artifacts/contracts/`
2. Use deployment addresses from `deployment.json`
3. Test on Polygon Amoy testnet
4. Integrate with frontend

### For Users
1. Get Amoy testnet MATIC from faucet
2. Connect wallet to Polygon Amoy
3. Mint your Credit Passport
4. Earn badges through verification

---

## 📚 Resources

- **Polygon Amoy Faucet**: https://faucet.polygon.technology/
- **Polygon Docs**: https://docs.polygon.technology/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Hardhat**: https://hardhat.org/

---

**All contracts are deployed and verified on Polygon Amoy Testnet** ✅
