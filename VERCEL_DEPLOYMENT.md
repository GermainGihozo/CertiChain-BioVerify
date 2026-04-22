# 🚀 Vercel + MongoDB Atlas Deployment Guide

Complete guide to deploy CertiChain-BioVerify to Vercel with MongoDB Atlas.

## ✅ Prerequisites

- [x] MongoDB Atlas cluster created
- [ ] Vercel account (free tier available)
- [ ] GitHub repository
- [ ] Blockchain RPC provider (Alchemy/Infura)
- [ ] Smart contract deployed

---

## Part 1: MongoDB Atlas Setup (Already Done ✓)

You've already completed this! Your connection string:
```
mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/
```

### Additional MongoDB Atlas Configuration:

1. **Whitelist All IPs** (for Vercel):
   - Go to Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

2. **Create Database**:
   - Go to "Browse Collections"
   - Click "Add My Own Data"
   - Database name: `certchain`
   - Collection name: `users`

---

## Part 2: Deploy Smart Contract

Before deploying the application, deploy your smart contract to a testnet.

### Option A: Polygon Mumbai (Recommended for Testing)

```bash
cd blockchain
npm install

# Get Alchemy API key from https://www.alchemy.com/
# Create a new app for Polygon Mumbai

# Edit hardhat.config.js - add network configuration
```

**hardhat.config.js:**
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
};
```

**Create blockchain/.env:**
```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_here
```

**Deploy:**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

**Save the contract address!** You'll need it for environment variables.

---

## Part 3: Deploy Backend to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Backend

```bash
cd backend
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** certchain-backend
- **Directory?** ./
- **Override settings?** No

### Step 4: Configure Environment Variables

After deployment, go to your Vercel dashboard or use CLI:

```bash
# Set environment variables
vercel env add MONGODB_URI production
# Paste: mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

vercel env add JWT_SECRET production
# Generate with: openssl rand -base64 64
# Paste the generated secret

vercel env add CONTRACT_ADDRESS production
# Paste your deployed contract address

vercel env add RPC_URL production
# Paste: https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

vercel env add ADMIN_WALLET_PRIVATE_KEY production
# Paste your admin wallet private key

vercel env add WEBAUTHN_RP_NAME production
# Enter: CertChain

vercel env add WEBAUTHN_RP_ID production
# Enter: certchain-backend.vercel.app (or your custom domain)

vercel env add WEBAUTHN_ORIGIN production
# Enter: https://certchain-frontend.vercel.app (your frontend URL)

vercel env add FRONTEND_URL production
# Enter: https://certchain-frontend.vercel.app

vercel env add NODE_ENV production
# Enter: production
```

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

**Save your backend URL!** It will be something like:
`https://certchain-backend.vercel.app`

---

## Part 4: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://certchain-backend.vercel.app/api
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
```

### Step 2: Deploy Frontend

```bash
cd ../frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** certchain-frontend
- **Directory?** ./
- **Override settings?** Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `build`
  - **Install Command:** `npm install`

### Step 3: Configure Frontend Environment Variables

```bash
vercel env add REACT_APP_API_URL production
# Enter: https://certchain-backend.vercel.app/api

vercel env add REACT_APP_CONTRACT_ADDRESS production
# Enter: your_contract_address
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

**Your frontend URL will be:**
`https://certchain-frontend.vercel.app`

---

## Part 5: Update Backend CORS

Now that you have your frontend URL, update the backend environment:

```bash
cd ../backend

# Update WEBAUTHN_ORIGIN
vercel env rm WEBAUTHN_ORIGIN production
vercel env add WEBAUTHN_ORIGIN production
# Enter: https://certchain-frontend.vercel.app

# Update FRONTEND_URL
vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL production
# Enter: https://certchain-frontend.vercel.app

# Redeploy
vercel --prod
```

---

## Part 6: Initialize Database

### Create Admin User

You'll need to run the admin creation script. Since Vercel is serverless, you have two options:

#### Option A: Run Locally (Recommended)

```bash
cd backend

# Create .env with production MongoDB URI
echo "MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority" > .env.temp

# Run script
node scripts/create-admin.js

# Remove temp file
rm .env.temp
```

#### Option B: Create via MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Go to `certchain` database → `users` collection
4. Insert document:

```json
{
  "email": "admin@certchain.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "fullName": "System Admin",
  "role": "admin",
  "isActive": true,
  "createdAt": {"$date": "2026-04-22T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-04-22T00:00:00.000Z"}
}
```

**To hash password:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin1234!', 10));"
```

---

## Part 7: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to your project settings in Vercel dashboard
2. Click "Domains"
3. Add your domain (e.g., `certchain.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

### Update Environment Variables

After adding custom domain, update:

**Backend:**
```bash
vercel env rm WEBAUTHN_RP_ID production
vercel env add WEBAUTHN_RP_ID production
# Enter: api.certchain.com

vercel env rm WEBAUTHN_ORIGIN production
vercel env add WEBAUTHN_ORIGIN production
# Enter: https://certchain.com

vercel --prod
```

**Frontend:**
```bash
vercel env rm REACT_APP_API_URL production
vercel env add REACT_APP_API_URL production
# Enter: https://api.certchain.com/api

vercel --prod
```

---

## Part 8: Testing

### Test Backend

```bash
curl https://certchain-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-22T..."
}
```

### Test Frontend

Open browser: `https://certchain-frontend.vercel.app`

### Test Login

1. Go to frontend URL
2. Click "Login"
3. Use admin credentials:
   - Email: `admin@certchain.com`
   - Password: `Admin1234!` (or what you set)

---

## 📋 Complete Environment Variables Checklist

### Backend Environment Variables:

- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Random 64-character string
- [ ] `CONTRACT_ADDRESS` - Deployed smart contract address
- [ ] `RPC_URL` - Alchemy/Infura RPC URL
- [ ] `ADMIN_WALLET_PRIVATE_KEY` - Admin wallet private key
- [ ] `WEBAUTHN_RP_NAME` - "CertChain"
- [ ] `WEBAUTHN_RP_ID` - Your backend domain
- [ ] `WEBAUTHN_ORIGIN` - Your frontend URL (with https://)
- [ ] `FRONTEND_URL` - Your frontend URL (with https://)
- [ ] `NODE_ENV` - "production"

### Frontend Environment Variables:

- [ ] `REACT_APP_API_URL` - Your backend URL + /api
- [ ] `REACT_APP_CONTRACT_ADDRESS` - Deployed contract address

---

## 🔧 Useful Commands

### View Logs

```bash
# Backend logs
vercel logs certchain-backend --prod

# Frontend logs
vercel logs certchain-frontend --prod
```

### Redeploy

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

### List Environment Variables

```bash
vercel env ls
```

### Remove Environment Variable

```bash
vercel env rm VARIABLE_NAME production
```

---

## 🚨 Troubleshooting

### Issue: CORS Error

**Solution:** Ensure `FRONTEND_URL` in backend matches your actual frontend URL exactly (including https://)

### Issue: Database Connection Failed

**Solution:** 
1. Check MongoDB Atlas Network Access allows 0.0.0.0/0
2. Verify connection string is correct
3. Ensure database user has read/write permissions

### Issue: WebAuthn Not Working

**Solution:**
1. Ensure both frontend and backend use HTTPS (Vercel provides this automatically)
2. Check `WEBAUTHN_RP_ID` matches your backend domain
3. Check `WEBAUTHN_ORIGIN` matches your frontend URL exactly

### Issue: Blockchain Connection Failed

**Solution:**
1. Verify `RPC_URL` is correct
2. Check Alchemy/Infura API key is valid
3. Ensure contract is deployed to the correct network
4. Verify `CONTRACT_ADDRESS` is correct

### Issue: Build Failed

**Solution:**
1. Check build logs: `vercel logs --prod`
2. Ensure all dependencies are in `package.json`
3. Check for syntax errors
4. Verify Node.js version compatibility

---

## 💰 Cost Breakdown

### Free Tier (Hobby Plan)

- **Vercel:** Free
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  
- **MongoDB Atlas:** Free (M0)
  - 512 MB storage
  - Shared RAM
  - Good for development/testing

- **Alchemy:** Free
  - 300M compute units/month
  - Good for testing

**Total: $0/month** ✅

### Paid Tier (Production)

- **Vercel Pro:** $20/month
  - 1 TB bandwidth
  - Advanced analytics
  - Team collaboration

- **MongoDB Atlas M10:** $57/month
  - 10 GB storage
  - 2 GB RAM
  - Automated backups

- **Alchemy Growth:** $49/month
  - 1B compute units/month
  - Archive data access

**Total: $126/month**

---

## 🎯 Next Steps

1. ✅ MongoDB Atlas setup (Done!)
2. [ ] Deploy smart contract to testnet
3. [ ] Deploy backend to Vercel
4. [ ] Deploy frontend to Vercel
5. [ ] Create admin user
6. [ ] Test the application
7. [ ] (Optional) Add custom domain
8. [ ] Setup monitoring

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Alchemy Docs:** https://docs.alchemy.com/
- **GitHub Issues:** https://github.com/GermainGihozo/CertiChain-BioVerify/issues

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Network access allows 0.0.0.0/0
- [ ] Database `certchain` created
- [ ] Smart contract deployed to testnet
- [ ] Contract address saved
- [ ] Alchemy/Infura API key obtained
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] CORS configured correctly
- [ ] Admin user created
- [ ] Application tested end-to-end
- [ ] Custom domain added (optional)
- [ ] Monitoring setup (optional)

---

**Estimated deployment time:** 30-45 minutes

**Good luck! 🚀**
