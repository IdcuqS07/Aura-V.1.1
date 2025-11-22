const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
  const userAddress = "0x6b3bea0bceab3e46ba8fc159966697168dcd480f";

  const SimpleZKBadge = await hre.ethers.getContractAt("SimpleZKBadge", contractAddress);
  
  console.log("Authorizing user as minter:", userAddress);
  const tx = await SimpleZKBadge.authorizeMinter(userAddress);
  await tx.wait();
  
  console.log("✅ User authorized as minter!");
  console.log("Transaction:", tx.hash);
}

main().catch(console.error);
