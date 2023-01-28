import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tender Manager Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TenderManager = await ethers.getContractFactory("TenderManager");
    const tenderManager = await TenderManager.deploy();

    return { tenderManager, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Tender Manager smart contract deploys succesfully", async function () {
      const { tenderManager } = await loadFixture(deployFixture);

      expect(tenderManager.address).to.not.be.undefined;
    });
  });
});