const { ethers } = require("hardhat");

async function main() {

  const SimpleContract = await ethers.getContractFactory("SimpleContract");
  const simpleContract = await SimpleContract.deploy();

  await simpleContract.deployed();

  console.log("SimpleContract deployed to:", simpleContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
