# 🚀 Monorepo Deployment Guide (Single Vercel Project)

## 📋 Overview

Your project is deployed as a **monorepo** on Vercel, meaning both frontend and backend are in the same project and share the same domain.

**Example:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-project.vercel.app/api`
- Health Check: `https://your-project.vercel.app/health`

---

## ✅ What Was Configured

### 1. Root `vercel.json` Created
This tells Vercel how to build and route both frontend and backend:

```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/health",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/$1"
    }
  ]
}
```

### 2. Frontend `.env.production` Created
Uses relative API URL since both are on same domain:

```env
REACT_APP_API_URL=/api
```

### 3. Backend CORS Updated
Allows same-origin requests (no CORS issues):

```javascript
// Monorepo deployment - same origin, allow all
cors({
  origin: true,
  credentials: true
})
```

---

## 🚀 Deployment Steps

### Step 1: Commit Changes

```bash
git add .
git commit -m "Configure monorepo deployment for Vercel"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Automatic (if connected to Git)
Vercel will automatically deploy when you push to main branch.

#### Option B: Manual Deployment
```bash
vercel --prod
```

### Step 3: Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**:

```
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

JWT_SECRET=your-secret-key-here

WEBAUTHN_RP_NAME=CertChain

WEBAUTHN_RP_ID=your-project.vercel.app

WEBAUTHN_ORIGIN=https://your-project.vercel.app

NODE_ENV=production
```

**Important:** Replace `your-project.vercel.app` with your actual Vercel domain.

### Step 4: Redeploy

After adding environment variables, redeploy:
- Go to Deployments tab
- Click "Redeploy" on latest deployment

Or use CLI:
```bash
vercel --prod --force
```

---

## 🔍 Verify Deployment

### Test 1: Health Check
```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-05-29T..."}
```

### Test 2: Frontend
Open `https://your-project.vercel.app` in browser.

Should see the homepage.

### Test 3: API
Try to register/login from the frontend.

Should work without CORS errors! ✅

### Test 4: Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Should see no CORS errors
4. Network tab should show successful API calls

---

## 📊 Project Structure

```
your-project.vercel.app/
├── /                    → Frontend (React app)
├── /login              → Frontend route
├── /register           → Frontend route
├── /student            → Frontend route
├── /api/auth/login     → Backend API
├── /api/auth/register  → Backend API
├── /api/certificates   → Backend API
└── /health             → Backend health check
```

---

## 🎯 Benefits of Monorepo Deployment

✅ **No CORS Issues**: Same domain = no CORS  
✅ **Simpler Configuration**: One project to manage  
✅ **Shared Environment**: Same env vars for both  
✅ **Easier Deployment**: Deploy both at once  
✅ **Cost Effective**: One Vercel project  

---

## 🔧 Local Development

### Start Backend
```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

Frontend will proxy API requests to backend automatically.

---

## 🐛 Troubleshooting

### Issue 1: 404 on API Routes

**Cause**: Routes not configured correctly

**Solution**: Check `vercel.json` routes are correct:
```json
{
  "src": "/api/(.*)",
  "dest": "backend/api/index.js"
}
```

### Issue 2: Frontend Not Loading

**Cause**: Build failed or wrong build directory

**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify `frontend/build` directory exists after build
3. Check `vercel.json` distDir is correct

### Issue 3: Environment Variables Not Working

**Cause**: Variables not set or not redeployed

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are set for "Production"
3. Redeploy after adding variables

### Issue 4: Database Connection Failed

**Cause**: MongoDB URI not set or incorrect

**Solution**:
1. Check `MONGODB_URI` is set in Vercel
2. Verify connection string is correct
3. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)

---

## 📋 Deployment Checklist

Before deploying:

- [ ] `vercel.json` exists in root
- [ ] `frontend/.env.production` exists
- [ ] Backend CORS configured for monorepo
- [ ] All changes committed to Git
- [ ] Environment variables ready

After deploying:

- [ ] Health check works
- [ ] Frontend loads
- [ ] Can register new account
- [ ] Can login
- [ ] API calls work
- [ ] No CORS errors in console
- [ ] Biometric authentication works

---

## 🎉 Success Criteria

Deployment is successful when:

✅ Frontend loads at `https://your-project.vercel.app`  
✅ API responds at `https://your-project.vercel.app/api`  
✅ Health check returns OK  
✅ Can register and login  
✅ No CORS errors  
✅ All features work  

---

## 📞 Need Help?

### Check Logs
```bash
vercel logs your-project --follow
```

### Check Build Logs
Go to Vercel Dashboard → Deployments → Click on deployment → View Build Logs

### Check Function Logs
Go to Vercel Dashboard → Deployments → Click on deployment → View Function Logs

---

## 🚀 Quick Deploy Commands

```bash
# Deploy to production
vercel --prod

# Deploy with force rebuild
vercel --prod --force

# Check deployment status
vercel ls

# View logs
vercel logs --follow
```

---

## 📚 Additional Resources

- Vercel Monorepo Docs: https://vercel.com/docs/monorepos
- Vercel Build Configuration: https://vercel.com/docs/build-step
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

---

**Your monorepo is now configured and ready to deploy! 🎉**
