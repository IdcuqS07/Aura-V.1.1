const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("🔍 Checking wallet:", wallet.address);
  console.log("");
  
  const abi = ["function balanceOf(address) view returns (uint256)"];
  
  // 1. Polygon Mainnet
  try {
    const polygonProvider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const maticBalance = await polygonProvider.getBalance(wallet.address);
    const usdcPolygon = new ethers.Contract("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", abi, polygonProvider);
    const usdcBalancePolygon = await usdcPolygon.balanceOf(wallet.address);
    
    console.log("📍 POLYGON MAINNET:");
    console.log("   MATIC:", ethers.formatEther(maticBalance));
    console.log("   USDC:", ethers.formatUnits(usdcBalancePolygon, 6));
    console.log("");
  } catch (e) {
    console.log("❌ Polygon Mainnet error:", e.message);
  }
  
  // 2. Ethereum Mainnet
  try {
    const ethProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const ethBalance = await ethProvider.getBalance(wallet.address);
    const usdcEth = new ethers.Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", abi, ethProvider);
    const usdcBalanceEth = await usdcEth.balanceOf(wallet.address);
    
    console.log("📍 ETHEREUM MAINNET:");
    console.log("   ETH:", ethers.formatEther(ethBalance));
    console.log("   USDC:", ethers.formatUnits(usdcBalanceEth, 6));
    console.log("");
  } catch (e) {
    console.log("❌ Ethereum Mainnet error:", e.message);
  }
}

main().catch(console.error);
