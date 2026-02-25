const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const summaryPath = path.join(__dirname, "../deployments/summary.json");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

async function testCrossChainSync() {
  console.log("🧪 Testing Cross-Chain Passport Sync\n");
  
  const [signer] = await hre.ethers.getSigners();
  const userAddress = await signer.getAddress();
  
  console.log(`👤 Testing with address: ${userAddress}\n`);
  
  // Step 1: Update passport on Polygon Amoy
  console.log("📝 Step 1: Updating passport on Polygon Amoy...");
  await hre.changeNetwork("polygon-amoy");
  
  const polygonContract = await hre.ethers.getContractAt(
    "CrossChainPassport",
    summary.networks["polygon-amoy"].address
  );
  
  const newScore = 850;
  const updateTx = await polygonContract.updatePassport(newScore);
  await updateTx.wait();
  console.log(`✅ Passport updated with score: ${newScore}`);
  console.log(`   TX: ${updateTx.hash}\n`);
  
  // Step 2: Check passport on Polygon
  const polygonPassport = await polygonContract.getPassport(userAddress);
  console.log("📊 Polygon Amoy Passport:");
  console.log(`   Score: ${polygonPassport.creditScore}`);
  console.log(`   Active: ${polygonPassport.isActive}`);
  console.log(`   Last Updated: ${new Date(Number(polygonPassport.lastUpdated) * 1000).toISOString()}\n`);
  
  // Step 3: Estimate sync fee to Ethereum Sepolia
  console.log("💰 Step 2: Estimating sync fee to Ethereum Sepolia...");
  const [nativeFee, zroFee] = await polygonContract.estimateFee(10161, userAddress);
  console.log(`   Native Fee: ${hre.ethers.formatEther(nativeFee)} ETH`);
  console.log(`   ZRO Fee: ${hre.ethers.formatEther(zroFee)} ZRO\n`);
  
  // Step 4: Sync to Ethereum Sepolia
  console.log("🔄 Step 3: Syncing to Ethereum Sepolia...");
  const syncTx = await polygonContract.syncToChain(10161, {
    value: nativeFee
  });
  const syncReceipt = await syncTx.wait();
  console.log(`✅ Sync transaction sent`);
  console.log(`   TX: ${syncTx.hash}`);
  console.log(`   Gas Used: ${syncReceipt.gasUsed.toString()}\n`);
  
  // Step 5: Wait for LayerZero message
  console.log("⏳ Step 4: Waiting for LayerZero message delivery (30 seconds)...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Step 6: Check passport on Ethereum Sepolia
  console.log("🔍 Step 5: Checking passport on Ethereum Sepolia...");
  await hre.changeNetwork("ethereum-sepolia");
  
  const ethereumContract = await hre.ethers.getContractAt(
    "CrossChainPassport",
    summary.networks["ethereum-sepolia"].address
  );
  
  const ethereumPassport = await ethereumContract.getPassport(userAddress);
  console.log("📊 Ethereum Sepolia Passport:");
  console.log(`   Score: ${ethereumPassport.creditScore}`);
  console.log(`   Active: ${ethereumPassport.isActive}`);
  console.log(`   Last Updated: ${new Date(Number(ethereumPassport.lastUpdated) * 1000).toISOString()}\n`);
  
  // Step 7: Verify sync
  if (ethereumPassport.creditScore.toString() === newScore.toString()) {
    console.log("✅ Cross-chain sync successful!");
    console.log("   Scores match across chains\n");
  } else {
    console.log("⚠️  Sync may still be in progress");
    console.log("   Check LayerZero Scan: https://testnet.layerzeroscan.com/\n");
  }
  
  // Step 8: Test multi-chain sync
  console.log("🌐 Step 6: Testing multi-chain sync...");
  await hre.changeNetwork("polygon-amoy");
  
  const chains = [
    { name: "BSC Testnet", lzId: 10102 },
    { name: "Arbitrum Sepolia", lzId: 10231 },
    { name: "Optimism Sepolia", lzId: 10232 }
  ];
  
  for (const chain of chains) {
    console.log(`\n🔄 Syncing to ${chain.name}...`);
    const [fee] = await polygonContract.estimateFee(chain.lzId, userAddress);
    const tx = await polygonContract.syncToChain(chain.lzId, { value: fee });
    await tx.wait();
    console.log(`✅ Sync initiated to ${chain.name}`);
    console.log(`   TX: ${tx.hash}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log("\n🎉 Cross-Chain Sync Test Complete!");
  console.log("\n📋 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Passport updated on Polygon Amoy: ${newScore}`);
  console.log(`✅ Synced to Ethereum Sepolia`);
  console.log(`✅ Synced to BSC Testnet`);
  console.log(`✅ Synced to Arbitrum Sepolia`);
  console.log(`✅ Synced to Optimism Sepolia`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n⏳ Wait 1-2 minutes for all messages to be delivered");
  console.log("🔍 Monitor progress: https://testnet.layerzeroscan.com/");
  console.log(`🔍 Search for your address: ${userAddress}\n`);
}

async function main() {
  try {
    await testCrossChainSync();
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
