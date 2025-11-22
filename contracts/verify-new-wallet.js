const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("✅ Wallet baru terdeteksi!");
  console.log("Address:", wallet.address);
  console.log("");
  console.log("⚠️  Pastikan ini BUKAN address lama:");
  console.log("    0xb024196a8c1AB0b4960E2060Ceb4Ba32a43F2C29");
}

main().catch(console.error);
