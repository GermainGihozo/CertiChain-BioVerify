# ✅ TODO Before Deployment

## 🎯 Quick Checklist

Use this checklist to ensure everything is ready before deploying to production.

---

## 1️⃣ Local Testing (REQUIRED)

### Backend Testing
- [ ] Start backend server: `cd backend && npm start`
- [ ] Test health endpoint: `http://localhost:5000/health`
- [ ] Check MongoDB connection in console
- [ ] Verify no errors in terminal

### Frontend Testing
- [ ] Start frontend server: `cd frontend && npm start`
- [ ] Open browser: `http://localhost:3000`
- [ ] Check console for errors (F12)
- [ ] Verify no warnings in terminal

### Feature Testing
- [ ] Register as hiring manager
- [ ] Register as student
- [ ] Login as institution (or create one)
- [ ] Issue a test certificate to student
- [ ] Login as hiring manager
- [ ] Create verification request
- [ ] Login as student
- [ ] View verification request
- [ ] Verify the request
- [ ] Login as hiring manager
- [ ] Confirm request shows as "Verified"

### UI Testing
- [ ] Test on desktop browser
- [ ] Test on mobile browser (or responsive mode)
- [ ] Test dark mode toggle
- [ ] Test all navigation links
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Test form validation

---

## 2️⃣ Code Review (RECOMMENDED)

### Backend
- [ ] Review `backend/src/models/VerificationRequest.js`
- [ ] Review `backend/src/controllers/verificationRequest.controller.js`
- [ ] Review `backend/src/routes/verificationRequest.routes.js`
- [ ] Check error handling in controllers
- [ ] Verify authorization middleware usage

### Frontend
- [ ] Review hiring manager pages
- [ ] Review student pages
- [ ] Check for console.log statements (remove if any)
- [ ] Verify all imports are used
- [ ] Check for hardcoded values

---

## 3️⃣ Environment Variables (CRITICAL)

### Backend Environment Variables
Create/update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
WEBAUTHN_ORIGIN=http://localhost:3000
WEBAUTHN_RP_ID=localhost
NODE_ENV=development
PORT=5000
```

### Frontend Environment Variables
Create/update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Verify
- [ ] Backend `.env` file exists and is correct
- [ ] Frontend `.env` file exists and is correct
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data in code

---

## 4️⃣ Database Check (REQUIRED)

### MongoDB Atlas
- [ ] Login to MongoDB Atlas
- [ ] Verify cluster is running
- [ ] Check connection string is correct
- [ ] Verify database user has correct permissions
- [ ] Check IP whitelist (0.0.0.0/0 for development)

### Collections
After running the app, verify these collections exist:
- [ ] `users`
- [ ] `certificates`
- [ ] `institutions`
- [ ] `verificationrequests` (new)
- [ ] `activitylogs`

---

## 5️⃣ Build Test (REQUIRED)

### Backend Build
```bash
cd backend
npm install
# No build needed for Node.js
```

### Frontend Build
```bash
cd frontend
npm install
npm run build
```

### Verify
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Frontend build successful
- [ ] No build errors
- [ ] No ESLint warnings

---

## 6️⃣ Git Commit (RECOMMENDED)

### Before Committing
- [ ] Review all changes
- [ ] Remove any debug code
- [ ] Remove console.log statements
- [ ] Update version in package.json (optional)

### Commit
```bash
git add .
git commit -m "feat: Add hiring manager role and verification requests

- Add VerificationRequest model
- Add verification request API endpoints
- Add hiring manager dashboard and pages
- Add student verification request pages
- Update navigation and routing
- Add role selection in registration
- Add comprehensive documentation"

git push origin main
```

---

## 7️⃣ Deployment Preparation (BEFORE DEPLOYING)

### Vercel Configuration
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] Backend project linked
- [ ] Frontend project linked

### Environment Variables for Production

#### Backend (Vercel)
```bash
cd backend
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add FRONTEND_URL production
vercel env add WEBAUTHN_ORIGIN production
vercel env add WEBAUTHN_RP_ID production
vercel env add NODE_ENV production
```

#### Frontend (Vercel)
```bash
cd frontend
vercel env add REACT_APP_API_URL production
```

### Production URLs
- [ ] Note your backend URL: `https://certchain-backend-five.vercel.app`
- [ ] Note your frontend URL: `https://chaincertificateverify.vercel.app`
- [ ] Update FRONTEND_URL in backend env vars
- [ ] Update REACT_APP_API_URL in frontend env vars

---

## 8️⃣ Deployment (WHEN READY)

### Deploy Backend
```bash
cd backend
vercel --prod
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Verify Deployment
- [ ] Backend health check: `https://your-backend.vercel.app/health`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] No CORS errors in browser console
- [ ] Can register new account
- [ ] Can login
- [ ] Can create verification request

---

## 9️⃣ Post-Deployment Testing (CRITICAL)

### Create Test Accounts in Production
- [ ] Register hiring manager account
- [ ] Register student account
- [ ] Login as institution (or create one)

### Test Complete Workflow
- [ ] Issue certificate to student
- [ ] Create verification request as hiring manager
- [ ] View request as student
- [ ] Verify request as student
- [ ] Confirm verification as hiring manager

### Test All Features
- [ ] Dashboard loads correctly
- [ ] Search works
- [ ] Filters work
- [ ] Request detail pages work
- [ ] Settings page works
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🔟 Monitoring (AFTER DEPLOYMENT)

### Check Logs
- [ ] Vercel backend logs (check for errors)
- [ ] Vercel frontend logs (check for errors)
- [ ] Browser console (check for errors)

### Monitor Performance
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] No memory leaks
- [ ] No infinite loops

### User Feedback
- [ ] Gather feedback from test users
- [ ] Note any issues or bugs
- [ ] Plan fixes or improvements

---

## 🚨 Rollback Plan (IF NEEDED)

If something goes wrong:

### Option 1: Revert Deployment
```bash
# Vercel allows you to rollback to previous deployment
# Go to Vercel dashboard → Deployments → Select previous → Promote to Production
```

### Option 2: Fix Forward
```bash
# Fix the issue locally
# Test thoroughly
# Deploy again
vercel --prod
```

---

## 📋 Final Checklist

Before marking as complete:

- [ ] All local tests pass
- [ ] Code reviewed
- [ ] Environment variables set
- [ ] Database verified
- [ ] Build successful
- [ ] Git committed and pushed
- [ ] Deployment preparation complete
- [ ] Deployed to production
- [ ] Post-deployment tests pass
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Team notified

---

## ✅ When Everything is Done

Mark the date and time:

**Deployment Date**: _______________  
**Deployment Time**: _______________  
**Deployed By**: _______________  
**Status**: _______________  

**Production URLs**:
- Backend: _______________
- Frontend: _______________

**Test Accounts Created**:
- Hiring Manager: _______________
- Student: _______________

---

## 🎉 Success Criteria

You're done when:
- ✅ All checkboxes above are checked
- ✅ Application works in production
- ✅ No critical errors in logs
- ✅ Test workflow completes successfully
- ✅ Users can access and use the feature

---

## 📞 Need Help?

If you encounter issues:

1. Check the documentation:
   - `HIRING_MANAGER_FEATURE.md`
   - `TESTING_HIRING_MANAGER.md`
   - `DEPLOYMENT_READY.md`

2. Check logs:
   - Vercel deployment logs
   - Browser console
   - MongoDB Atlas logs

3. Common issues:
   - CORS errors → Check FRONTEND_URL env var
   - 401 errors → Check JWT_SECRET and authentication
   - Database errors → Check MONGODB_URI
   - Build errors → Check for syntax errors

---

**Good luck with your deployment! 🚀**
