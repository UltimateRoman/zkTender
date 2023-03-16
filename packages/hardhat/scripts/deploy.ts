import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();

  const TenderManager = await ethers.getContractFactory("TenderManager");
  const tenderManager = await TenderManager.deploy(deployer.address, verifier.address);
  await tenderManager.deployed();

  console.log(`TenderManager deployed to ${tenderManager.address}`);
  console.log(`Verifier contract deployed to ${verifier.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
