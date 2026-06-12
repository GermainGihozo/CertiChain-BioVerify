const router = require("express").Router();
const { ethers } = require("ethers");
const Institution = require("../models/Institution");
const { auth, requireRole } = require("../middleware/auth");

/**
 * POST /api/admin/blockchain/register-institutions
 * Admin-only endpoint to register all institutions on blockchain
 */
router.post("/register-institutions", auth, requireRole("admin"), async (req, res) => {
  try {
    const contractABI = require("../blockchain/CertificateRegistry.json").abi;
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
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
        // Check if already registered on chain
        const chainInst = await contract.getInstitution(inst.walletAddress);
        if (chainInst.isActive) {
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
      } catch (err) {
        // Not registered, continue to register
      }

      // Register on blockchain
      try {
        const gasEstimate = await contract.registerInstitution.estimateGas(
          inst.walletAddress,
          inst.name
        );
        
        const tx = await contract.registerInstitution(
          inst.walletAddress,
          inst.name,
          { gasLimit: gasEstimate * 120n / 100n }
        );
        
        const receipt = await tx.wait();
        
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
        result.error = err.message;
        
        if (err.reason) result.error += ` (${err.reason})`;
        
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
      message: err.message
    });
  }
});

module.exports = router;
