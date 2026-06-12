# Blockchain Deployment Checklist ✅

Follow these steps in order to complete the blockchain integration.

## Step 1: Commit and Deploy Code Changes 🚀

The blockchain ABI path has been fixed. Deploy the changes:

```bash
git add .
git commit -m "fix: correct blockchain ABI path and add institution check endpoint"
git push origin main
```

Wait for Vercel to complete the deployment (usually 1-2 minutes).

## Step 2: Verify Blockchain Connection 🔗

After deployment, test the blockchain connection:

**Visit**: `https://certi-chain-bio-verify.vercel.app/api/blockchain/test-connection`

**Expected Response**:
```json
{
  "success": true,
  "message": "Blockchain connection successful!",
  "blockNumber": 11043XXX,
  "chainId": 11155111,
  "contractAddress": "0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200"
}
```

✅ **If successful, proceed to Step 3**
❌ **If failed, check Vercel environment variables**

## Step 3: Check Institution Registration Status 🏛️

**Visit**: `https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions`

This will show you which institutions exist in your database and whether they're registered on the blockchain.

**Example Response**:
```json
{
  "success": true,
  "allSynced": false,
  "institutionCount": 1,
  "institutions": [
    {
      "name": "System Administrator",
      "wallet": "0x221f7050def20b174bfd985269685030717f660f",
      "dbStatus": "⚠️ NOT marked as registered",
      "chainStatus": "❌ Not found on blockchain",
      "synced": false
    }
  ],
  "recommendation": "⚠️ Run: cd backend && node scripts/register-existing-institutions.js"
}
```

## Step 4: Register Institutions on Blockchain 📝

### Option A: Register All Institutions (Recommended)

If you have institutions in your database that need blockchain registration:

```bash
cd backend
node scripts/register-existing-institutions.js
```

**This script will**:
- Connect to your MongoDB
- Find all active institutions
- Register each one on the Sepolia blockchain
- Update the database with transaction hashes

### Option B: Register Only Admin Wallet

If you just want to register the admin wallet as an institution:

```bash
cd backend
node scripts/register-admin-as-institution.js
```

### Important Notes:
- Your admin wallet needs Sepolia ETH for gas fees
- Check balance at: https://sepolia.etherscan.io/address/0x221F7050DEf20B174BFD985269685030717f660F
- Get free Sepolia ETH: https://sepoliafaucet.com/

## Step 5: Verify Registration ✅

After running the registration script, check again:

**Visit**: `https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions`

**Expected Response**:
```json
{
  "success": true,
  "allSynced": true,
  "institutionCount": 1,
  "institutions": [
    {
      "name": "System Administrator",
      "wallet": "0x221f7050def20b174bfd985269685030717f660f",
      "dbStatus": "✅ Marked as registered",
      "chainStatus": "✅ Active on blockchain",
      "synced": true,
      "chainTxHash": "0xabc123..."
    }
  ],
  "recommendation": "✅ All institutions are properly registered!"
}
```

## Step 6: Test Certificate Issuance 🎓

Now test the full certificate flow:

1. **Log in as admin**: `https://certi-chain-bio-verify.vercel.app/admin`
2. **Go to Pending Approvals**: Look for certificates with status "pending_admin"
3. **Approve a certificate**: Click the approve button
4. **Check the response**:
   - ✅ Success: "Certificate approved and recorded on blockchain ✓"
   - ❌ Error: Check Vercel logs for details

## Step 7: Verify on Blockchain Explorer 🔍

After approving a certificate, verify it was recorded on the blockchain:

1. **Copy the transaction hash** from the certificate details
2. **Visit Sepolia Etherscan**: `https://sepolia.etherscan.io/tx/[TRANSACTION_HASH]`
3. **Check the contract events**: 
   - Go to: https://sepolia.etherscan.io/address/0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200#events
   - Look for `CertificateIssued` events

## Step 8: Test Frontend Display 🖥️

1. **View certificate details** in the student or admin portal
2. **Check for blockchain information**:
   - Should show: "✅ Blockchain Verified"
   - Should display transaction hash
   - Should display block number
   - Should NOT show: "This certificate has not been recorded on the blockchain yet"

## Troubleshooting 🔧

### If Step 2 fails (Connection Test):
- Check Vercel environment variables
- Ensure `RPC_URL` is set correctly
- Ensure `CONTRACT_ADDRESS` is set correctly

### If Step 4 fails (Registration):
**Error: "insufficient funds"**
- Admin wallet needs Sepolia ETH
- Get free ETH: https://sepoliafaucet.com/

**Error: "AccessControlUnauthorizedAccount"**
- The private key doesn't match the deployer wallet
- The deployer wallet must be: `0x221F7050DEf20B174BFD985269685030717f660F`

**Error: "nonce has already been used"**
- Wait a few seconds and try again
- Blockchain transactions can take time to process

### If Step 6 fails (Certificate Approval):
1. **Check Vercel function logs**:
   - Go to Vercel Dashboard → Logs
   - Filter by: `POST /api/certificates/:id/approve`
   
2. **Common errors**:
   - "Institution not registered": Go back to Step 4
   - "insufficient funds": Add Sepolia ETH to wallet
   - "execution reverted": Check contract is not paused

### If institutions already exist but weren't registered:
This is expected! Institutions created before deploying the smart contract need to be registered retroactively using the scripts in Step 4.

## Environment Variables Checklist 📋

Ensure these are set in Vercel (Settings → Environment Variables):

### Backend
- ✅ `CONTRACT_ADDRESS=0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`
- ✅ `RPC_URL=https://sepolia.infura.io/v3/1a35e74eece44db7b4d0a704eba2ff6c`
- ✅ `ADMIN_WALLET_PRIVATE_KEY=0x9681...` (full key)
- ✅ `MONGODB_URI=mongodb+srv://...`
- ✅ `JWT_SECRET=your_secret`
- ✅ `WEBAUTHN_RP_ID=certi-chain-bio-verify.vercel.app`
- ✅ `WEBAUTHN_ORIGIN=https://certi-chain-bio-verify.vercel.app`
- ✅ `NODE_ENV=production`

### Frontend
- ✅ `REACT_APP_API_URL=/api`
- ✅ `REACT_APP_CONTRACT_ADDRESS=0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`

## Success Indicators ✨

You'll know everything is working when:

1. ✅ `/api/blockchain/test-connection` returns success
2. ✅ `/api/blockchain/check-institutions` shows all institutions synced
3. ✅ Certificate approval shows "recorded on blockchain"
4. ✅ Certificate details show blockchain transaction hash
5. ✅ Etherscan shows `CertificateIssued` events
6. ✅ Frontend displays "Blockchain Verified" badge

## Quick Reference 📚

**Contract Address**: `0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`
**Network**: Sepolia Testnet (Chain ID: 11155111)
**Explorer**: https://sepolia.etherscan.io/address/0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200
**RPC**: https://sepolia.infura.io/v3/1a35e74eece44db7b4d0a704eba2ff6c
**Admin Wallet**: `0x221F7050DEf20B174BFD985269685030717f660F`

## Need Help? 🆘

If you encounter issues not covered here:

1. Check Vercel function logs for detailed error messages
2. Verify your wallet has Sepolia ETH
3. Confirm all environment variables are set
4. Try the test endpoints to narrow down the issue
5. Check the transaction on Etherscan to see if it succeeded
