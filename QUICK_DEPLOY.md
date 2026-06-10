# ⚡ Quick Deploy Guide

## What Just Happened?
✅ Cleaned all old deployment configs  
✅ Created fresh, simple `vercel.json`  
✅ Updated `.env.production`  
✅ Pushed clean code to GitHub  

---

## 🎯 Deploy Now (3 Steps)

### Step 1: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select: `GermainGihozo/CertiChain-BioVerify`
4. Click **"Deploy"**

### Step 2: Add Environment Variables
After deployment completes, add these in **Project Settings → Environment Variables**:

```
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-make-it-at-least-32-chars

WEBAUTHN_RP_NAME=CertiChain BioVerify

WEBAUTHN_RP_ID=your-actual-domain.vercel.app

WEBAUTHN_ORIGIN=https://your-actual-domain.vercel.app

NODE_ENV=production
```

**⚠️ IMPORTANT:** Replace `your-actual-domain` with the domain Vercel gives you!

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **"Redeploy"**
4. Done! ✨

---

## 🧪 Test It

**Health Check:**
```
https://your-domain.vercel.app/health
```

**Frontend:**
```
https://your-domain.vercel.app
```

**Create Admin User:**
See `DEPLOYMENT.md` for instructions on creating admin user in MongoDB.

---

## 📚 Full Guide
See `DEPLOYMENT.md` for complete documentation.
