const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing SimpleZKBadgeV2 Minting\n");

  const contractAddress = "0x3d586E681b12B07825F17Ce19B28e1F576a1aF89";
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Testing with account:", signer.address);
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Get contract
  const badge = await hre.ethers.getContractAt("SimpleZKBadgeV2", contractAddress);

  // Check contract info
  console.log("📋 Contract Info:");
  const totalSupply = await badge.totalSupply();
  const cooldown = await badge.MINT_COOLDOWN();
  console.log("Total Supply:", totalSupply.toString());
  console.log("Cooldown:", cooldown.toString(), "seconds (", Number(cooldown) / 3600, "hours)\n");

  // Check user status
  console.log("👤 User Status:");
  const userBadges = await badge.getUserBadges(signer.address);
  console.log("Current badges:", userBadges.length);
  
  const hasUniqueness = await badge.hasBadgeType(signer.address, "uniqueness");
  const hasIdentity = await badge.hasBadgeType(signer.address, "identity");
  const hasReputation = await badge.hasBadgeType(signer.address, "reputation");
  
  console.log("- Uniqueness:", hasUniqueness ? "✅" : "❌");
  console.log("- Identity:", hasIdentity ? "✅" : "❌");
  console.log("- Reputation:", hasReputation ? "✅" : "❌");

  const lastMint = await badge.lastMintTime(signer.address);
  const now = Math.floor(Date.now() / 1000);
  const canMint = Number(lastMint) + Number(cooldown) <= now;
  
  console.log("\nLast mint:", lastMint.toString() === "0" ? "Never" : new Date(Number(lastMint) * 1000).toLocaleString());
  console.log("Can mint now:", canMint ? "✅ Yes" : "❌ No (cooldown active)");
  
  if (!canMint && lastMint.toString() !== "0") {
    const remaining = Number(lastMint) + Number(cooldown) - now;
    console.log("Cooldown remaining:", Math.ceil(remaining / 60), "minutes\n");
    return;
  }

  // Determine which badge to mint
  let badgeType;
  if (!hasUniqueness) {
    badgeType = "uniqueness";
  } else if (!hasIdentity) {
    badgeType = "identity";
  } else if (!hasReputation) {
    badgeType = "reputation";
  } else {
    console.log("\n✅ All badge types already minted!\n");
    return;
  }

  console.log(`\n🎯 Minting ${badgeType} badge...\n`);

  // Generate ZK proof hash (mock)
  const zkProofHash = "0x" + hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(`${signer.address}-${badgeType}-${Date.now()}`)
  ).slice(2, 66);

  console.log("ZK Proof Hash:", zkProofHash);

  // Estimate gas
  try {
    const gasEstimate = await badge.issueBadge.estimateGas(
      signer.address,
      badgeType,
      zkProofHash
    );
    console.log("Gas estimate:", gasEstimate.toString());
    
    const gasPrice = (await hre.ethers.provider.getFeeData()).gasPrice;
    const gasCost = gasEstimate * gasPrice;
    console.log("Estimated cost:", hre.ethers.formatEther(gasCost), "MATIC\n");
  } catch (error) {
    console.error("❌ Gas estimation failed:", error.message);
    return;
  }

  // Mint badge
  console.log("⏳ Sending transaction...");
  try {
    const tx = await badge.issueBadge(
      signer.address,
      badgeType,
      zkProofHash
    );

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await tx.wait();

    console.log("✅ Badge minted successfully!\n");
    console.log("📊 Transaction Details:");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Gas price:", hre.ethers.formatUnits(receipt.gasPrice || tx.gasPrice, "gwei"), "gwei");
    
    const gasFee = receipt.gasUsed * (receipt.gasPrice || tx.gasPrice);
    console.log("Total cost:", hre.ethers.formatEther(gasFee), "MATIC");

    // Find token ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = badge.interface.parseLog(log);
        return parsed.name === "BadgeIssued";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = badge.interface.parseLog(event);
      console.log("Token ID:", parsed.args.tokenId.toString());
    }

    console.log("\n🔗 View on Explorer:");
    console.log(`https://amoy.polygonscan.com/tx/${tx.hash}\n`);

    // Verify badge was minted
    console.log("🔍 Verifying...");
    const newBadges = await badge.getUserBadges(signer.address);
    console.log("Total badges now:", newBadges.length);
    
    const hasBadge = await badge.hasBadgeType(signer.address, badgeType);
    console.log(`Has ${badgeType}:`, hasBadge ? "✅" : "❌");

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    
    if (error.message.includes("Cooldown period active")) {
      console.log("\n⏰ You need to wait 1 hour between mints");
    } else if (error.message.includes("Already has this badge type")) {
      console.log("\n⚠️  You already have this badge type");
    } else if (error.message.includes("Can only mint for yourself")) {
      console.log("\n⚠️  You can only mint for your own address");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
