const { ethers } = require("hardhat");

async function main() {
  const address = "0xb024196a8c1AB0b4960E2060Ceb4Ba32a43F2C29";
  
  console.log("🔍 Wallet:", address);
  console.log("");
  console.log("Cek transaksi di:");
  console.log("");
  console.log("📍 Ethereum:");
  console.log("   https://etherscan.io/address/" + address);
  console.log("");
  console.log("📍 Polygon:");
  console.log("   https://polygonscan.com/address/" + address);
  console.log("");
  console.log("📍 BSC:");
  console.log("   https://bscscan.com/address/" + address);
  console.log("");
  console.log("📍 Arbitrum:");
  console.log("   https://arbiscan.io/address/" + address);
  console.log("");
  console.log("📍 Optimism:");
  console.log("   https://optimistic.etherscan.io/address/" + address);
  console.log("");
  console.log("📍 Base:");
  console.log("   https://basescan.org/address/" + address);
  console.log("");
  
  // Cek nonce untuk tahu ada transaksi atau tidak
  const networks = [
    { name: "Ethereum", rpc: "https://eth.llamarpc.com" },
    { name: "Polygon", rpc: "https://polygon-rpc.com" },
    { name: "BSC", rpc: "https://bsc-dataseed.binance.org" }
  ];
  
  console.log("📊 Transaction Count:");
  for (const net of networks) {
    try {
      const provider = new ethers.JsonRpcProvider(net.rpc);
      const txCount = await provider.getTransactionCount(address);
      console.log(`   ${net.name}: ${txCount} transactions`);
    } catch (e) {
      console.log(`   ${net.name}: Error`);
    }
  }
}

main().catch(console.error);
