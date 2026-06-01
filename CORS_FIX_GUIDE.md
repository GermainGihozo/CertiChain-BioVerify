# 🔧 CORS Fix Guide for Production

## 🎯 Problem

When deploying to Vercel, you're getting CORS errors:
```
Access to XMLHttpRequest at 'https://certchain-backend-five.vercel.app/api/auth/login' 
from origin 'https://chaincertificateverify.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Root Cause

The backend is not configured to allow requests from the frontend's production URL.

---

## ✅ Solution: Step-by-Step Fix

### Step 1: Set Environment Variables on Vercel

You need to add the `FRONTEND_URL` environment variable to your backend deployment on Vercel.

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Find your backend project: `certchain-backend-five` (or similar)
3. Click on the project
4. Go to **Settings** → **Environment Variables**
5. Add the following variables:

```
Name: FRONTEND_URL
Value: https://chaincertificateverify.vercel.app
Environment: Production
```

```
Name: WEBAUTHN_ORIGIN
Value: https://chaincertificateverify.vercel.app
Environment: Production
```

```
Name: WEBAUTHN_RP_ID
Value: chaincertificateverify.vercel.app
Environment: Production
```

6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment

#### Option B: Using Vercel CLI

```bash
cd backend

# Add FRONTEND_URL
vercel env add FRONTEND_URL production
# When prompted, enter: https://chaincertificateverify.vercel.app

# Add WEBAUTHN_ORIGIN
vercel env add WEBAUTHN_ORIGIN production
# When prompted, enter: https://chaincertificateverify.vercel.app

# Add WEBAUTHN_RP_ID
vercel env add WEBAUTHN_RP_ID production
# When prompted, enter: chaincertificateverify.vercel.app

# Redeploy
vercel --prod
```

---

### Step 2: Verify Environment Variables

After adding the variables, verify they're set correctly:

#### Using Vercel Dashboard:
1. Go to your backend project
2. Settings → Environment Variables
3. Confirm `FRONTEND_URL` is set to your frontend URL

#### Using Vercel CLI:
```bash
cd backend
vercel env ls
```

You should see:
```
FRONTEND_URL (Production)
WEBAUTHN_ORIGIN (Production)
WEBAUTHN_RP_ID (Production)
MONGODB_URI (Production)
JWT_SECRET (Production)
```

---

### Step 3: Test CORS

After redeploying, test the CORS configuration:

#### Test 1: Health Check
```bash
curl https://certchain-backend-five.vercel.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-05-29T..."}
```

#### Test 2: CORS Headers
```bash
curl -H "Origin: https://chaincertificateverify.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://certchain-backend-five.vercel.app/api/auth/login \
     -v
```

Expected headers in response:
```
Access-Control-Allow-Origin: https://chaincertificateverify.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Test 3: Frontend Login
1. Go to https://chaincertificateverify.vercel.app
2. Try to login
3. Open browser console (F12)
4. Check for CORS errors
5. Should work without errors ✅

---

## 🔍 Debugging CORS Issues

### Check Backend Logs

1. Go to Vercel Dashboard
2. Select your backend project
3. Go to **Deployments**
4. Click on latest deployment
5. Click **View Function Logs**
6. Look for CORS-related messages

You should see:
```
CORS blocked origin: https://some-wrong-url.com  (if blocked)
Allowed origins: https://chaincertificateverify.vercel.app, http://localhost:3000
```

### Check Frontend Network Tab

1. Open your frontend in browser
2. Open DevTools (F12)
3. Go to **Network** tab
4. Try to login
5. Click on the failed request
6. Check **Headers** tab
7. Look for:
   - Request Headers: `Origin: https://chaincertificateverify.vercel.app`
   - Response Headers: Should have `Access-Control-Allow-Origin`

---

## 🚨 Common Issues & Solutions

### Issue 1: Still Getting CORS Error After Setting Env Vars

**Cause**: Environment variables not applied to deployment

**Solution**:
1. Verify env vars are set in Vercel dashboard
2. Redeploy the backend:
   ```bash
   cd backend
   vercel --prod --force
   ```
3. Clear browser cache
4. Try again

### Issue 2: CORS Works Locally But Not in Production

**Cause**: Different URLs in production

**Solution**:
1. Check `FRONTEND_URL` matches exactly (no trailing slash)
2. Check protocol (https vs http)
3. Check subdomain matches

### Issue 3: Multiple Vercel Preview URLs

**Cause**: Vercel creates preview URLs for each deployment

**Solution**: Update CORS to allow preview URLs:

```javascript
// In backend/src/app.js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  // Add pattern for Vercel preview URLs
  /^https:\/\/.*\.vercel\.app$/,
].filter(Boolean);
```

### Issue 4: Environment Variable Not Found

**Cause**: Variable not set or typo in name

**Solution**:
1. Check spelling: `FRONTEND_URL` (all caps, underscore)
2. Check it's set for "Production" environment
3. Redeploy after adding

---

## 📋 Complete Environment Variables Checklist

### Backend Environment Variables (Production)

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/certchain

# Authentication
JWT_SECRET=your-secret-key-here

# Frontend URL (CRITICAL for CORS)
FRONTEND_URL=https://chaincertificateverify.vercel.app

# WebAuthn Configuration
WEBAUTHN_ORIGIN=https://chaincertificateverify.vercel.app
WEBAUTHN_RP_ID=chaincertificateverify.vercel.app
WEBAUTHN_RP_NAME=CertChain

# Environment
NODE_ENV=production
```

### Frontend Environment Variables (Production)

```env
# Backend URL
REACT_APP_API_URL=https://certchain-backend-five.vercel.app
```

---

## 🧪 Testing Checklist

After fixing CORS, test these:

- [ ] Health check endpoint works
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Create certificate works
- [ ] Create verification request works
- [ ] Biometric authentication works
- [ ] No CORS errors in console
- [ ] All API calls succeed

---

## 🔄 Quick Fix Commands

If you need to quickly fix CORS:

```bash
# 1. Set environment variable
cd backend
vercel env add FRONTEND_URL production
# Enter: https://chaincertificateverify.vercel.app

# 2. Redeploy
vercel --prod --force

# 3. Test
curl https://certchain-backend-five.vercel.app/health

# 4. Check frontend
# Open https://chaincertificateverify.vercel.app and try login
```

---

## 📊 Verification Steps

### Step 1: Check Environment Variables
```bash
cd backend
vercel env ls
```

### Step 2: Check Deployment
```bash
vercel ls
```

### Step 3: Check Logs
```bash
vercel logs certchain-backend-five --follow
```

### Step 4: Test API
```bash
curl https://certchain-backend-five.vercel.app/health
```

### Step 5: Test Frontend
Open browser and check console for errors

---

## 🎯 Expected Results

After fixing CORS:

✅ **Backend Logs**:
```
Allowed origins: https://chaincertificateverify.vercel.app, http://localhost:3000
```

✅ **Network Tab**:
```
Status: 200 OK
Access-Control-Allow-Origin: https://chaincertificateverify.vercel.app
Access-Control-Allow-Credentials: true
```

✅ **Console**:
```
No CORS errors
API calls succeed
```

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] `FRONTEND_URL` set on backend
- [ ] `REACT_APP_API_URL` set on frontend
- [ ] Both deployed to production
- [ ] CORS tested and working
- [ ] Login tested
- [ ] All features tested
- [ ] No console errors
- [ ] SSL certificates valid
- [ ] Environment variables verified

---

## 📞 Still Having Issues?

### Debug Steps:

1. **Check exact URLs**:
   ```bash
   echo "Frontend: https://chaincertificateverify.vercel.app"
   echo "Backend: https://certchain-backend-five.vercel.app"
   ```

2. **Check environment variables**:
   ```bash
   cd backend
   vercel env ls
   ```

3. **Check deployment status**:
   ```bash
   vercel ls
   ```

4. **Check logs**:
   - Go to Vercel Dashboard
   - View Function Logs
   - Look for CORS messages

5. **Test with curl**:
   ```bash
   curl -H "Origin: https://chaincertificateverify.vercel.app" \
        -X OPTIONS \
        https://certchain-backend-five.vercel.app/api/auth/login \
        -v
   ```

---

## ✅ Success Criteria

CORS is fixed when:
- ✅ No CORS errors in browser console
- ✅ Login works from frontend
- ✅ All API calls succeed
- ✅ Response headers include `Access-Control-Allow-Origin`
- ✅ Credentials are sent correctly

---

**Your CORS should now be fixed! 🎉**
