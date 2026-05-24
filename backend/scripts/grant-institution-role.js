#!/usr/bin/env node

/**
 * Grant INSTITUTION_ROLE to the admin wallet
 * This allows the admin to issue certificates directly
 */

require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("../src/blockchain/CertificateRegistry.json").abi;

async function grantRole() {
  try {
    console.log("🔗 Connecting to blockchain...");
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

    console.log("✅ Connected");
    console.log(`   Admin wallet: ${wallet.address}`);
    console.log(`   Contract: ${process.env.CONTRACT_ADDRESS}\n`);

    // Get the INSTITUTION_ROLE hash
    const INSTITUTION_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INSTITUTION_ROLE"));
    
    // Check if already has role
    const hasRole = await contract.hasRole(INSTITUTION_ROLE, wallet.address);
    
    if (hasRole) {
      console.log("✅ Admin wallet already has INSTITUTION_ROLE!");
      process.exit(0);
    }

    console.log("📝 Granting INSTITUTION_ROLE to admin wallet...");
    
    const tx = await contract.grantRole(INSTITUTION_ROLE, wallet.address);
    console.log(`   Transaction sent: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`✅ Role granted successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);
    
    // Verify
    const hasRoleNow = await contract.hasRole(INSTITUTION_ROLE, wallet.address);
    console.log(`✅ Verification: ${hasRoleNow ? "Role confirmed" : "Role not found"}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

grantRole();
