const { ethers } = require("hardhat");

async function main() {
  const badgeAddress = "0xa297944E0A63aDB57730687d44aF6235aa8D0DA7";
  const recipientAddress = "0xb024196a8c1AB0b4960E2060Ceb4Ba32a43F2C29";

  const badge = await ethers.getContractAt("SimpleZKBadge", badgeAddress);

  const badges = [
    "Identity Verified",
    "Reputation Badge"
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
