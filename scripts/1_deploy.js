async function main() {
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory("MedialocoToken");

  // Deploy contract
  const token = await Token.deploy("Medialoco", "LOCO", "1000000");

  // Wait for the deployment to complete
  await token.waitForDeployment();

  console.log(`Token Deployed to: ${await token.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });