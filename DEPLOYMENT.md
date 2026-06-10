# 🚀 Vercel Deployment Guide

## Step-by-Step Deployment

### 1. Push to GitHub ✅ (Already Done)
Your code is already on GitHub: `GermainGihozo/CertiChain-BioVerify`

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository: `GermainGihozo/CertiChain-BioVerify`
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click **"Deploy"**
6. Wait for the build to complete

#### Option B: Deploy via CLI
```bash
npm install -g vercel
vercel --prod
```

### 3. Set Environment Variables (IMPORTANT!)

After the first deployment, go to your project settings and add these environment variables:

**Go to: Project Settings → Environment Variables → Add for Production**

```env
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
WEBAUTHN_RP_NAME=CertiChain BioVerify
WEBAUTHN_RP_ID=your-vercel-domain.vercel.app
WEBAUTHN_ORIGIN=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

**IMPORTANT:** Replace `your-vercel-domain` with your actual Vercel domain name!

### 4. Redeploy After Setting Environment Variables

After adding environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Wait for the new deployment to complete

### 5. Test Your Deployment

Once deployed, test these endpoints:

#### Health Check
```
https://your-domain.vercel.app/health
```
Expected response:
```json
{"status": "ok", "timestamp": "..."}
```

#### Frontend
```
https://your-domain.vercel.app
```
You should see the CertiChain login page.

#### API Test
```
https://your-domain.vercel.app/api/auth/register
```
Try registering a new user.

### 6. Create Admin User (MongoDB Atlas)

Since you can't create admin via UI, create directly in MongoDB:

1. Go to https://cloud.mongodb.com
2. Navigate to your cluster: **Cluster0**
3. Click **"Browse Collections"**
4. Find database: **certchain**
5. Find collection: **users**
6. Click **"Insert Document"**
7. Add this document:

```json
{
  "email": "admin@certchain.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "name": "Admin User",
  "role": "admin",
  "isVerified": true,
  "createdAt": {"$date": "2026-06-10T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-10T00:00:00.000Z"}
}
```

**To generate password hash:**
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin123!', 10))"
```

Replace `$2a$10$YourHashedPasswordHere` with the generated hash.

---

## 🔧 Project Structure

```
CertiChain-BioVerify/
├── frontend/              # React app
│   ├── build/            # Production build (created during deployment)
│   ├── public/
│   └── src/
├── backend/              # Express API
│   ├── api/
│   │   └── index.js     # Vercel serverless entry point
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── utils/
└── vercel.json          # Vercel configuration
```

---

## 🌐 How It Works

1. **Frontend** is built as a static site and served from `/`
2. **Backend API** runs as serverless functions at `/api/*`
3. Both share the same domain (monorepo deployment)
4. No CORS issues because they're on the same origin
5. Frontend calls API using relative paths: `/api/auth/login`

---

## 📝 Troubleshooting

### Build Failed: "No Output Directory named 'build' found"
**Solution:** The `vercel.json` is correctly configured. Make sure:
- `frontend/package.json` has a `build` script
- The build script runs `react-scripts build`

### Backend Returns 500 Error
**Solution:** Check environment variables are set correctly:
- `MONGODB_URI` must be valid
- `JWT_SECRET` must be at least 32 characters

### Cannot Login After Deployment
**Solution:** 
1. Check `WEBAUTHN_RP_ID` matches your Vercel domain (without `https://`)
2. Check `WEBAUTHN_ORIGIN` includes `https://`
3. Redeploy after changing environment variables

### CORS Errors
**Solution:** Should not happen in monorepo setup. If you see CORS errors:
1. Verify `frontend/.env.production` has `REACT_APP_API_URL=/api`
2. Make sure you're not setting `FRONTEND_URL` environment variable in Vercel

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Project deployed to Vercel
- [ ] All environment variables set
- [ ] Redeployed after setting env vars
- [ ] Health check returns 200 OK
- [ ] Frontend loads successfully
- [ ] User registration works
- [ ] Admin user created in MongoDB
- [ ] Admin login works
- [ ] WebAuthn registration works

---

## 🎯 Your Current Status

- **GitHub Repository:** `GermainGihozo/CertiChain-BioVerify` ✅
- **Latest Commit:** Pushed with corrected `vercel.json` ✅
- **MongoDB Atlas:** Connected and ready ✅
- **Vercel Configuration:** Clean and ready ✅

**Next Action:** Deploy to Vercel and set environment variables!
