const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleZKBadgeV2 to Polygon Amoy...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy SimpleZKBadgeV2
  console.log("Deploying SimpleZKBadgeV2...");
  const SimpleZKBadgeV2 = await hre.ethers.getContractFactory("SimpleZKBadgeV2");
  const badge = await SimpleZKBadgeV2.deploy();
  await badge.waitForDeployment();

  const badgeAddress = await badge.getAddress();
  console.log("✅ SimpleZKBadgeV2 deployed to:", badgeAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await badge.deploymentTransaction().wait(5);

  console.log("\n📝 Contract Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Name: SimpleZKBadgeV2");
  console.log("Address:", badgeAddress);
  console.log("Network: Polygon Amoy Testnet");
  console.log("Explorer:", `https://amoy.polygonscan.com/address/${badgeAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Verify contract on PolygonScan
  console.log("🔍 Verifying contract on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: badgeAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!\n");
  } catch (error) {
    console.log("⚠️  Verification failed:", error.message);
    console.log("You can verify manually later.\n");
  }

  // Test contract functions
  console.log("🧪 Testing contract functions...");
  
  const totalSupply = await badge.totalSupply();
  console.log("Total Supply:", totalSupply.toString());
  
  const cooldown = await badge.MINT_COOLDOWN();
  console.log("Mint Cooldown:", cooldown.toString(), "seconds (", cooldown / 3600n, "hours)");

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend/.env with new contract address");
  console.log("2. Update backend/.env with new contract address");
  console.log("3. Test minting from frontend");
  console.log("4. Update documentation with new address\n");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "amoy",
    contractName: "SimpleZKBadgeV2",
    address: badgeAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    features: {
      permissionless: true,
      cooldown: "1 hour",
      onePerType: true,
      soulbound: true
    }
  };

  fs.writeFileSync(
    'deployments/badge-v2-amoy.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployments/badge-v2-amoy.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
