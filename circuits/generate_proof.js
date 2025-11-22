const snarkjs = require("snarkjs");
const fs = require("fs");

async function generateProof(input) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "build/threshold_js/threshold.wasm",
        "build/threshold_final.zkey"
    );
    
    return { proof, publicSignals };
}

async function verifyProof(proof, publicSignals) {
    const vKey = JSON.parse(fs.readFileSync("build/verification_key.json"));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
}

function formatProofForSolidity(proof, publicSignals) {
    return {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        c: [proof.pi_c[0], proof.pi_c[1]],
        input: publicSignals
    };
}

module.exports = { generateProof, verifyProof, formatProofForSolidity };

// CLI usage
if (require.main === module) {
    const input = {
        threshold: process.argv[2] || 50,
        nullifierHash: process.argv[3] || "12345",
        githubScore: process.argv[4] || 30,
        twitterScore: process.argv[5] || 20,
        walletAge: process.argv[6] || 10,
        transactionCount: process.argv[7] || 15,
        secret: process.argv[8] || "secret123"
    };
    
    generateProof(input).then(({ proof, publicSignals }) => {
        console.log("Proof generated:");
        console.log(JSON.stringify(formatProofForSolidity(proof, publicSignals), null, 2));
        
        verifyProof(proof, publicSignals).then(valid => {
            console.log("Proof valid:", valid);
        });
    });
}
