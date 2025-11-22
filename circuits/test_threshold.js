const { generateProof, verifyProof } = require('./generate_proof');

async function testThreshold() {
    console.log("🧪 Testing ZK Threshold Proof\n");
    
    // Test case 1: Pass threshold
    console.log("Test 1: Score above threshold");
    const input1 = {
        threshold: "50",
        nullifierHash: "12345678901234567890",
        githubScore: "30",
        twitterScore: "20",
        walletAge: "15",
        transactionCount: "10",
        secret: "mysecret123"
    };
    
    try {
        const { proof, publicSignals } = await generateProof(input1);
        const valid = await verifyProof(proof, publicSignals);
        console.log("✅ Proof generated and verified:", valid);
        console.log("Total score: 75 (30+20+15+10)\n");
    } catch (e) {
        console.log("❌ Error:", e.message, "\n");
    }
    
    // Test case 2: Below threshold
    console.log("Test 2: Score below threshold");
    const input2 = {
        threshold: "100",
        nullifierHash: "98765432109876543210",
        githubScore: "30",
        twitterScore: "20",
        walletAge: "10",
        transactionCount: "5",
        secret: "mysecret456"
    };
    
    try {
        const { proof, publicSignals } = await generateProof(input2);
        const valid = await verifyProof(proof, publicSignals);
        console.log("✅ Proof generated and verified:", valid);
        console.log("Total score: 65 (30+20+10+5)\n");
    } catch (e) {
        console.log("❌ Error:", e.message, "\n");
    }
}

testThreshold().catch(console.error);
