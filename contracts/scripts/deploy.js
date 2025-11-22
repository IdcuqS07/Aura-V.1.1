const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Aura Protocol contracts to Polygon testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SimpleZKBadge contract
  console.log("\nDeploying SimpleZKBadge...");
  const SimpleZKBadge = await ethers.getContractFactory("SimpleZKBadge");
  const zkBadge = await SimpleZKBadge.deploy();
  await zkBadge.waitForDeployment();
  const zkBadgeAddress = await zkBadge.getAddress();
  console.log("SimpleZKBadge deployed to:", zkBadgeAddress);

  // Deploy ProofRegistry contract
  console.log("\nDeploying ProofRegistry...");
  const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
  const proofRegistry = await ProofRegistry.deploy();
  await proofRegistry.waitForDeployment();
  const proofRegistryAddress = await proofRegistry.getAddress();
  console.log("ProofRegistry deployed to:", proofRegistryAddress);

  // Authorize deployer as minter
  console.log("\nAuthorizing deployer as minter...");
  await zkBadge.authorizeMinter(deployer.address);
  console.log("Deployer authorized as minter");

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contracts: {
      SimpleZKBadge: zkBadgeAddress,
      ProofRegistry: proofRegistryAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });