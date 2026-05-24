#!/usr/bin/env node

/**
 * Sync issued certificates to blockchain
 * This script finds certificates that are marked as "issued" but not on blockchain,
 * and records them on the blockchain.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Certificate = require("../src/models/Certificate");
const { issueCertificateOnChain } = require("../src/utils/blockchain");

async function syncCertificates() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database\n");

    // Find issued certificates (including those marked as on chain but may be on old chain)
    const certificates = await Certificate.find({
      status: "issued",
    });

    if (certificates.length === 0) {
      console.log("❌ No issued certificates found!");
      process.exit(0);
    }

    console.log(`📋 Found ${certificates.length} issued certificate(s):\n`);

    let syncedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const cert of certificates) {
      console.log(`📄 Certificate: ${cert.certificateId}`);
      console.log(`   Student: ${cert.studentName}`);
      console.log(`   Course: ${cert.courseName}`);
      console.log(`   Institution: ${cert.institutionName}`);
      console.log(`   Current status: ${cert.isOnChain ? 'On chain' : 'Not on chain'}`);

      try {
        console.log(`   🔗 Recording on blockchain...`);

        const { txHash, blockNumber } = await issueCertificateOnChain({
          certificateId: cert.certificateId,
          certificateHash: cert.certificateHash,
          ownerWallet: cert.studentWallet,
          studentName: cert.studentName,
          courseName: cert.courseName,
          certificateTitle: cert.certificateTitle,
          graduationYear: cert.graduationYear,
        });

        // Update certificate
        cert.blockchainTxHash = txHash;
        cert.blockNumber = blockNumber;
        cert.isOnChain = true;
        await cert.save();

        console.log(`   ✅ Success! TX: ${txHash}`);
        console.log(`   Block: ${blockNumber}\n`);
        syncedCount++;
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}\n`);
        failedCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Sync completed!`);
    console.log(`   Synced: ${syncedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log("=".repeat(50));
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

syncCertificates();
