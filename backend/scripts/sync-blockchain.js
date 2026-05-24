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

    // Find issued certificates not on blockchain
    const certificates = await Certificate.find({
      status: "issued",
      isOnChain: { $ne: true },
    });

    if (certificates.length === 0) {
      console.log("✅ All issued certificates are already on blockchain!");
      process.exit(0);
    }

    console.log(`📋 Found ${certificates.length} certificate(s) to sync:\n`);

    for (const cert of certificates) {
      console.log(`📄 Certificate: ${cert.certificateId}`);
      console.log(`   Student: ${cert.studentName}`);
      console.log(`   Course: ${cert.courseName}`);
      console.log(`   Institution: ${cert.institutionName}`);

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
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}\n`);
      }
    }

    console.log("✅ Sync completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

syncCertificates();
