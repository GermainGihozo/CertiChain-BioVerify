# Register Institutions via API 🚀

Since running the local script has network issues connecting to MongoDB Atlas, I've created an **API endpoint** that runs on Vercel (in production) where it can access the production database.

## Step 1: Wait for Deployment ⏱️

The code has been pushed to GitHub. Wait 1-2 minutes for Vercel to complete the deployment.

Check deployment status: https://vercel.com/dashboard

## Step 2: Get Your Admin Token 🔑

You need to be logged in as admin to call this endpoint.

### Option A: Use Browser Console
1. Go to: https://certi-chain-bio-verify.vercel.app/admin
2. Log in as admin
3. Open browser console (F12)
4. Type: `localStorage.getItem('token')`
5. Copy the token (without quotes)

### Option B: Login via API
```bash
curl -X POST https://certi-chain-bio-verify.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@certchain.com","password":"YOUR_PASSWORD"}'
```

The response will contain a `token` field - copy that value.

## Step 3: Call the Registration Endpoint 📞

### Using curl (Command Line):
```bash
curl -X POST https://certi-chain-bio-verify.vercel.app/api/admin/blockchain/register-institutions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Using Postman:
- **Method**: POST
- **URL**: `https://certi-chain-bio-verify.vercel.app/api/admin/blockchain/register-institutions`
- **Headers**:
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body**: (empty)

### Using Browser Fetch (Console):
```javascript
fetch('https://certi-chain-bio-verify.vercel.app/api/admin/blockchain/register-institutions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

## Expected Response ✅

### Success:
```json
{
  "success": true,
  "message": "Registered 3, Skipped 0, Failed 0",
  "summary": {
    "registered": 3,
    "skipped": 0,
    "failed": 0,
    "total": 3
  },
  "results": [
    {
      "name": "UR",
      "wallet": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "registered",
      "txHash": "0xabc123...",
      "blockNumber": 11043305
    },
    {
      "name": "university of kigali",
      "wallet": "0xe97c63907e2465c9f4680b7f7bc70ad1c540f9c5",
      "status": "registered",
      "txHash": "0xdef456...",
      "blockNumber": 11043306
    },
    {
      "name": "UTAB",
      "wallet": "0x221f7050def20b174bfd985269685030717f660f",
      "status": "registered",
      "txHash": "0xghi789...",
      "blockNumber": 11043307
    }
  ],
  "adminWallet": "0x221F7050DEf20B174BFD985269685030717f660F",
  "balance": "2.661 ETH"
}
```

### If Already Registered:
```json
{
  "success": true,
  "message": "Registered 0, Skipped 3, Failed 0",
  "summary": {
    "registered": 0,
    "skipped": 3,
    "failed": 0,
    "total": 3
  },
  "results": [
    {
      "name": "UR",
      "wallet": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "already_registered"
    },
    ...
  ]
}
```

### If Insufficient Funds:
```json
{
  "error": "Insufficient funds",
  "message": "Admin wallet has 0 ETH. Get Sepolia ETH from https://sepoliafaucet.com/",
  "wallet": "0x221F7050DEf20B174BFD985269685030717f660F"
}
```

## Step 4: Verify Registration ✔️

After successful registration, check:
```
https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions
```

All institutions should now show:
- `dbStatus`: "✅ Marked as registered"
- `chainStatus`: "✅ Active on blockchain"
- `synced`: true

## Step 5: Test Certificate Approval 🎓

Now you can approve certificates and they will be recorded on the blockchain!

1. Go to: https://certi-chain-bio-verify.vercel.app/admin
2. Navigate to "Pending Approvals"
3. Approve a certificate
4. Look for: **"Certificate approved and recorded on blockchain ✓"**

## Troubleshooting 🔧

### Error: "Unauthorized" or 401
- Your token has expired
- Log in again and get a new token

### Error: "Insufficient funds"
- Your admin wallet needs Sepolia ETH
- Get free ETH: https://sepoliafaucet.com/
- Wallet: `0x221F7050DEf20B174BFD985269685030717f660F`

### Error: "AccessControlUnauthorizedAccount"
- The private key doesn't have admin role on the contract
- Verify the deployer address matches

### No Response or Timeout
- Vercel function might still be cold starting
- Wait a few seconds and try again

## Quick Copy-Paste Commands 📋

### Check current status:
```bash
curl https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions
```

### Register (replace YOUR_TOKEN):
```bash
curl -X POST https://certi-chain-bio-verify.vercel.app/api/admin/blockchain/register-institutions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## What This Endpoint Does 🔍

1. Connects to your production MongoDB Atlas database
2. Finds all active institutions
3. Checks if each is already registered on the blockchain
4. Registers any that aren't registered yet
5. Updates the database with transaction hashes
6. Returns a detailed report

## Next Steps After Registration ✨

Once all institutions are registered:

1. ✅ Approve certificates - they'll be recorded on blockchain
2. ✅ View certificate details - they'll show blockchain info
3. ✅ Verify on Etherscan - you'll see transaction events
4. ✅ No more "not recorded on blockchain" warnings!

---

**Estimated Time**: 2-5 minutes per institution (depending on gas prices)
**Cost**: FREE (using testnet Sepolia ETH)
