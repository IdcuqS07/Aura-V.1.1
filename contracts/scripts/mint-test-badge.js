const { ethers } = require("hardhat");

async function main() {
  const badgeAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const recipientAddress = process.argv[2] || "0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974";

  console.log("Minting test badge...");
  console.log("Badge Contract:", badgeAddress);
  console.log("Recipient:", recipientAddress);

  const SimpleZKBadge = await ethers.getContractFactory("SimpleZKBadge");
  const badge = SimpleZKBadge.attach(badgeAddress);

  const badgeType = process.argv[3] || "Proof of Uniqueness";
  const tx = await badge.issueBadge(
    recipientAddress,
    badgeType,
    `zk_proof_${badgeType}_${Date.now()}`
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Badge minted successfully!");

  const userBadges = await badge.getUserBadges(recipientAddress);
  console.log("User badges:", userBadges.map(id => id.toString()));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
