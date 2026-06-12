const router = require("express").Router();
const { ethers } = require("ethers");
const Institution = require("../models/Institution");
const { authenticate, requireRole } = require("../middleware/auth");
const { registerInstitutionOnChain } = require("../utils/blockchain");

/**
 * POST /api/admin/blockchain/register-institutions
 * Admin-only endpoint to register all institutions on blockchain
 */
router.post("/register-institutions", authenticate, requireRole("admin"), async (req, res) => {
  try {
    // Get all active institutions
    const institutions = await Institution.find({ isActive: true });
    
    if (institutions.length === 0) {
      return res.json({
        message: "No institutions found",
        registered: 0,
        skipped: 0,
        failed: 0
      });
    }

    const results = [];
    let registered = 0;
    let skipped = 0;
    let failed = 0;

    for (const inst of institutions) {
      const result = {
        name: inst.name,
        wallet: inst.walletAddress,
        status: "",
        txHash: null,
        error: null
      };

      // Skip if already marked as registered
      if (inst.registeredOnChain) {
        result.status = "already_registered_in_db";
        skipped++;
        results.push(result);
        continue;
      }

      // Try to register on blockchain
      try {
        const { txHash } = await registerInstitutionOnChain(
          inst.walletAddress,
          inst.name
        );
        
        // Update database
        inst.registeredOnChain = true;
        inst.chainTxHash = txHash;
        await inst.save();
        
        result.status = "registered";
        result.txHash = txHash;
        registered++;
      } catch (err) {
        result.status = "failed";
        result.error = err.message || String(err);
        
        // Check if it's already registered error
        if (err.message.includes("already registered") || err.message.includes("AlreadyRegistered")) {
          result.status = "already_registered_on_chain";
          
          // Update DB to reflect this
          inst.registeredOnChain = true;
          await inst.save();
          
          skipped++;
        } else {
          failed++;
        }
      }

      results.push(result);
    }

    res.json({
      success: failed === 0,
      message: `Registered ${registered}, Skipped ${skipped}, Failed ${failed}`,
      summary: {
        registered,
        skipped,
        failed,
        total: institutions.length
      },
      results
    });
  } catch (err) {
    res.status(500).json({
      error: "Registration failed",
      message: err.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
