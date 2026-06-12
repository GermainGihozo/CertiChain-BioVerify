#!/usr/bin/env node

/**
 * Register all existing institutions from database onto the blockchain
 * Run this script after deploying the smart contract to sync existing data
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { ethers } = require("ethers");
const Institution = require("../src/models/Institution");
const contractABI = require("../src/blockchain/CertificateRegistry.json").abi;

async function registerInstitutions() {
  try {
    // Connect to MongoDB
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected\n");

    // Connect to blockchain
    console.log("🔗 Connecting to blockchain...");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    
    console.log("✅ Blockchain connected");
    console.log(`   Admin wallet: ${wallet.address}`);
    console.log(`   Contract: ${process.env.CONTRACT_ADDRESS}\n`);

    // Get all active institutions
    const institutions = await Institution.find({ isActive: true });
    console.log(`📊 Found ${institutions.length} active institution(s)\n`);

    if (institutions.length === 0) {
      console.log("⚠️  No institutions found in database");
      console.log("   Create an institution first through the API or admin panel\n");
      process.exit(0);
    }

    let registered = 0;
    let skipped = 0;
    let failed = 0;

    for (const inst of institutions) {
      console.log(`Processing: ${inst.name}`);
      console.log(`  Wallet: ${inst.walletAddress}`);

      // Check if already registered on chain
      try {
        const chainInst = await contract.getInstitution(inst.walletAddress);
        if (chainInst.isActive) {
          console.log(`  ✅ Already registered on blockchain`);
          
          // Update database if needed
          if (!inst.registeredOnChain) {
            inst.registeredOnChain = true;
            await inst.save();
            console.log(`  📝 Updated database record`);
          }
          
          skipped++;
          console.log();
          continue;
        }
      } catch (err) {
        // Not registered, continue to register
      }

      // Register on blockchain
      try {
        console.log(`  📝 Registering on blockchain...`);
        const tx = await contract.registerInstitution(
          inst.walletAddress,
          inst.name
        );
        console.log(`     Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`  ✅ Registered successfully!`);
        console.log(`     Block: ${receipt.blockNumber}`);
        console.log(`     Gas used: ${receipt.gasUsed.toString()}`);

        // Update database
        inst.registeredOnChain = true;
        inst.chainTxHash = receipt.hash;
        await inst.save();
        console.log(`  📝 Updated database record`);
        
        registered++;
      } catch (err) {
        console.error(`  ❌ Failed to register:`, err.message);
        if (err.reason) console.error(`     Reason: ${err.reason}`);
        failed++;
      }

      console.log();
    }

    console.log("═══════════════════════════════════════");
    console.log("📊 Summary:");
    console.log(`   Newly registered: ${registered}`);
    console.log(`   Already registered: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total processed: ${institutions.length}`);
    console.log("═══════════════════════════════════════\n");

    if (failed > 0) {
      console.log("⚠️  Some registrations failed. Check the errors above.");
      process.exit(1);
    }

    console.log("✅ All done!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

registerInstitutions();
