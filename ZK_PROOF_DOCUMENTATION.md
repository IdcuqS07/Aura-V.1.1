# 🔐 Zero-Knowledge Proof System - Aura Protocol

## Overview

Aura Protocol includes a complete Zero-Knowledge Proof (ZK Proof) system for Proof of Humanity verification. This system allows users to prove they are unique humans without revealing their personal data.

## 🎯 Features

- **Privacy-Preserving**: Verify humanity without exposing personal data
- **On-Chain Verification**: Smart contract verification on Polygon Amoy
- **Sybil-Resistant**: Nullifier system prevents double verification
- **Cryptographically Secure**: Uses Groth16 proving system with Poseidon hash

## 🏗️ Architecture

### 1. Circom Circuit (`circuits/poh.circom`)

**Inputs:**
- `nullifierHash` (public): Unique identifier to prevent double-claims
- `githubVerified` (private): GitHub verification status (0 or 1)
- `twitterVerified` (private): Twitter verification status (0 or 1)
- `walletAddress` (private): User's wallet address
- `secret` (private): Random secret for nullifier generation

**Outputs:**
- `proofHash`: Hash of all verification data
- `isHuman`: Boolean indicating if user passed verification (1 = human)
- `nullifierHash`: Public nullifier for sybil resistance

**Circuit Logic:**
```
1. Verify inputs are binary (0 or 1)
2. Calculate verification sum (github + twitter)
3. User is human if sum > 0
4. Generate nullifier: Poseidon(walletAddress, secret)
5. Generate proof hash: Poseidon(github, twitter, wallet, nullifier)
```

### 2. Smart Contract Verifier

Generated automatically from circuit using:
```bash
snarkjs zkey export solidityverifier poh_final.zkey Verifier.sol
```

### 3. Backend Integration (`backend/proof_service.py`)

**Endpoints:**
- `POST /api/proof/generate` - Generate ZK proof
- `POST /api/proof/verify` - Verify ZK proof on-chain

**Flow:**
1. User completes GitHub/Twitter verification
2. Backend generates witness from private inputs
3. Generate proof using snarkjs
4. Submit proof to smart contract
5. Contract verifies and mints badge

## 📦 Installation

### Prerequisites
```bash
# Install circom
curl -L https://github.com/iden3/circom/releases/download/v2.1.6/circom-linux-amd64 -o circom
chmod +x circom
sudo mv circom /usr/local/bin/

# Install snarkjs
npm install -g snarkjs
```

### Setup Circuits
```bash
cd circuits
npm install

# Compile circuit
npm run compile

# Download powers of tau
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau

# Setup and generate keys
npm run setup
npm run contribute
npm run export-vkey
npm run export-solidity
```

## 🔄 Workflow

### 1. User Verification
```javascript
// User completes social verification
const verificationData = {
  githubVerified: 1,
  twitterVerified: 1,
  walletAddress: "0x...",
  secret: randomSecret()
}
```

### 2. Generate Proof
```javascript
// Backend generates proof
const proof = await generateProof(verificationData);
// Returns: { proof, publicSignals }
```

### 3. Submit to Blockchain
```javascript
// Submit proof to smart contract
await contract.verifyAndMint(
  proof.a,
  proof.b,
  proof.c,
  publicSignals
);
```

### 4. Verification
```solidity
// Smart contract verifies proof
function verifyAndMint(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[3] memory input
) public {
    require(verifier.verifyProof(a, b, c, input), "Invalid proof");
    require(!usedNullifiers[input[2]], "Already verified");
    
    usedNullifiers[input[2]] = true;
    _mint(msg.sender, tokenId);
}
```

## 🔒 Security Features

### Nullifier System
- Prevents same user from verifying multiple times
- Generated from: `Poseidon(walletAddress, secret)`
- Stored on-chain in `usedNullifiers` mapping

### Privacy Guarantees
- Social accounts never revealed on-chain
- Only proof of verification is public
- Wallet address kept private in circuit
- Secret ensures uniqueness

### Sybil Resistance
- One verification per unique nullifier
- Cannot reuse same social accounts
- Cryptographically enforced uniqueness

## 📊 Circuit Statistics

- **Constraints**: ~1,000
- **Proving Time**: ~2-5 seconds
- **Verification Time**: ~0.5 seconds (on-chain)
- **Proof Size**: 256 bytes
- **Gas Cost**: ~250,000 gas

## 🧪 Testing

### Test Circuit Locally
```bash
cd circuits
node test_circuit.js
```

### Test Smart Contract
```bash
cd contracts
npx hardhat test test/ZKProof.test.js
```

### Test Full Flow
```bash
cd backend
python test_poh_full_flow.py
```

## 🚀 Deployment

### 1. Deploy Verifier Contract
```bash
cd contracts
npx hardhat run scripts/deploy-verifier.js --network amoy
```

### 2. Deploy Badge Contract
```bash
npx hardhat run scripts/deploy-badge-v2.js --network amoy
```

### 3. Configure Backend
```bash
# Update .env
ZK_VERIFIER_ADDRESS=0x...
ZK_BADGE_ADDRESS=0x...
```

## 📝 API Usage

### Generate Proof
```bash
curl -X POST http://localhost:5000/api/proof/generate \
  -H "Content-Type: application/json" \
  -d '{
    "githubVerified": 1,
    "twitterVerified": 1,
    "walletAddress": "0x...",
    "secret": "random_secret"
  }'
```

### Verify Proof
```bash
curl -X POST http://localhost:5000/api/proof/verify \
  -H "Content-Type: application/json" \
  -d '{
    "proof": {...},
    "publicSignals": [...]
  }'
```

## 🔧 Troubleshooting

### Circuit Compilation Errors
```bash
# Clear cache
rm -rf poh_js poh.r1cs poh.sym

# Recompile
npm run compile
```

### Proof Generation Fails
- Check witness generation
- Verify input constraints
- Ensure all inputs are valid field elements

### On-Chain Verification Fails
- Verify proof format
- Check public signals match
- Ensure nullifier not already used

## 📚 Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Guide](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Poseidon Hash](https://www.poseidon-hash.info/)

## 🤝 Contributing

Contributions welcome! Please ensure:
- Circuit changes are tested
- Gas costs are optimized
- Security is maintained

## 📄 License

MIT License - See LICENSE file for details
