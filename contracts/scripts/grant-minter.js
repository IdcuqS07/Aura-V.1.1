const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const minterAddress = "0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974";

  const SimpleZKBadge = await hre.ethers.getContractAt("SimpleZKBadge", contractAddress);
  
  console.log("Authorizing minter:", minterAddress);
  const tx = await SimpleZKBadge.authorizeMinter(minterAddress);
  await tx.wait();
  
  console.log("✅ Minter authorized!");
  console.log("Transaction:", tx.hash);
  
  // Check authorization
  const isAuthorized = await SimpleZKBadge.authorizedMinters(minterAddress);
  console.log("Is authorized:", isAuthorized);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
