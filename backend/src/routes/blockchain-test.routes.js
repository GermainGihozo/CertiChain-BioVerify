const router = require("express").Router();
const { ethers } = require("ethers");
const Institution = require("../models/Institution");

// Test blockchain connection
router.get("/test-connection", async (req, res) => {
  try {
    const rpcUrl = process.env.RPC_URL;
    
    if (!rpcUrl) {
      return res.status(500).json({
        error: "RPC_URL not configured",
        env: process.env.NODE_ENV
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    
    res.json({
      success: true,
      message: "Blockchain connection successful!",
      rpcUrl: rpcUrl.substring(0, 30) + "...",
      blockNumber,
      chainId: Number(network.chainId),
      networkName: network.name,
      contractAddress: process.env.CONTRACT_ADDRESS,
      hasPrivateKey: !!process.env.ADMIN_WALLET_PRIVATE_KEY
    });
  } catch (error) {
    res.status(500).json({
      error: "Blockchain connection failed",
      message: error.message,
      rpcUrl: process.env.RPC_URL ? process.env.RPC_URL.substring(0, 30) + "..." : "NOT SET"
    });
  }
});

// Check institution blockchain registration status
router.get("/check-institutions", async (req, res) => {
  try {
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!rpcUrl || !contractAddress) {
      return res.status(500).json({
        error: "Blockchain not configured",
        missingVars: {
          rpcUrl: !rpcUrl,
          contractAddress: !contractAddress
        }
      });
    }

    // Get contract ABI
    const contractABI = require("../blockchain/CertificateRegistry.json").abi;
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Get all active institutions from database
    const institutions = await Institution.find({ isActive: true })
      .select('name walletAddress registeredOnChain chainTxHash')
      .lean();
    
    // Check each one on the blockchain
    const results = [];
    for (const inst of institutions) {
      try {
        const chainInst = await contract.getInstitution(inst.walletAddress);
        results.push({
          name: inst.name,
          wallet: inst.walletAddress,
          dbStatus: inst.registeredOnChain ? "✅ Marked as registered" : "⚠️ NOT marked as registered",
          chainStatus: chainInst.isActive ? "✅ Active on blockchain" : "❌ Not active on blockchain",
          synced: inst.registeredOnChain === chainInst.isActive,
          chainTxHash: inst.chainTxHash || null
        });
      } catch (err) {
        results.push({
          name: inst.name,
          wallet: inst.walletAddress,
          dbStatus: inst.registeredOnChain ? "✅ Marked as registered" : "⚠️ NOT marked as registered",
          chainStatus: "❌ Not found on blockchain",
          synced: false,
          error: err.message
        });
      }
    }
    
    const allSynced = results.every(r => r.synced);
    
    res.json({
      success: true,
      allSynced,
      institutionCount: results.length,
      institutions: results,
      recommendation: allSynced 
        ? "✅ All institutions are properly registered!" 
        : "⚠️ Run: cd backend && node scripts/register-existing-institutions.js"
    });
  } catch (error) {
    res.status(500).json({
      error: "Check failed",
      message: error.message
    });
  }
});

module.exports = router;
