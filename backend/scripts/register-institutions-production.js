#!/usr/bin/env node

/**
 * Register all existing institutions from PRODUCTION database onto the blockchain
 * This uses the production MongoDB Atlas database
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { ethers } = require("ethers");
const Institution = require("../src/models/Institution");
const contractABI = require("../src/blockchain/CertificateRegistry.json").abi;

// PRODUCTION MongoDB URI
const PRODUCTION_MONGODB_URI = "mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority";

async function registerInstitutions() {
  try {
    // Connect to PRODUCTION MongoDB
    console.log("📦 Connecting to PRODUCTION MongoDB Atlas...");
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log("✅ MongoDB connected\n");

    // Connect to blockchain
    console.log("🔗 Connecting to blockchain...");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("✅ Blockchain connected");
    console.log(`   Admin wallet: ${wallet.address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`   Contract: ${process.env.CONTRACT_ADDRESS}\n`);

    if (balance === 0n) {
      console.log("⚠️  WARNING: Wallet has 0 ETH!");
      console.log("   You need Sepolia ETH to register institutions.");
      console.log("   Get free ETH: https://sepoliafaucet.com/\n");
    }

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
        
        // Estimate gas first
        const gasEstimate = await contract.registerInstitution.estimateGas(
          inst.walletAddress,
          inst.name
        );
        console.log(`     Estimated gas: ${gasEstimate.toString()}`);
        
        const tx = await contract.registerInstitution(
          inst.walletAddress,
          inst.name,
          { gasLimit: gasEstimate * 120n / 100n } // Add 20% buffer
        );
        console.log(`     Transaction: ${tx.hash}`);
        
        console.log(`  ⏳ Waiting for confirmation...`);
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
        if (err.code) console.error(`     Code: ${err.code}`);
        
        // More helpful error messages
        if (err.message.includes("insufficient funds")) {
          console.error(`     💡 Solution: Get Sepolia ETH from https://sepoliafaucet.com/`);
        } else if (err.message.includes("nonce")) {
          console.error(`     💡 Solution: Wait a few seconds and try again`);
        }
        
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
    console.log("Next step: Visit https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions");
    console.log("           to verify all institutions are synced.\n");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    if (err.stack) {
      console.error("\nStack trace:");
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

registerInstitutions();
