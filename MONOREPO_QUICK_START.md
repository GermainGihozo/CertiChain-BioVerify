# ⚡ Monorepo Quick Start - 5 Minutes

## 🎯 Your Setup

Both frontend and backend are deployed as **ONE project** on Vercel.

**Example:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.vercel.app/api`

**No CORS issues!** ✅ (Same domain)

---

## 🚀 Deploy Now (3 Steps)

### Step 1: Run Deployment Script

```powershell
.\deploy-monorepo.ps1
```

Enter your Vercel project URL when prompted.

### Step 2: Set Database Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for **Production**:

```
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority

JWT_SECRET=your-secret-key-here
```

### Step 3: Redeploy

Go to Deployments tab → Click "Redeploy"

Or use CLI:
```bash
vercel --prod
```

---

## ✅ Test It

1. Open `https://your-project.vercel.app`
2. Try to register/login
3. Should work! No CORS errors ✅

---

## 📋 What Was Configured

✅ `vercel.json` - Routes both frontend and backend  
✅ `frontend/.env.production` - Uses `/api` (relative path)  
✅ `backend/src/app.js` - CORS allows same-origin  
✅ Environment variables - WebAuthn configured  

---

## 🔍 Verify Deployment

### Test Health Check
```bash
curl https://your-project.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Test Frontend
Open `https://your-project.vercel.app` in browser.

### Test API
Try to login from frontend. Should work! ✅

---

## 🐛 Troubleshooting

### Issue: 404 on /api routes
**Solution**: Check `vercel.json` exists in root directory

### Issue: Database connection failed
**Solution**: Set `MONGODB_URI` in Vercel dashboard and redeploy

### Issue: Build failed
**Solution**: Check build logs in Vercel dashboard

---

## 📚 Full Documentation

See `MONOREPO_DEPLOYMENT.md` for detailed guide.

---

**Your monorepo is ready to deploy! 🎉**
