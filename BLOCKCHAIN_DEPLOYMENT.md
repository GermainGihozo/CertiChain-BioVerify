# 🔗 Blockchain Deployment Guide

## Current Issue

Your app is trying to connect to `localhost:8545` which doesn't exist in production. You need to deploy your smart contract to a public blockchain network.

## Recommended Solution: Deploy to Sepolia Testnet

### Step 1: Get Sepolia ETH (Free)

1. Get a wallet address from MetaMask
2. Get free Sepolia ETH from faucets:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

### Step 2: Get Alchemy/Infura API Key

**Option A: Alchemy (Recommended)**
1. Go to https://www.alchemy.com/
2. Sign up for free
3. Create a new app
4. Select **Ethereum** → **Sepolia**
5. Copy your API key

**Option B: Infura**
1. Go to https://infura.io/
2. Sign up for free
3. Create new project
4. Copy your Project ID

### Step 3: Update Backend Environment Variables

Add these to your local `backend/.env`:

```env
# Blockchain - Sepolia Testnet
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# OR if using Infura:
# RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

ADMIN_WALLET_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_METAMASK
CONTRACT_ADDRESS=   # Leave empty, will be filled after deployment
```

⚠️ **Security Warning:** Never commit your private key to GitHub!

### Step 4: Deploy Smart Contract to Sepolia

```bash
cd blockchain
npm install

# Update hardhat.config.js to include Sepolia network
# Then deploy:
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, you'll get a contract address. Copy it!

### Step 5: Update Vercel Environment Variables

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. Add these for **Production**:

```
CONTRACT_ADDRESS=0xYourDeployedContractAddress

RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

ADMIN_WALLET_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

3. Click **Save**
4. **Redeploy** your application

### Step 6: Update Frontend Contract Address

Update `frontend/.env.production`:

```env
REACT_APP_API_URL=/api
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Commit and push to trigger redeployment.

---

## Alternative: Polygon Mumbai Testnet (Faster & Free)

Mumbai is faster and has free MATIC tokens.

### Get Mumbai MATIC
https://faucet.polygon.technology/

### RPC URL
```
https://rpc-mumbai.maticvigil.com/
# OR
https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

### Deploy to Mumbai
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

---

## Option 2: Disable Blockchain Verification (Quick Fix)

If you don't need blockchain verification right now, you can temporarily disable it:

### Update Backend Code

Edit `backend/src/controllers/certificate.controller.js` to skip blockchain calls in production or handle errors gracefully.

---

## Testing Blockchain Connection

After setting up, test with:

```bash
cd backend
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
provider.getBlockNumber().then(n => console.log('Connected! Block:', n));
"
```

---

## Hardhat Config Example

`blockchain/hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## Summary

1. ✅ Deploy smart contract to Sepolia or Mumbai testnet
2. ✅ Get contract address from deployment
3. ✅ Update `CONTRACT_ADDRESS` and `RPC_URL` in Vercel
4. ✅ Update frontend `.env.production` with contract address
5. ✅ Redeploy application
6. ✅ Test certificate issuance

Once deployed, certificates will be recorded on the blockchain and publicly verifiable! 🔗✨
