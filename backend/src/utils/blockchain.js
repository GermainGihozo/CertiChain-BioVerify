const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

let provider;
let contract;
let signer;

function getABI() {
  const abiPath = path.join(__dirname, "../blockchain/CertificateRegistry.json");
  if (!fs.existsSync(abiPath)) {
    throw new Error(
      "Contract ABI not found. Run: cd blockchain && npx hardhat run scripts/deploy.js"
    );
  }
  const abiData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  // Handle both formats: {abi, address} or just the abi array
  return {
    abi: abiData.abi || abiData,
    address: abiData.address || process.env.CONTRACT_ADDRESS
  };
}

function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    
    // For serverless environments, use StaticJsonRpcProvider with custom fetch
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // Use node's built-in fetch if available (Node 18+), otherwise ethers default
      const fetchFunc = global.fetch || undefined;
      provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { 
        staticNetwork: true,
        batchMaxCount: 1 // Disable batching which can cause issues in serverless
      });
    } else {
      provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    
    // Suppress connection errors in development
    provider.on("error", (error) => {
      if (process.env.NODE_ENV === "development") {
        logger.warn("Blockchain connection error (non-fatal):", error.message);
      }
    });
  }
  return provider;
}

function getContract(withSigner = false) {
  if (!contract) {
    const { abi, address } = getABI();
    const contractAddress = process.env.CONTRACT_ADDRESS || address;
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("CONTRACT_ADDRESS not configured");
    }
    contract = new ethers.Contract(contractAddress, abi, getProvider());
  }

  if (withSigner) {
    if (!signer) {
      const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("ADMIN_WALLET_PRIVATE_KEY not configured");
      }
      signer = new ethers.Wallet(privateKey, getProvider());
    }
    return contract.connect(signer);
  }

  return contract;
}

/**
 * Issue a certificate on-chain.
 */
async function issueCertificateOnChain(certData) {
  const c = getContract(true);
  const tx = await c.issueCertificate(
    certData.certificateId,
    certData.certificateHash,
    certData.ownerWallet,
    certData.studentName,
    certData.courseName,
    certData.certificateTitle,
    certData.graduationYear
  );
  const receipt = await tx.wait();
  logger.info(`Certificate issued on-chain: ${certData.certificateId}, tx: ${receipt.hash}`);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

/**
 * Verify a certificate on-chain.
 */
async function verifyCertificateOnChain(certId, certHash) {
  const c = getContract();
  const [valid, cert, instName] = await c.verifyCertificate(certId, certHash);
  return { valid, cert, instName };
}

/**
 * Get certificate from chain by ID.
 */
async function getCertificateFromChain(certId) {
  const c = getContract();
  const [cert, instName] = await c.getCertificate(certId);
  return { cert, instName };
}

/**
 * Register institution on-chain.
 */
async function registerInstitutionOnChain(walletAddress, name) {
  try {
    const c = getContract(true);
    
    // Set a reasonable gas limit to avoid estimation
    const tx = await c.registerInstitution(walletAddress, name, {
      gasLimit: 500000
    });
    
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    logger.info(`Institution registered on-chain: ${name}, tx: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (error) {
    logger.error(`Institution registration failed for ${name}:`, error.message);
    
    // Provide more helpful error message
    if (error.message.includes("already registered")) {
      throw new Error(`Institution ${name} is already registered on blockchain`);
    }
    
    throw error;
  }
}

/**
 * Revoke certificate on-chain.
 */
async function revokeCertificateOnChain(certId, reason) {
  const c = getContract(true);
  const tx = await c.revokeCertificate(certId, reason);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

module.exports = {
  getProvider,
  getContract,
  issueCertificateOnChain,
  verifyCertificateOnChain,
  getCertificateFromChain,
  registerInstitutionOnChain,
  revokeCertificateOnChain,
};
