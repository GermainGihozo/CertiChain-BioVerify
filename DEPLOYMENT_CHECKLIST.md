# 🚀 Quick Deployment Checklist

## Pre-Deployment Setup

### 1. MongoDB Atlas (✅ Already Done)
- [x] Cluster created
- [ ] Network Access: Allow 0.0.0.0/0 (all IPs)
- [ ] Database created: `certchain`
- [ ] Connection string ready

**Your MongoDB URI:**
```
mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
```

### 2. Blockchain Setup
For production, you have two options:

#### Option A: Use Testnet (Recommended for now)
- [ ] Get Alchemy API key: https://www.alchemy.com/
- [ ] Create app for Polygon Mumbai testnet
- [ ] Deploy contract to Mumbai
- [ ] Save contract address

#### Option B: Skip Blockchain (Deploy without it)
- [ ] Set `RPC_URL` to empty or local
- [ ] Certificates will work without blockchain verification
- [ ] Can add blockchain later

### 3. Vercel Account
- [ ] Create account at https://vercel.com
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`

---

## Deployment Steps

### Step 1: Prepare Environment Variables

Create a file to track your production values:

**Backend Environment Variables:**
```env
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -base64 64>
CONTRACT_ADDRESS=<your contract address or leave empty>
RPC_URL=<your alchemy URL or leave empty>
ADMIN_WALLET_PRIVATE_KEY=<your wallet key or leave empty>
WEBAUTHN_RP_NAME=CertChain
WEBAUTHN_RP_ID=<will be your backend domain>
WEBAUTHN_ORIGIN=<will be your frontend URL>
FRONTEND_URL=<will be your frontend URL>
NODE_ENV=production
```

**Frontend Environment Variables:**
```env
REACT_APP_API_URL=<will be your backend URL>/api
REACT_APP_CONTRACT_ADDRESS=<your contract address or leave empty>
```

### Step 2: Deploy Backend

```bash
cd backend
vercel
```

Answer prompts:
- Project name: `certchain-backend`
- Directory: `./`
- Override settings: No

**Save the backend URL!** Example: `https://certchain-backend.vercel.app`

### Step 3: Configure Backend Environment

```bash
# In backend directory
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add WEBAUTHN_RP_NAME production
vercel env add WEBAUTHN_RP_ID production
vercel env add WEBAUTHN_ORIGIN production
vercel env add FRONTEND_URL production
vercel env add NODE_ENV production

# Optional (if using blockchain):
vercel env add CONTRACT_ADDRESS production
vercel env add RPC_URL production
vercel env add ADMIN_WALLET_PRIVATE_KEY production

# Deploy with environment variables
vercel --prod
```

### Step 4: Deploy Frontend

```bash
cd ../frontend
vercel
```

Answer prompts:
- Project name: `certchain-frontend`
- Build command: `npm run build`
- Output directory: `build`

**Save the frontend URL!** Example: `https://certchain-frontend.vercel.app`

### Step 5: Configure Frontend Environment

```bash
# In frontend directory
vercel env add REACT_APP_API_URL production
# Enter: https://certchain-backend.vercel.app/api

vercel env add REACT_APP_CONTRACT_ADDRESS production
# Enter: your contract address or leave empty

# Deploy with environment variables
vercel --prod
```

### Step 6: Update Backend CORS

Now that you have the frontend URL, update backend:

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

# Update WEBAUTHN_RP_ID
vercel env rm WEBAUTHN_RP_ID production
vercel env add WEBAUTHN_RP_ID production
# Enter: certchain-backend.vercel.app (without https://)

# Redeploy
vercel --prod
```

### Step 7: Create Admin User

Run locally with production database:

```bash
cd backend

# Temporarily set production MongoDB URI
$env:MONGODB_URI="mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority"

# Run admin creation script
node scripts/create-admin.js

# Clear environment variable
Remove-Item Env:\MONGODB_URI
```

### Step 8: Test Deployment

1. Open frontend URL in browser
2. Try to login with admin credentials
3. Test certificate issuance
4. Test certificate verification
5. Test PDF download and upload verification

---

## Quick Commands Reference

### View Logs
```bash
vercel logs certchain-backend --prod
vercel logs certchain-frontend --prod
```

### Redeploy
```bash
# Backend
cd backend && vercel --prod

# Frontend
cd frontend && vercel --prod
```

### List Environment Variables
```bash
vercel env ls
```

---

## Troubleshooting

### CORS Error
- Ensure `FRONTEND_URL` in backend matches frontend URL exactly
- Include `https://` in the URL

### Database Connection Failed
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string includes database name

### WebAuthn Not Working
- Ensure `WEBAUTHN_RP_ID` is just the domain (no https://)
- Ensure `WEBAUTHN_ORIGIN` includes https://
- Both must use HTTPS (Vercel provides this automatically)

### Build Failed
- Check logs: `vercel logs --prod`
- Ensure all dependencies are in package.json
- Check Node.js version compatibility

---

## Estimated Time: 20-30 minutes

**Ready to deploy? Let's go! 🚀**
