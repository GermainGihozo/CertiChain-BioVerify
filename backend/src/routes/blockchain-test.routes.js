const router = require("express").Router();
const { ethers } = require("ethers");

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

module.exports = router;
