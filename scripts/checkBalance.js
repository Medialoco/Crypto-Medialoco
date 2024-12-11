async function main() {
  const [deployer] = await ethers.getSigners();

  // Obtenir le solde directement via ethers.provider
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Address: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });