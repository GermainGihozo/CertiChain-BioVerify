# 🔧 Fix API URL Error

## Problem
Frontend is trying to connect to `http://localhost:5000/api` instead of the Vercel API.

## Solution
Add the environment variable in Vercel Dashboard:

### Steps:

1. **Go to your Vercel project settings:**
   - https://vercel.com/dashboard
   - Click on your project: `certi-chain-bio-verify`
   - Go to **Settings** → **Environment Variables**

2. **Add this variable:**
   ```
   Name: REACT_APP_API_URL
   Value: /api
   Environment: Production ✅
   ```

3. **Click "Save"**

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"Redeploy"**
   - Wait for build to complete

5. **Test again:**
   - Clear browser cache (Ctrl + Shift + Delete)
   - Or open in Incognito mode
   - Try logging in

---

## All Required Environment Variables for Vercel

Make sure you have ALL of these in **Settings → Environment Variables → Production**:

```
REACT_APP_API_URL=/api

MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

JWT_SECRET=f4aa1ec3c541b287316468f4797aedd4bcb8ee42e81ba44f7c455d5c0d0362512c9414db824ed0cf499f33b50dfc0360be0fe8f579a5de60782f384e3a65ff5f

JWT_EXPIRES_IN=7d

WEBAUTHN_RP_NAME=CertiChain BioVerify

WEBAUTHN_RP_ID=your-actual-domain.vercel.app

WEBAUTHN_ORIGIN=https://your-actual-domain.vercel.app

NODE_ENV=production
```

**Note:** Replace `your-actual-domain` with your real Vercel domain!

---

## Why This Happens

React only includes environment variables that exist at **build time**. Even though you have `.env.production` in your code, Vercel needs the variable set in its dashboard to inject it during the build process.

---

## After Adding REACT_APP_API_URL

1. Redeploy
2. The error should be gone
3. Login should work ✅
