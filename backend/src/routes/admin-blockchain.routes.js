const router = require("express").Router();
const { ethers } = require("ethers");
const Institution = require("../models/Institution");
const { authenticate, requireRole } = require("../middleware/auth");

/**
 * POST /api/admin/blockchain/register-institutions
 * Admin-only endpoint to register all institutions on blockchain
 */
router.post("/register-institutions", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const contractABI = require("../blockchain/CertificateRegistry.json").abi;
    
    // Connect to blockchain with explicit fetch options
    const fetchRequest = new ethers.FetchRequest(process.env.RPC_URL);
    fetchRequest.timeout = 30000; // 30 second timeout
    fetchRequest.setHeader("Content-Type", "application/json");
    
    const provider = new ethers.JsonRpcProvider(fetchRequest);
    const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    
    const balance = await provider.getBalance(wallet.address);
    
    if (balance === 0n) {
      return res.status(400).json({
        error: "Insufficient funds",
        message: "Admin wallet has 0 ETH. Get Sepolia ETH from https://sepoliafaucet.com/",
        wallet: wallet.address
      });
    }

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

      try {
        // Check if already registered on chain - wrap in try/catch with detailed error
        let isRegistered = false;
        try {
          const chainInst = await contract.getInstitution(inst.walletAddress);
          isRegistered = chainInst.isActive;
        } catch (checkErr) {
          // If error is "call revert exception", institution doesn't exist - that's fine
          if (!checkErr.message.includes("call revert")) {
            throw checkErr; // Re-throw other errors
          }
        }
        
        if (isRegistered) {
          result.status = "already_registered";
          
          // Update database if needed
          if (!inst.registeredOnChain) {
            inst.registeredOnChain = true;
            await inst.save();
            result.status = "already_registered_db_updated";
          }
          
          skipped++;
          results.push(result);
          continue;
        }

        // Register on blockchain
        const tx = await contract.registerInstitution(
          inst.walletAddress,
          inst.name,
          { gasLimit: 500000 } // Use fixed gas limit to avoid estimation issues
        );
        
        const receipt = await tx.wait(1); // Wait for 1 confirmation
        
        // Update database
        inst.registeredOnChain = true;
        inst.chainTxHash = receipt.hash;
        await inst.save();
        
        result.status = "registered";
        result.txHash = receipt.hash;
        result.blockNumber = receipt.blockNumber;
        registered++;
      } catch (err) {
        result.status = "failed";
        result.error = err.message || String(err);
        
        if (err.reason) result.error += ` (${err.reason})`;
        if (err.code) result.error += ` [${err.code}]`;
        
        // More helpful error messages
        if (err.message.includes("insufficient funds")) {
          result.error = "Insufficient funds for gas";
          result.solution = "Get Sepolia ETH from https://sepoliafaucet.com/";
        }
        
        failed++;
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
      results,
      adminWallet: wallet.address,
      balance: ethers.formatEther(balance) + " ETH"
    });
  } catch (err) {
    res.status(500).json({
      error: "Registration failed",
      message: err.message || String(err),
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
