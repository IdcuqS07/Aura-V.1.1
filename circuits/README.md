# Aura Protocol - ZK Circuits

Zero-Knowledge Proof circuits untuk Proof of Humanity verification.

## Setup

```bash
npm install
```

## Compile Circuit

```bash
npm run compile
```

## Generate Proving Key

```bash
# Download powers of tau
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau

# Setup
npm run setup

# Contribute
npm run contribute

# Export verification key
npm run export-vkey

# Export Solidity verifier
npm run export-solidity
```

## Circuit Details

- **Input Signals**: githubVerified, twitterVerified, walletAddress, secret, nullifierHash
- **Output Signals**: proofHash, isHuman, nullifierHashOut
- **Constraints**: ~1000
- **Proving System**: Groth16
