const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying ZK Threshold Badge...");
    
    // Deploy Verifier first
    console.log("📝 Deploying Threshold Verifier...");
    const Verifier = await hre.ethers.getContractFactory("ThresholdVerifier");
    const verifier = await Verifier.deploy();
    await verifier.deployed();
    console.log("✅ Verifier deployed to:", verifier.address);
    
    // Deploy ZK Threshold Badge
    console.log("📝 Deploying ZK Threshold Badge...");
    const ZKThresholdBadge = await hre.ethers.getContractFactory("ZKThresholdBadge");
    const badge = await ZKThresholdBadge.deploy(verifier.address);
    await badge.deployed();
    console.log("✅ ZK Threshold Badge deployed to:", badge.address);
    
    // Save deployment info
    const deployment = {
        network: hre.network.name,
        verifier: verifier.address,
        badge: badge.address,
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
        "deployments/zk-threshold-badge.json",
        JSON.stringify(deployment, null, 2)
    );
    
    console.log("\n📊 Deployment Summary:");
    console.log("Network:", hre.network.name);
    console.log("Verifier:", verifier.address);
    console.log("Badge:", badge.address);
    console.log("\n✅ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
