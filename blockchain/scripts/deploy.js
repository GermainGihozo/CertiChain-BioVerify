const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying CertificateRegistry...");
  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const CertificateRegistry = await ethers.getContractFactory(
    "CertificateRegistry"
  );
  const registry = await CertificateRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("\n✅ CertificateRegistry deployed to:", contractAddress);

  // Save deployment info for backend and frontend
  const deploymentInfo = {
    contractAddress,
    deployerAddress: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  // Write to blockchain/deployments/
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI to backend and frontend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
  );

  const backendAbiDir = path.join(__dirname, "../../backend/src/blockchain");
  const frontendAbiDir = path.join(__dirname, "../../frontend/src/blockchain");

  [backendAbiDir, frontendAbiDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Wait a moment for artifact to be written
  await new Promise((r) => setTimeout(r, 1000));

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiContent = JSON.stringify(
      { abi: artifact.abi, address: contractAddress },
      null,
      2
    );
    fs.writeFileSync(path.join(backendAbiDir, "CertificateRegistry.json"), abiContent);
    fs.writeFileSync(path.join(frontendAbiDir, "CertificateRegistry.json"), abiContent);
    console.log("✅ ABI copied to backend and frontend");
  }

  console.log("\nDeployment info saved to blockchain/deployments/deployment.json");
  console.log("\nNext steps:");
  console.log("  1. Update backend/.env: CONTRACT_ADDRESS=" + contractAddress);
  console.log("  2. Update frontend/.env: REACT_APP_CONTRACT_ADDRESS=" + contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
