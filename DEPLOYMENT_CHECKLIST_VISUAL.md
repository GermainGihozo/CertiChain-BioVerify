# ✅ Visual Deployment Checklist

## 🎯 Quick Start (15 Minutes)

### Phase 1: Deploy (5 minutes)
```
□ 1. Go to vercel.com
□ 2. Sign in with GitHub
□ 3. Click "Add New" → "Project"
□ 4. Select "CertiChain-BioVerify"
□ 5. Click "Deploy"
□ 6. Wait for deployment to complete
□ 7. Copy your Vercel URL
```

**Your URL**: ________________________________

---

### Phase 2: Set Environment Variables (5 minutes)
```
□ 1. Go to Settings → Environment Variables
□ 2. Add MONGODB_URI = mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
□ 3. Add JWT_SECRET = (generate random string)
□ 4. Add WEBAUTHN_RP_NAME = CertChain
□ 5. Add WEBAUTHN_RP_ID = (your-vercel-domain.vercel.app)
□ 6. Add WEBAUTHN_ORIGIN = (https://your-vercel-domain.vercel.app)
□ 7. Add NODE_ENV = production
□ 8. Add REACT_APP_API_URL = /api
□ 9. All set to "Production" environment
```

---

### Phase 3: Redeploy (2 minutes)
```
□ 1. Go to Deployments tab
□ 2. Click (...) on latest deployment
□ 3. Click "Redeploy"
□ 4. Wait for completion
```

---

### Phase 4: Test (3 minutes)
```
□ 1. Open https://your-url.vercel.app/health
     Should show: {"status":"ok"...}
     
□ 2. Open https://your-url.vercel.app
     Should show: Homepage
     
□ 3. Try to register
     Should work without errors
     
□ 4. Check browser console (F12)
     Should have no CORS errors
```

---

## 🎯 Detailed Testing (30 Minutes)

### Student Flow
```
□ Register as student
□ Setup biometric (fingerprint/face ID)
□ View "My Certificates" (empty)
□ Receive certificate notification
□ Confirm certificate with biometric
□ View certificate details
□ Download certificate PDF
```

### Institution Flow
```
□ Register as institution
□ View dashboard
□ Click "Issue Certificate"
□ Fill certificate details
□ Submit certificate
□ View issued certificates list
□ Check certificate status
```

### Admin Flow
```
□ Create admin user in MongoDB
□ Login as admin
□ View pending certificates
□ Approve a certificate
□ Check certificate on blockchain
□ View activity logs
```

### Hiring Manager Flow
```
□ Register as hiring manager
□ Create verification request
□ Enter certificate ID
□ Fill job details
□ Submit request
□ View request status
```

### Student Verification Flow
```
□ Login as student
□ View verification requests
□ Open request details
□ Click "Verify with Biometric"
□ Complete biometric authentication
□ Check status updated to "Verified"
```

### Public Verification
```
□ Logout (or open incognito)
□ Go to "Verify Certificate"
□ Enter certificate ID
□ View verification result
□ Check blockchain link
```

---

## ⚠️ Common Issues

### If health check fails:
```
□ Check MONGODB_URI is correct
□ Check MongoDB Atlas IP whitelist (0.0.0.0/0)
□ Check Vercel function logs
```

### If CORS errors appear:
```
□ Check REACT_APP_API_URL = /api
□ Redeploy after changing
□ Clear browser cache
```

### If biometric doesn't work:
```
□ Check HTTPS is enabled (Vercel does this automatically)
□ Check WEBAUTHN_ORIGIN matches your URL
□ Check WEBAUTHN_RP_ID matches your domain
□ Try different browser (Chrome/Edge recommended)
```

---

## 🎉 Success Criteria

Your deployment is successful when ALL of these work:

```
✅ Health check returns OK
✅ Homepage loads
✅ Can register accounts (all roles)
✅ Can login
✅ No CORS errors in console
✅ Can setup biometric
✅ Can issue certificates
✅ Can approve certificates
✅ Can create verification requests
✅ Can verify with biometric
✅ Public verification works
```

---

## 📊 Quick Reference

**Your Deployment**
- URL: _________________________
- Deployed: ___/___/_____
- Status: ⬜ Working / ⬜ Issues

**Credentials Created**
- Admin: _________________ / _________
- Student: ________________ / _________
- Institution: _____________ / _________
- Hiring Manager: __________ / _________

**Test Certificate**
- ID: _________________________
- Status: ⬜ Draft / ⬜ Pending / ⬜ Issued
- Blockchain: ⬜ Yes / ⬜ No

---

**Print this checklist and tick off as you go!** ✅
