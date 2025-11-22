const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CreditPassport V2 (User Mint)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MATIC\n");

  const CreditPassport = await hre.ethers.getContractFactory("CreditPassport");
  const passport = await CreditPassport.deploy();
  await passport.waitForDeployment();

  const address = await passport.getAddress();
  console.log("✅ CreditPassport V2 deployed:", address);

  const fs = require('fs');
  const network = await hre.ethers.provider.getNetwork();
  
  fs.writeFileSync(
    'deployment-passport-v2.json',
    JSON.stringify({
      creditPassport: address,
      deployer: deployer.address,
      network: hre.network.name,
      chainId: network.chainId.toString(),
      timestamp: new Date().toISOString(),
      features: ["user-mint", "admin-mint", "soulbound"]
    }, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("\nFeatures:");
  console.log("- ✅ mintPassport() - Users mint for themselves");
  console.log("- ✅ issuePassport() - Admin mint for users");
  console.log("- ✅ Soulbound (non-transferable)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
