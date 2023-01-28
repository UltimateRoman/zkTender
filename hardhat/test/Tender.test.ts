import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tender Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Tender = await ethers.getContractFactory("Tender");
    const tender = await Tender.deploy();

    return { tender, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Tender smart contract deploys succesfully", async function () {
      const { tender } = await loadFixture(deployFixture);

      expect(tender.address).to.not.be.undefined;
    });
  });
});
