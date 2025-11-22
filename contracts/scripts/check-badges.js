const { ethers } = require("hardhat");

async function main() {
  const badgeAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const userAddress = "0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974";

  const badge = await ethers.getContractAt("SimpleZKBadge", badgeAddress);
  const badges = await badge.getUserBadges(userAddress);
  
  console.log("User:", userAddress);
  console.log("Badge IDs:", badges.map(id => id.toString()));
  console.log("Total badges:", badges.length);
  
  for (let i = 0; i < badges.length; i++) {
    const badgeData = await badge.badges(badges[i]);
    console.log(`\nBadge #${badges[i]}:`);
    console.log("  Type:", badgeData.badgeType);
    console.log("  Proof:", badgeData.zkProofHash);
  }
}

main().catch(console.error);
