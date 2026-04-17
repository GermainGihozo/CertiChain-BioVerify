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
  return JSON.parse(fs.readFileSync(abiPath, "utf8"));
}

function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    provider = new ethers.JsonRpcProvider(rpcUrl);
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
  const c = getContract(true);
  const tx = await c.registerInstitution(walletAddress, name);
  const receipt = await tx.wait();
  logger.info(`Institution registered on-chain: ${name}, tx: ${receipt.hash}`);
  return { txHash: receipt.hash };
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
