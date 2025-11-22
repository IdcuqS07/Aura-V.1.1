#!/bin/bash
set -e

echo "🔧 Compiling ZK Circuits..."

# Compile threshold circuit
circom threshold.circom --r1cs --wasm --sym -o build/

# Download powers of tau if not exists
if [ ! -f "pot12_final.ptau" ]; then
    echo "📥 Downloading powers of tau..."
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
fi

# Setup
echo "🔑 Generating proving key..."
snarkjs groth16 setup build/threshold.r1cs pot12_final.ptau build/threshold_0000.zkey

# Contribute
echo "🎲 Contributing to ceremony..."
snarkjs zkey contribute build/threshold_0000.zkey build/threshold_final.zkey --name="Aura" -e="random entropy"

# Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey build/threshold_final.zkey build/verification_key.json

# Export Solidity verifier
echo "📝 Generating Solidity verifier..."
snarkjs zkey export solidityverifier build/threshold_final.zkey ../contracts/contracts/ThresholdVerifier.sol

echo "✅ Compilation complete!"
