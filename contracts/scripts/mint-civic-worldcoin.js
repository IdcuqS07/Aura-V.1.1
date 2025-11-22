const { ethers } = require("hardhat");

async function main() {
  const badgeAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const recipientAddress = "0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974";

  const badge = await ethers.getContractAt("SimpleZKBadge", badgeAddress);

  const badges = [
    "Civic Verified",
    "Worldcoin Verified"
  ];

  for (const badgeType of badges) {
    console.log(`\nMinting ${badgeType}...`);
    const tx = await badge.issueBadge(
      recipientAddress,
      badgeType,
      `zk_proof_${badgeType}_${Date.now()}`
    );
    await tx.wait();
    console.log(`✓ ${badgeType} minted! TX: ${tx.hash}`);
  }

  const userBadges = await badge.getUserBadges(recipientAddress);
  console.log(`\nTotal badges: ${userBadges.length}`);
}

main().catch(console.error);
