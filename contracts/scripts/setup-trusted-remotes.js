const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read deployment summary
const summaryPath = path.join(__dirname, "../deployments/summary.json");
if (!fs.existsSync(summaryPath)) {
  console.error("❌ Deployment summary not found. Run deploy-all-chains.sh first");
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

// Network configurations
const NETWORKS = {
  "polygon-amoy": { lzChainId: 10267, rpcKey: "polygon-amoy" },
  "ethereum-sepolia": { lzChainId: 10161, rpcKey: "ethereum-sepolia" },
  "bsc-testnet": { lzChainId: 10102, rpcKey: "bsc-testnet" },
  "arbitrum-sepolia": { lzChainId: 10231, rpcKey: "arbitrum-sepolia" },
  "optimism-sepolia": { lzChainId: 10232, rpcKey: "optimism-sepolia" }
};

async function setTrustedRemote(sourceNetwork, destNetwork) {
  console.log(`\n🔗 Setting trusted remote: ${sourceNetwork} -> ${destNetwork}`);
  
  const sourceAddress = summary.networks[sourceNetwork].address;
  const destAddress = summary.networks[destNetwork].address;
  const destLzChainId = NETWORKS[destNetwork].lzChainId;
  
  // Switch to source network
  await hre.changeNetwork(sourceNetwork);
  
  const contract = await hre.ethers.getContractAt(
    "CrossChainPassport",
    sourceAddress
  );
  
  // Encode trusted remote (destination address + source address)
  const trustedRemote = hre.ethers.solidityPacked(
    ["address", "address"],
    [destAddress, sourceAddress]
  );
  
  try {
    const tx = await contract.setTrustedRemote(destLzChainId, trustedRemote);
    await tx.wait();
    console.log(`✅ Set trusted remote for ${destNetwork} (LZ Chain ID: ${destLzChainId})`);
    console.log(`   TX: ${tx.hash}`);
  } catch (error) {
    console.error(`❌ Failed to set trusted remote: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Setting up trusted remotes for cross-chain communication...\n");
  
  const networkNames = Object.keys(NETWORKS);
  
  // Set trusted remotes for each network pair
  for (const sourceNetwork of networkNames) {
    console.log(`\n📡 Configuring ${sourceNetwork}...`);
    
    for (const destNetwork of networkNames) {
      if (sourceNetwork !== destNetwork) {
        await setTrustedRemote(sourceNetwork, destNetwork);
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log("\n✅ All trusted remotes configured!");
  console.log("\n📋 Next Steps:");
  console.log("1. Update backend/multichain_routes.py with contract addresses");
  console.log("2. Test cross-chain sync with: npm run test-crosschain");
  console.log("3. Monitor LayerZero Scan: https://testnet.layerzeroscan.com/\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
