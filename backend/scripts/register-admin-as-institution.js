#!/usr/bin/env node

/**
 * Register admin wallet as an institution
 * This allows the admin to issue certificates
 */

require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("../src/blockchain/CertificateRegistry.json").abi;

async function registerInstitution() {
  try {
    console.log("🔗 Connecting to blockchain...");
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

    console.log("✅ Connected");
    console.log(`   Admin wallet: ${wallet.address}`);
    console.log(`   Contract: ${process.env.CONTRACT_ADDRESS}\n`);

    // Check if already registered
    try {
      const institution = await contract.getInstitution(wallet.address);
      if (institution.isActive) {
        console.log("✅ Admin wallet is already registered as an active institution!");
        console.log(`   Name: ${institution.name}`);
        process.exit(0);
      }
    } catch (err) {
      // Not registered yet, continue
    }

    console.log("📝 Registering admin wallet as institution...");
    
    const tx = await contract.registerInstitution(
      wallet.address,
      "System Administrator"
    );
    console.log(`   Transaction sent: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`✅ Institution registered successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);
    
    // Verify
    const institution = await contract.getInstitution(wallet.address);
    console.log(`✅ Verification:`);
    console.log(`   Name: ${institution.name}`);
    console.log(`   Active: ${institution.isActive}`);
    console.log(`   Wallet: ${institution.wallet}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.reason) {
      console.error(`   Reason: ${err.reason}`);
    }
    process.exit(1);
  }
}

registerInstitution();
