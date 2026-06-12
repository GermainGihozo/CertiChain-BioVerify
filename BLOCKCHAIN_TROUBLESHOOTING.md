# Blockchain Integration Troubleshooting

## Current Status ✅

1. **Smart Contract Deployed**: `0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200` on Sepolia testnet
2. **Connection Test Passing**: `/api/blockchain/test-connection` returns success
3. **RPC Provider**: Infura Sepolia endpoint configured
4. **Issue**: Certificates approved but not recorded on blockchain

## Recent Fix Applied 🔧

**Fixed incorrect ABI path in `backend/src/utils/blockchain.js`**:
- Was looking for: `../blockchain/CertificateRegistry.json` 
- Actual location: `backend/src/blockchain/CertificateRegistry.json`
- Also updated `getABI()` to handle the JSON structure properly

## Vercel Environment Variables Required

Ensure these are set in your Vercel dashboard (Settings → Environment Variables):

### Backend Variables
```
CONTRACT_ADDRESS=0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200
RPC_URL=https://sepolia.infura.io/v3/1a35e74eece44db7b4d0a704eba2ff6c
ADMIN_WALLET_PRIVATE_KEY=0x9681a143f58a410354051ffcd047309d7e0241b84330b7fb0c96f304be50c911
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
WEBAUTHN_RP_NAME=CertChain
WEBAUTHN_RP_ID=certi-chain-bio-verify.vercel.app
WEBAUTHN_ORIGIN=https://certi-chain-bio-verify.vercel.app
FRONTEND_URL=https://certi-chain-bio-verify.vercel.app
NODE_ENV=production
```

### Frontend Variables
```
REACT_APP_API_URL=/api
REACT_APP_CONTRACT_ADDRESS=0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200
```

## Testing Steps 🧪

### 1. Redeploy to Vercel
After the code fix, you need to redeploy:
```bash
git add .
git commit -m "fix: correct blockchain ABI path for production"
git push origin main
```

Vercel will auto-deploy. Wait for deployment to complete.

### 2. Test Blockchain Connection
Visit: `https://certi-chain-bio-verify.vercel.app/api/blockchain/test-connection`

Expected response:
```json
{
  "success": true,
  "message": "Blockchain connection successful!",
  "rpcUrl": "https://sepolia.infura.io/v3/1...",
  "blockNumber": 11043184,
  "chainId": 11155111,
  "networkName": "sepolia",
  "contractAddress": "0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200",
  "hasPrivateKey": true
}
```

### 3. Approve a Certificate
1. Log in as admin at `https://certi-chain-bio-verify.vercel.app/admin`
2. Go to "Pending Approvals" section
3. Approve a certificate (one that has `status: "pending_admin"`)
4. Watch for the success message:
   - ✅ **Success**: "Certificate approved and recorded on blockchain ✓"
   - ⚠️ **Partial**: "Certificate approved (blockchain pending — node may be offline)"

### 4. Check Vercel Function Logs
If blockchain issuance fails:
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by: `POST /api/certificates/:id/approve`
3. Look for error messages from `issueCertificateOnChain()`

Common errors:
- `Contract ABI not found` → Fixed by recent code change
- `insufficient funds` → Wallet needs more Sepolia ETH
- `execution reverted` → Institution might need to be registered on blockchain first

## Potential Issues & Solutions 🔍

### Issue 1: Institution Not Registered on Blockchain ⭐ **MOST LIKELY**
**Symptom**: `execution reverted: Institution not registered`

This is the most common issue! The smart contract requires institutions to be registered on the blockchain before they can issue certificates.

**Solution Option A - Register All Existing Institutions**:
```bash
cd backend
node scripts/register-existing-institutions.js
```

**Solution Option B - Register Just the Admin Wallet**:
```bash
cd backend
node scripts/register-admin-as-institution.js
```

**Solution Option C - Register via API**:
When creating a new institution through the admin panel or API, it will automatically register on the blockchain. Existing institutions created before the smart contract deployment need to be registered manually using the scripts above.

**How to check if an institution is registered**:
1. Look in MongoDB for the institution document
2. Check the `registeredOnChain` field - should be `true`
3. Check the `chainTxHash` field - should have a transaction hash

### Issue 2: Insufficient Gas Fees
**Symptom**: Error mentions "insufficient funds" or gas

**Solution**: Add Sepolia ETH to admin wallet
```
Wallet Address: 0x221F7050DEf20B174BFD985269685030717f660F
Get testnet ETH: https://sepoliafaucet.com/
```

### Issue 3: Smart Contract Paused
**Symptom**: `execution reverted: EnforcedPause`

**Solution**: Contract admin needs to call `unpause()` function on the contract

### Issue 4: Wrong Private Key or Missing Permissions
**Symptom**: `AccessControlUnauthorizedAccount` or similar

**Check**:
- Verify `ADMIN_WALLET_PRIVATE_KEY` matches the deployer wallet
- Deployer address: `0x221F7050DEf20B174BFD985269685030717f660F`
- This wallet has ADMIN_ROLE on the contract

## Verification After Fix ✅

To confirm blockchain integration is working:

1. **Check Certificate in Database**: 
   - Look for `isOnChain: true`
   - Should have `blockchainTxHash` field populated
   - Should have `blockNumber` field populated

2. **Verify on Blockchain Explorer**:
   - Visit: `https://sepolia.etherscan.io/address/0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`
   - Check "Contract" → "Events" tab
   - Look for `CertificateIssued` events

3. **Frontend Verification**:
   - View the certificate details page
   - Should show: "✅ Blockchain Verified"
   - Should display transaction hash and block number
   - Should NOT show: "This certificate has not been recorded on the blockchain yet"

## Next Steps 📋

1. ✅ **Code Fixed**: ABI path corrected
2. ⏳ **Redeploy**: Push changes to trigger Vercel deployment
3. ⏳ **Test**: Approve a certificate after deployment
4. ⏳ **Verify**: Check certificate shows blockchain data
5. ⏳ **Monitor**: Watch Vercel logs for any errors

## Smart Contract Info 📜

- **Network**: Sepolia Testnet
- **Contract**: `0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`
- **Deployer**: `0x221F7050DEf20B174BFD985269685030717f660F`
- **Explorer**: https://sepolia.etherscan.io/address/0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200
- **RPC**: https://sepolia.infura.io/v3/1a35e74eece44db7b4d0a704eba2ff6c

## Important Security Notes 🔒

⚠️ **TESTNET ONLY**: The private key in this documentation is for testnet only and should be considered compromised since it's publicly visible. Never use this wallet for mainnet!

For production (mainnet):
1. Generate a NEW wallet with a secure private key
2. Store private key in Vercel environment variables ONLY
3. Never commit private keys to git
4. Use a hardware wallet for contract admin operations
