import { ethers } from "hardhat";
import { Contract } from "ethers";
import fs from 'fs';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer.address);
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();

  const TenderManager = await ethers.getContractFactory("TenderManager");
  const tenderManager = await TenderManager.deploy(deployer.address, verifier.address);
  await tenderManager.deployed();

  console.log(`TenderManager deployed to ${tenderManager.address}`);
  console.log(`Verifier contract deployed to ${verifier.address}`);

  return  {
    "TenderManager": tenderManager,
    "Verifier": verifier
  };
}

function saveFrontendFiles(contract: Contract, contractName: string, filePath: string) {
  fs.appendFileSync(
    filePath,
    `export const ${contractName}Address = '${contract.address}';\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(async (deployedData) => {
  const filePath = "./contractAddress.ts";
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  Object.keys(deployedData).forEach(function(key:string) {
    saveFrontendFiles((deployedData as any)[key] as Contract, key, filePath);
  });
  process.exit(0);
})
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
