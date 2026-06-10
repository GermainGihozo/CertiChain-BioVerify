# 🚀 Fresh Deployment Guide - GitHub to Vercel

## Step-by-Step Deployment

### ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account with your project pushed
- [ ] Vercel account (sign up at vercel.com)
- [ ] MongoDB Atlas cluster ready
- [ ] MongoDB connection string

---

## 🎯 Step 1: Deploy on Vercel from GitHub

### 1.1 Go to Vercel Dashboard
1. Open https://vercel.com
2. Click **"Log in"** or **"Sign up"**
3. Sign in with your GitHub account

### 1.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. You'll see "Import Git Repository"
3. Find **"CertiChain-BioVerify"** in the list
4. Click **"Import"**

### 1.3 Configure Project
Vercel will detect your project structure.

**Framework Preset**: Vercel should auto-detect or select "Other"

**Root Directory**: Leave as `.` (root)

**Build Settings**: 
- Vercel will use the `vercel.json` we created
- No need to change anything

Click **"Deploy"**

### 1.4 Wait for Deployment
- Vercel will build and deploy your project
- This takes 2-5 minutes
- You'll get a URL like: `https://certi-chain-bio-verify-xxx.vercel.app`

---

## 🔐 Step 2: Set Environment Variables

### 2.1 Go to Project Settings
1. In your Vercel dashboard
2. Select your project
3. Go to **Settings** tab
4. Click **Environment Variables** in sidebar

### 2.2 Add These Variables (Production)

**MongoDB Connection**
```
Name: MONGODB_URI
Value: mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
Environment: Production
```

**JWT Secret**
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-here-change-this
Environment: Production
```

**WebAuthn Configuration**
```
Name: WEBAUTHN_RP_NAME
Value: CertChain
Environment: Production
```

```
Name: WEBAUTHN_RP_ID
Value: your-project-url.vercel.app
Environment: Production
```

**Note**: Replace `your-project-url.vercel.app` with your actual Vercel domain

```
Name: WEBAUTHN_ORIGIN
Value: https://your-project-url.vercel.app
Environment: Production
```

**Note**: Replace `your-project-url.vercel.app` with your actual Vercel domain (with https://)

```
Name: NODE_ENV
Value: production
Environment: Production
```

**Frontend API URL** (Important for monorepo!)
```
Name: REACT_APP_API_URL
Value: /api
Environment: Production
```

**Note**: We use `/api` (relative path) because frontend and backend are on the same domain

---

## 🔄 Step 3: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) on the right
4. Click **"Redeploy"**
5. Confirm the redeployment
6. Wait for it to complete (~2 minutes)

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Health Check
Open in browser:
```
https://your-project-url.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### 4.2 Test Frontend
Open:
```
https://your-project-url.vercel.app
```

You should see the CertiChain homepage.

### 4.3 Test Registration
1. Click **"Register"**
2. Try to create an account
3. Check browser console (F12) for errors
4. Should work without CORS errors!

---

## 🎯 Step 5: Create Admin User

You need an admin user to approve certificates.

### Option 1: Using MongoDB Atlas (Recommended)

1. Go to MongoDB Atlas
2. Click **"Collections"**
3. Select `certchain` database
4. Select `users` collection
5. Click **"Insert Document"**
6. Paste this (modify the email and name):

```json
{
  "fullName": "Admin User",
  "email": "admin@certchain.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "isActive": true,
  "createdAt": {"$date": "2026-06-03T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-03T00:00:00.000Z"}
}
```

**To get hashed password**:
- Use: https://bcrypt-generator.com/
- Enter your desired password (e.g., "Admin123!")
- Rounds: 10
- Copy the hash and replace `$2a$10$YourHashedPasswordHere`

7. Click **"Insert"**

### Option 2: Register and Update via Database

1. Register a normal account on your site
2. Go to MongoDB Atlas → users collection
3. Find your user by email
4. Click **"Edit"**
5. Change `"role": "student"` to `"role": "admin"`
6. Click **"Update"**

---

## 📋 Complete Environment Variables List

Here's the complete list you should have:

| Variable | Value | Required |
|----------|-------|----------|
| MONGODB_URI | Your MongoDB connection string | ✅ Yes |
| JWT_SECRET | Your secret key | ✅ Yes |
| WEBAUTHN_RP_NAME | CertChain | ✅ Yes |
| WEBAUTHN_RP_ID | your-domain.vercel.app | ✅ Yes |
| WEBAUTHN_ORIGIN | https://your-domain.vercel.app | ✅ Yes |
| NODE_ENV | production | ✅ Yes |
| REACT_APP_API_URL | /api | ✅ Yes |

---

## 🧪 Step 6: Test All Features

### Test as Student
1. Register student account
2. Setup biometric authentication
3. View empty certificates page

### Test as Institution
1. Register institution account
2. Issue a test certificate
3. View issued certificates

### Test as Student (Certificate Flow)
1. Login as student
2. View certificate notification
3. Confirm certificate with biometric
4. Status should be "Pending Approval"

### Test as Admin
1. Login as admin
2. View pending certificates
3. Approve certificate
4. Check it appears on blockchain

### Test as Hiring Manager
1. Register hiring manager account
2. Create verification request
3. Enter certificate ID
4. Fill job details
5. Submit request

### Test as Student (Verification)
1. Login as student
2. View verification requests
3. Verify with biometric
4. Check status updates

### Test Public Verification
1. Logout
2. Go to "Verify Certificate"
3. Enter certificate ID
4. Should show valid/invalid status

---

## 🐛 Troubleshooting

### Issue 1: Build Failed
**Check**: Vercel build logs for specific errors
**Solution**: Usually missing dependencies or syntax errors

### Issue 2: 404 on API Routes
**Check**: vercel.json is in root directory
**Solution**: Make sure vercel.json routes are correct

### Issue 3: Database Connection Failed
**Check**: MongoDB Atlas IP whitelist
**Solution**: Add `0.0.0.0/0` to allow all IPs

### Issue 4: CORS Errors
**Check**: REACT_APP_API_URL is set to `/api`
**Solution**: Update environment variable and redeploy

### Issue 5: Biometric Not Working
**Check**: WEBAUTHN_ORIGIN and WEBAUTHN_RP_ID match your domain
**Solution**: Update to correct domain and redeploy

---

## 📊 Deployment Checklist

- [ ] Project deployed on Vercel
- [ ] All environment variables set
- [ ] Redeployed after setting variables
- [ ] Health check works
- [ ] Frontend loads
- [ ] Can register accounts
- [ ] No CORS errors
- [ ] Admin user created
- [ ] Can issue certificates
- [ ] Can approve certificates
- [ ] Biometric authentication works
- [ ] Verification requests work
- [ ] Public verification works

---

## 🎉 Success!

When everything is working:
- ✅ Your app is live
- ✅ Users can register
- ✅ Institutions can issue certificates
- ✅ Students can confirm certificates
- ✅ Admins can approve certificates
- ✅ Hiring managers can verify candidates
- ✅ Public can verify certificates

---

## 📞 Need Help?

If something doesn't work:
1. Check Vercel function logs
2. Check browser console
3. Check MongoDB Atlas
4. Review this guide again
5. Check environment variables

---

**Your deployment should now be complete!** 🚀
