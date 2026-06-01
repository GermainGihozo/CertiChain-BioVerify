# ⚡ CORS Quick Fix - 5 Minutes

## 🎯 Problem
CORS error when accessing backend from frontend in production.

## ✅ Solution (3 Steps)

### Step 1: Add Environment Variable to Backend

Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add this variable:

```
Name: FRONTEND_URL
Value: https://chaincertificateverify.vercel.app
Environment: Production
```

Click **Save**.

### Step 2: Redeploy Backend

Go to **Deployments** tab → Click **Redeploy** on latest deployment.

Or use CLI:
```bash
cd backend
vercel --prod
```

### Step 3: Test

Open your frontend: https://chaincertificateverify.vercel.app

Try to login. Should work now! ✅

---

## 🔍 Verify It's Fixed

1. Open browser console (F12)
2. Try to login
3. Check Network tab
4. Should see `Access-Control-Allow-Origin` header
5. No CORS errors ✅

---

## 🚨 Still Not Working?

### Check 1: Environment Variable Set?
```bash
cd backend
vercel env ls
```

Should show `FRONTEND_URL (Production)`

### Check 2: URLs Match Exactly?
- Frontend: `https://chaincertificateverify.vercel.app`
- No trailing slash
- Exact match

### Check 3: Redeployed?
Backend must be redeployed after adding env var.

---

## 📋 All Required Environment Variables

### Backend (Production):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
FRONTEND_URL=https://chaincertificateverify.vercel.app
WEBAUTHN_ORIGIN=https://chaincertificateverify.vercel.app
WEBAUTHN_RP_ID=chaincertificateverify.vercel.app
NODE_ENV=production
```

### Frontend (Production):
```
REACT_APP_API_URL=https://certchain-backend-five.vercel.app
```

---

## ⚡ Quick Commands

```bash
# Set environment variable
cd backend
vercel env add FRONTEND_URL production
# Enter: https://chaincertificateverify.vercel.app

# Redeploy
vercel --prod

# Test
curl https://certchain-backend-five.vercel.app/health
```

---

## ✅ Success!

When fixed, you'll see:
- ✅ No CORS errors in console
- ✅ Login works
- ✅ All API calls succeed

---

**That's it! Your CORS should be fixed now.** 🎉

For detailed troubleshooting, see `CORS_FIX_GUIDE.md`
