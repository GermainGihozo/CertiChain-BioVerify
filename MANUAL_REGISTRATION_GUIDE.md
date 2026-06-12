# Manual Institution Registration Guide

Since ethers.js is having issues in the Vercel serverless environment, let's register the institutions manually using MetaMask or a similar wallet.

## Option 1: Use MetaMask + Etherscan (Easiest) ✅

### Step 1: Import Your Admin Wallet to MetaMask

1. Open MetaMask
2. Click your account icon → "Import Account"
3. Select "Private Key"
4. Paste: `0x9681a143f58a410354051ffcd047309d7e0241b84330b7fb0c96f304be50c911`
5. Click "Import"

**⚠️ Remember: This is a TESTNET wallet only!**

### Step 2: Connect to Sepolia Network

1. In MetaMask, click the network dropdown
2. Enable "Show test networks" if needed
3. Select "Sepolia test network"
4. Verify you have ~2.66 ETH

### Step 3: Register Each Institution via Etherscan

Go to the contract on Etherscan:
https://sepolia.etherscan.io/address/0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200#writeContract

For each institution:

#### Institution 1: UR
1. Click "Connect to Web3" and connect MetaMask
2. Find function #6: `registerInstitution`
3. Enter:
   - `institutionWallet`: `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`
   - `name`: `UR`
4. Click "Write"
5. Confirm in MetaMask
6. Wait for confirmation

#### Institution 2: university of kigali  
1. Find function #6: `registerInstitution`
2. Enter:
   - `institutionWallet`: `0xe97c63907e2465c9f4680b7f7bc70ad1c540f9c5`
   - `name`: `university of kigali`
3. Click "Write"
4. Confirm in MetaMask
5. Wait for confirmation

#### Institution 3: UTAB
1. Find function #6: `registerInstitution`
2. Enter:
   - `institutionWallet`: `0x221f7050def20b174bfd985269685030717f660f`
   - `name`: `UTAB`
3. Click "Write"
4. Confirm in MetaMask
5. Wait for confirmation

### Step 4: Update Database

After registering on blockchain, update the database. Run this in browser console while logged in as admin:

```javascript
// Update UR
fetch('https://certi-chain-bio-verify.vercel.app/api/institutions', {
  method: 'GET',
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
.then(r => r.json())
.then(data => console.log(data))
```

You'll need to manually mark them as registered in MongoDB Atlas or create an admin endpoint to do it.

---

## Option 2: Use Remix IDE (Alternative)

1. Go to https://remix.ethereum.org
2. Create a new file with your contract ABI
3. Deploy → "At Address" → Paste contract address
4. Call `registerInstitution` for each institution

---

## Option 3: Run Script Locally with Production MongoDB (Advanced)

Since the local script worked except for MongoDB connection, let's fix that:

### Step 1: Update Your Hosts File (Windows)

Add this line to `C:\Windows\System32\drivers\etc\hosts`:
```
8.8.8.8 cluster0.rsjqk4w.mongodb.net
```

### Step 2: Run the Production Script

```bash
cd backend
node scripts/register-institutions-production.js
```

---

## Verification

After registration (any method), verify:

```
https://certi-chain-bio-verify.vercel.app/api/blockchain/check-institutions
```

Should show all institutions as registered!

---

## Recommended: Use MetaMask + Etherscan

This is the **easiest and most reliable** method. Takes about 5-10 minutes total.

**Cost**: FREE (using testnet ETH you already have)
