const { ethers } = require("hardhat");

async function main() {
  const badgeAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const minterAddress = "0xc3ece9ac328cb232ddb0bc677d2e980a1a3d3974";

  console.log("Authorizing minter:", minterAddress);

  const badge = await ethers.getContractAt("SimpleZKBadge", badgeAddress);
  const tx = await badge.authorizeMinter(minterAddress);
  await tx.wait();

  console.log("✅ Minter authorized!");
  console.log("Transaction:", tx.hash);
}

main().catch(console.error);
