# 🔗 Smart Contracts Quick Reference

## 📍 Deployed Addresses (Polygon Amoy)

### Main Contracts
```
SimpleZKBadge:    0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
CreditPassport:   0x1112373c9954B9bbFd91eb21175699b609A1b551
ProofRegistry:    0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B
```

### V2 Contracts
```
SimpleZKBadgeV2:  0x3d586E681b12B07825F17Ce19B28e1F576a1aF89
```

## 🔍 Explorer Links

- **SimpleZKBadge**: https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
- **CreditPassport**: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551
- **ProofRegistry**: https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B

## 📊 Contract Features

### SimpleZKBadge (ZK-ID Badge)
- Type: ERC-721 Soulbound NFT
- Features: Non-transferable, ZK proof verification
- Badge Types: uniqueness, identity, reputation
- Minting: Authorized minters only

### CreditPassport (Credit Score)
- Type: ERC-721 Soulbound NFT
- Score Range: 0-1000
- Minting: User can mint (permissionless)
- Updates: Dynamic score updates
- Formula: `(PoH × 4) + (Badges × 50) + Bonus + Activity`

### ProofRegistry (Verification)
- Type: Registry contract
- Features: Proof storage, verification, revocation
- Access: Owner-controlled

## 🎯 Key Functions

### Badge Contract
```solidity
issueBadge(address, string, string) → uint256
getUserBadges(address) → uint256[]
totalSupply() → uint256
```

### Passport Contract
```solidity
mintPassport(uint256, uint256) → uint256
getPassport(address) → Passport
updateScore(address, uint256, uint256, uint256)
calculateCreditScore(uint256, uint256, uint256) → uint256
```

### Proof Registry
```solidity
registerProof(string, address)
verifyProof(string) → bool
getUserProofs(address) → string[]
```

## 🌐 Network Info

- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology
- **Faucet**: https://faucet.polygon.technology/

## 💡 Quick Integration

```javascript
// Contract addresses
const BADGE_ADDRESS = '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678';
const PASSPORT_ADDRESS = '0x1112373c9954B9bbFd91eb21175699b609A1b551';
const PROOF_ADDRESS = '0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B';

// Get user badges
const badges = await badgeContract.getUserBadges(userAddress);

// Get user passport
const passport = await passportContract.getPassport(userAddress);
console.log('Credit Score:', passport.creditScore);

// Mint passport
await passportContract.mintPassport(pohScore, badgeCount);
```

## 📁 Files Location

- Contracts: `contracts/contracts/*.sol`
- Deployment: `contracts/deployment.json`
- Scripts: `contracts/scripts/*.js`
- Tests: `contracts/test/*.js`

---

**For detailed documentation, see `SMART_CONTRACTS_OVERVIEW.md`**
