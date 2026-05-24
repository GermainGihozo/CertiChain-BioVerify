# Blockchain Sync Guide

## Problem

You have certificates marked as "issued" in the database, but they're not recorded on the blockchain. This happens when:
- Admin approved certificates while blockchain node was offline
- RPC connection failed during approval
- Contract deployment issues

## Solution

Use the sync script to record existing certificates on the blockchain.

---

## Prerequisites

You need ONE of these blockchain options running:

### Option 1: Local Hardhat Node (Development)

```bash
# Terminal 1: Start Hardhat node
cd blockchain
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Copy the contract address and update backend/.env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://127.0.0.1:8545
ADMIN_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Option 2: Polygon Mumbai Testnet (Recommended)

```bash
# Get Alchemy API key from https://www.alchemy.com/
# Deploy contract to Mumbai
cd blockchain
npx hardhat run scripts/deploy.js --network mumbai

# Update backend/.env
CONTRACT_ADDRESS=<your_deployed_address>
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
ADMIN_WALLET_PRIVATE_KEY=<your_wallet_private_key>
```

---

## Run Sync Script

Once blockchain is running:

```bash
cd backend

# Run sync script
node scripts/sync-blockchain.js
```

**Expected output:**
```
🔄 Connecting to database...
✅ Connected to database

📋 Found 1 certificate(s) to sync:

📄 Certificate: UR-2026-6867C4BD
   Student: IGIHOZO Ndahayo Germain
   Course: IT
   Institution: University of rwanda
   🔗 Recording on blockchain...
   ✅ Success! TX: 0x1234...
   Block: 12345

✅ Sync completed!
```

---

## Verify It Worked

After syncing, verify the certificate again:

1. Go to: http://localhost:3000/verify
2. Enter certificate ID: `UR-2026-6867C4BD`
3. You should now see: **"Certificate Verified ✓"** with green checkmark
4. Badge should show: **"Blockchain verified"**

---

## Troubleshooting

### Error: "Cannot connect to blockchain"

**Solution:** Make sure blockchain node is running
```bash
# Check if Hardhat node is running
curl http://127.0.0.1:8545

# Or check Alchemy connection
curl https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

### Error: "Contract not deployed"

**Solution:** Deploy the contract first
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
# or
npx hardhat run scripts/deploy.js --network mumbai
```

### Error: "Insufficient funds"

**Solution:** 
- **Local:** Use the default Hardhat account (has 10000 ETH)
- **Mumbai:** Get free test MATIC from https://faucet.polygon.technology/

### Error: "Invalid private key"

**Solution:** Check your `ADMIN_WALLET_PRIVATE_KEY` in `.env`
- Must start with `0x`
- Must be 64 hex characters (66 with 0x prefix)

---

## Alternative: Accept Database-Only Verification

If you don't want to set up blockchain right now:

**Current behavior is fine!**
- Certificates show as "Database verified ✓"
- Amber warning explains blockchain is unavailable
- All certificate details are displayed
- Good for development/testing

You can set up blockchain later when deploying to production.

---

## For Production (Vercel Deployment)

When deploying to Vercel:
1. Use Alchemy or Infura (free tier available)
2. Deploy contract to Polygon Mumbai (testnet) or Polygon Mainnet (production)
3. Set environment variables in Vercel dashboard
4. Run sync script locally before going live

---

## Summary

**Quick Fix (5 minutes):**
```bash
# Start local blockchain
cd blockchain && npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Sync certificates
cd ../backend && node scripts/sync-blockchain.js
```

**Or just accept database-only verification for now!** ✅
