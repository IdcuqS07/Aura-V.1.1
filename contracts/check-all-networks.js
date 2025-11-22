const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("🔍 Wallet:", wallet.address);
  console.log("");
  
  const abi = ["function balanceOf(address) view returns (uint256)"];
  
  const networks = [
    { name: "Ethereum", rpc: "https://eth.llamarpc.com", usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", native: "ETH" },
    { name: "Polygon", rpc: "https://polygon-rpc.com", usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", native: "MATIC" },
    { name: "BSC", rpc: "https://bsc-dataseed.binance.org", usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", native: "BNB" },
    { name: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", native: "ETH" },
    { name: "Optimism", rpc: "https://mainnet.optimism.io", usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", native: "ETH" },
    { name: "Base", rpc: "https://mainnet.base.org", usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", native: "ETH" }
  ];
  
  for (const net of networks) {
    try {
      const provider = new ethers.JsonRpcProvider(net.rpc);
      const balance = await provider.getBalance(wallet.address);
      const usdc = new ethers.Contract(net.usdc, abi, provider);
      const usdcBalance = await usdc.balanceOf(wallet.address);
      
      console.log(`📍 ${net.name.toUpperCase()}:`);
      console.log(`   ${net.native}: ${ethers.formatEther(balance)}`);
      console.log(`   USDC: ${ethers.formatUnits(usdcBalance, 6)}`);
      console.log("");
    } catch (e) {
      console.log(`❌ ${net.name}: ${e.message}`);
    }
  }
}

main().catch(console.error);
