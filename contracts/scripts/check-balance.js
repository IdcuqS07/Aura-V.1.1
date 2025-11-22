const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("Wallet Address:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    console.log("\n⚠️  No MATIC found! Get testnet MATIC from:");
    console.log("   https://faucet.polygon.technology/");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
