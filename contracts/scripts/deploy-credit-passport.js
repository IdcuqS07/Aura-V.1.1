const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CreditPassport contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy CreditPassport
  const CreditPassport = await hre.ethers.getContractFactory("CreditPassport");
  const creditPassport = await CreditPassport.deploy();
  await creditPassport.waitForDeployment();

  const address = await creditPassport.getAddress();
  console.log("✅ CreditPassport deployed to:", address);

  // Authorize deployer as minter
  console.log("🔑 Authorizing deployer as minter...");
  const tx = await creditPassport.authorizeMinter(deployer.address);
  await tx.wait();
  console.log("✅ Deployer authorized");

  // Save deployment info
  const fs = require('fs');
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo = {
    creditPassport: address,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment-credit-passport.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Deployment info saved to deployment-credit-passport.json");
  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update backend .env with contract address");
  console.log("2. Test passport minting");
  console.log("3. Verify contract on PolygonScan");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
