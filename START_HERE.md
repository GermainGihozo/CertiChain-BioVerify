# 🚀 START HERE - Deploy to Production

Follow these steps in order to deploy your application to production.

## ✅ Prerequisites Check

Before starting, make sure you have:

- [x] MongoDB Atlas cluster (You have this!)
- [ ] Vercel account (free) - Sign up at https://vercel.com
- [ ] Git repository pushed to GitHub/GitLab
- [ ] Node.js installed locally

---

## 📋 Step-by-Step Deployment

### Step 1: MongoDB Atlas Configuration (5 minutes)

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Click on your cluster → **Network Access**
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**

**Why?** Vercel's serverless functions use dynamic IPs, so we need to allow all IPs.

---

### Step 2: Install Vercel CLI (2 minutes)

Open PowerShell and run:

```powershell
npm install -g vercel
```

Then login:

```powershell
vercel login
```

Follow the browser prompts to authenticate.

---

### Step 3: Generate JWT Secret (1 minute)

Run this command to generate a secure JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Copy the output** - you'll need it in the next step!

---

### Step 4: Deploy Backend (10 minutes)

#### 4.1 Initial Deployment

```powershell
cd backend
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `certchain-backend` (or your choice)
- **Directory?** → `./`
- **Override settings?** → No

**IMPORTANT:** Copy the deployment URL! It will look like:
`https://certchain-backend-xxx.vercel.app`

#### 4.2 Add Environment Variables

Run these commands one by one:

```powershell
# MongoDB URI
vercel env add MONGODB_URI production
# Paste: mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

# JWT Secret (paste the one you generated in Step 3)
vercel env add JWT_SECRET production

# WebAuthn RP Name
vercel env add WEBAUTHN_RP_NAME production
# Enter: CertChain

# WebAuthn RP ID (your backend domain WITHOUT https://)
vercel env add WEBAUTHN_RP_ID production
# Enter: certchain-backend-xxx.vercel.app

# Node Environment
vercel env add NODE_ENV production
# Enter: production
```

**Note:** We'll add WEBAUTHN_ORIGIN and FRONTEND_URL after deploying the frontend.

#### 4.3 Deploy to Production

```powershell
vercel --prod
```

**Save this URL!** You'll need it for the frontend.

---

### Step 5: Deploy Frontend (10 minutes)

#### 5.1 Initial Deployment

```powershell
cd ../frontend
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `certchain-frontend` (or your choice)
- **Directory?** → `./`
- **Override settings?** → Yes
  - **Build Command:** → `npm run build`
  - **Output Directory:** → `build`
  - **Install Command:** → `npm install`

**IMPORTANT:** Copy the deployment URL! It will look like:
`https://certchain-frontend-xxx.vercel.app`

#### 5.2 Add Environment Variables

```powershell
# API URL (your backend URL + /api)
vercel env add REACT_APP_API_URL production
# Enter: https://certchain-backend-xxx.vercel.app/api

# Contract Address (leave empty for now)
vercel env add REACT_APP_CONTRACT_ADDRESS production
# Just press Enter (empty)
```

#### 5.3 Deploy to Production

```powershell
vercel --prod
```

**Save this URL!** This is your application URL.

---

### Step 6: Update Backend CORS (5 minutes)

Now that you have the frontend URL, update the backend:

```powershell
cd ../backend

# Add WEBAUTHN_ORIGIN
vercel env add WEBAUTHN_ORIGIN production
# Enter: https://certchain-frontend-xxx.vercel.app

# Add FRONTEND_URL
vercel env add FRONTEND_URL production
# Enter: https://certchain-frontend-xxx.vercel.app

# Redeploy backend with new environment variables
vercel --prod
```

---

### Step 7: Create Admin User (3 minutes)

```powershell
# Make sure you're in the backend directory
cd backend

# Set MongoDB URI temporarily
$env:MONGODB_URI="mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority"

# Run the admin creation script
node scripts/create-admin.js

# Clear the environment variable
Remove-Item Env:\MONGODB_URI
```

**Default admin credentials:**
- Email: `admin@certchain.com`
- Password: `Admin1234!`

---

### Step 8: Test Your Deployment (5 minutes)

1. Open your frontend URL in a browser: `https://certchain-frontend-xxx.vercel.app`

2. Click **"Login"**

3. Enter admin credentials:
   - Email: `admin@certchain.com`
   - Password: `Admin1234!`

4. Test the following:
   - ✅ Dashboard loads
   - ✅ Create a test institution
   - ✅ Issue a test certificate
   - ✅ Download certificate as PDF
   - ✅ Verify certificate by ID
   - ✅ Verify certificate by PDF upload

---

## 🎉 Congratulations!

Your application is now live in production!

**Your URLs:**
- Frontend: `https://certchain-frontend-xxx.vercel.app`
- Backend: `https://certchain-backend-xxx.vercel.app`

---

## 📝 Next Steps

### Optional: Add Custom Domain

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Add your custom domain (e.g., `certchain.com`)
5. Follow DNS configuration instructions
6. Update environment variables with new domain

### Optional: Add Blockchain

If you want to add blockchain verification later:

1. Get Alchemy API key: https://www.alchemy.com/
2. Deploy smart contract to testnet
3. Add environment variables:
   ```powershell
   cd backend
   vercel env add CONTRACT_ADDRESS production
   vercel env add RPC_URL production
   vercel env add ADMIN_WALLET_PRIVATE_KEY production
   vercel --prod
   ```

---

## 🔧 Useful Commands

### View Logs

```powershell
# Backend logs
vercel logs certchain-backend --prod

# Frontend logs
vercel logs certchain-frontend --prod
```

### Redeploy

```powershell
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

### Use Deployment Helper Script

```powershell
# Run the deployment helper
.\deploy.ps1
```

---

## 🚨 Troubleshooting

### Issue: Can't login / CORS error

**Solution:**
1. Check backend logs: `vercel logs certchain-backend --prod`
2. Verify `FRONTEND_URL` matches your actual frontend URL
3. Ensure `WEBAUTHN_ORIGIN` includes `https://`

### Issue: Database connection failed

**Solution:**
1. Check MongoDB Atlas Network Access allows 0.0.0.0/0
2. Verify connection string is correct
3. Check backend logs for specific error

### Issue: WebAuthn not working

**Solution:**
1. Ensure `WEBAUTHN_RP_ID` is just the domain (no https://)
2. Ensure `WEBAUTHN_ORIGIN` includes https://
3. Clear browser cache and try again

### Issue: Build failed

**Solution:**
1. Check logs: `vercel logs --prod`
2. Ensure all dependencies are in package.json
3. Try deploying again

---

## 📞 Need Help?

- Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
- Check `VERCEL_DEPLOYMENT.md` for comprehensive guide
- View Vercel docs: https://vercel.com/docs
- Check backend logs: `vercel logs certchain-backend --prod`
- Check frontend logs: `vercel logs certchain-frontend --prod`

---

**Total Time: ~40 minutes**

**Good luck! 🚀**
