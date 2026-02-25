const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read all deployment files
const deploymentsDir = path.join(__dirname, "../deployments");
const deployments = {};

// Load deployment addresses
const files = fs.readdirSync(deploymentsDir).filter(f => f.endsWith('.json') && f !== 'summary.json');
files.forEach(file => {
  const network = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(deploymentsDir, file), 'utf8'));
  // Only include if it has crossChainPassport address
  if (data.crossChainPassport) {
    deployments[network] = data;
  }
});

console.log("📋 Loaded deployments:");
Object.keys(deployments).forEach(net => {
  console.log(`  ${net}: ${deployments[net].crossChainPassport}`);
});

async function main() {
  const network = hre.network.name;
  console.log(`\n🔗 Setting up trusted remotes for ${network}...`);
  
  if (!deployments[network]) {
    console.error(`❌ No deployment found for ${network}`);
    process.exit(1);
  }
  
  const contract = await hre.ethers.getContractAt(
    "CrossChainPassport",
    deployments[network].crossChainPassport
  );
  
  // Set trusted remote for each other network
  for (const [destNetwork, destData] of Object.entries(deployments)) {
    if (destNetwork === network) continue;
    
    console.log(`\n  Setting trusted remote for ${destNetwork}...`);
    
    const trustedRemote = hre.ethers.solidityPacked(
      ["address", "address"],
      [destData.crossChainPassport, deployments[network].crossChainPassport]
    );
    
    try {
      const tx = await contract.setTrustedRemote(destData.lzChainId, trustedRemote);
      await tx.wait();
      console.log(`  ✅ Set (LZ Chain ID: ${destData.lzChainId})`);
      console.log(`     TX: ${tx.hash}`);
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n✅ Trusted remotes configured for ${network}!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
