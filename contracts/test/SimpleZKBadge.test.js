const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleZKBadge - Soulbound NFT", function () {
  let zkBadge, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const SimpleZKBadge = await ethers.getContractFactory("SimpleZKBadge");
    zkBadge = await SimpleZKBadge.deploy();
    await zkBadge.waitForDeployment();
  });

  it("Should mint badge to user", async function () {
    await zkBadge.issueBadge(user1.address, "identity", "proof123");
    expect(await zkBadge.totalSupply()).to.equal(1);
  });

  it("Should prevent transfers (Soulbound)", async function () {
    await zkBadge.issueBadge(user1.address, "identity", "proof123");
    
    await expect(
      zkBadge.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWith("Soulbound: Transfer not allowed");
  });

  it("Should prevent approvals", async function () {
    await zkBadge.issueBadge(user1.address, "identity", "proof123");
    
    await expect(
      zkBadge.connect(user1).approve(user2.address, 1)
    ).to.be.revertedWith("Soulbound: Approval not allowed");
  });

  it("Should only allow authorized minters", async function () {
    await expect(
      zkBadge.connect(user1).issueBadge(user2.address, "identity", "proof123")
    ).to.be.revertedWith("Not authorized");
  });

  it("Should authorize and revoke minters", async function () {
    await zkBadge.authorizeMinter(user1.address);
    expect(await zkBadge.authorizedMinters(user1.address)).to.be.true;
    
    await zkBadge.connect(user1).issueBadge(user2.address, "identity", "proof123");
    expect(await zkBadge.totalSupply()).to.equal(1);
    
    await zkBadge.revokeMinter(user1.address);
    expect(await zkBadge.authorizedMinters(user1.address)).to.be.false;
  });
});