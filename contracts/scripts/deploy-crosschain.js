const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// LayerZero Endpoints for testnets
const LZ_ENDPOINTS = {
  "polygon-amoy": "0x6EDCE65403992e310A62460808c4b910D972f10f",
  "sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
  "bscTestnet": "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
  "arbitrumSepolia": "0x6098e96a28E02f27B1e6BD381f870F1C8Bd169d3",
  "optimismSepolia": "0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8"
};

// LayerZero Chain IDs
const LZ_CHAIN_IDS = {
  "polygon-amoy": 10267,
  "sepolia": 10161,
  "bscTestnet": 10102,
  "arbitrumSepolia": 10231,
  "optimismSepolia": 10232
};

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying CrossChainPassport to ${network}...`);

  // Get LayerZero endpoint for current network
  const lzEndpoint = LZ_ENDPOINTS[network];
  if (!lzEndpoint) {
    throw new Error(`LayerZero endpoint not configured for ${network}`);
  }

  console.log(`📡 Using LayerZero Endpoint: ${lzEndpoint}`);

  // Deploy CrossChainPassport
  const CrossChainPassport = await hre.ethers.getContractFactory("CrossChainPassport");
  const passport = await CrossChainPassport.deploy(lzEndpoint);
  await passport.waitForDeployment();

  const passportAddress = await passport.getAddress();
  console.log(`✅ CrossChainPassport deployed to: ${passportAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    lzChainId: LZ_CHAIN_IDS[network],
    lzEndpoint: lzEndpoint,
    crossChainPassport: passportAddress,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📝 Deployment info saved to: ${deploymentFile}`);

  // Verify contract on explorer (if not localhost)
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: passportAddress,
        constructorArguments: [lzEndpoint],
      });
      console.log("✅ Contract verified on explorer");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  console.log("\n📋 Next Steps:");
  console.log("1. Deploy to other chains");
  console.log("2. Set trusted remotes using setTrustedRemote()");
  console.log("3. Update multichain_routes.py with contract addresses");
  console.log("4. Test cross-chain sync\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
