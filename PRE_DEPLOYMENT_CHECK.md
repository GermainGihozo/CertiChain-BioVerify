# ✅ Pre-Deployment Checklist

Run through this checklist before deploying to ensure everything is ready.

## 🔍 Code Quality Checks

### Backend
- [x] All features working locally
- [x] PDF upload verification working
- [x] Certificate generation working
- [x] Biometric authentication working
- [x] Database connection working
- [x] Environment variables documented
- [x] Error handling in place
- [x] Logging configured

### Frontend
- [x] All pages loading correctly
- [x] Forms validating properly
- [x] API calls working
- [x] PDF download working
- [x] PDF upload working
- [x] Responsive design working
- [x] No console errors

### Database
- [x] MongoDB Atlas cluster created
- [ ] Network Access configured (0.0.0.0/0)
- [ ] Database user created
- [ ] Connection string tested
- [ ] Collections will be auto-created

## 📦 Dependencies Check

### Backend Dependencies
```bash
cd backend
npm install
npm audit
```

Expected: All dependencies installed, no critical vulnerabilities

### Frontend Dependencies
```bash
cd frontend
npm install
npm audit
```

Expected: All dependencies installed, no critical vulnerabilities

## 🔐 Security Check

- [ ] No sensitive data in code
- [ ] No API keys in repository
- [ ] .env files in .gitignore
- [ ] JWT secret will be generated
- [ ] MongoDB password is strong
- [ ] Admin password will be changed after first login

## 📝 Documentation Check

- [x] README.md updated
- [x] Deployment guides created
- [x] Environment variables documented
- [x] API endpoints documented (if needed)

## 🧪 Local Testing

### Test These Features Locally:

1. **Authentication**
   - [ ] Admin login works
   - [ ] Biometric registration works
   - [ ] Biometric authentication works
   - [ ] Logout works

2. **Institution Management**
   - [ ] Create institution
   - [ ] View institutions
   - [ ] Update institution
   - [ ] Delete institution (if implemented)

3. **Certificate Issuance**
   - [ ] Issue certificate
   - [ ] Certificate appears in student dashboard
   - [ ] Student can confirm with biometric
   - [ ] Admin can approve certificate
   - [ ] Certificate status updates correctly

4. **Certificate Verification**
   - [ ] Verify by certificate ID
   - [ ] Download certificate as PDF
   - [ ] Upload PDF for verification
   - [ ] Certificate ID extracted from PDF
   - [ ] Verification results display correctly

5. **User Management**
   - [ ] Create users
   - [ ] View users
   - [ ] Update user roles
   - [ ] Deactivate users

## 🌐 External Services

### MongoDB Atlas
- [x] Cluster created
- [ ] Network Access: 0.0.0.0/0 allowed
- [ ] Database user created
- [ ] Connection string ready

### Vercel (To be done)
- [ ] Account created
- [ ] CLI installed
- [ ] Logged in

### Blockchain (Optional)
- [ ] Alchemy account created (if using)
- [ ] API key obtained (if using)
- [ ] Contract deployed (if using)
- [ ] Contract address saved (if using)

## 📊 Performance Check

### Backend
```bash
cd backend
npm start
```
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] API responds to requests
- [ ] No memory leaks

### Frontend
```bash
cd frontend
npm start
```
- [ ] App loads without errors
- [ ] Pages render quickly
- [ ] No console errors
- [ ] Images load correctly

## 🔧 Build Check

### Backend Build
```bash
cd backend
# Backend doesn't need build, but check:
node src/server.js
```
- [ ] Starts without errors
- [ ] All routes accessible

### Frontend Build
```bash
cd frontend
npm run build
```
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Build folder created
- [ ] Static files generated

## 📱 Browser Compatibility

Test in these browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## 🎯 Final Checks

- [ ] All local tests passing
- [ ] No critical bugs
- [ ] Code committed to Git
- [ ] Git repository pushed to GitHub/GitLab
- [ ] Deployment guides reviewed
- [ ] Environment variables list ready
- [ ] MongoDB Atlas ready
- [ ] Vercel account ready

## 🚀 Ready to Deploy?

If all checks pass, you're ready to deploy!

**Next step:** Open [START_HERE.md](START_HERE.md) and follow the deployment guide.

```powershell
notepad START_HERE.md
```

Or use the helper script:

```powershell
.\deploy.ps1
```

---

## ⚠️ Important Notes

1. **MongoDB Network Access:** Make sure to allow 0.0.0.0/0 in MongoDB Atlas Network Access settings. This is required for Vercel's serverless functions.

2. **Environment Variables:** You'll need to set environment variables in Vercel. Have your MongoDB connection string and JWT secret ready.

3. **First Deployment:** The first deployment might take a bit longer as Vercel sets up your project.

4. **Testing:** After deployment, test all features again in production to ensure everything works.

5. **Admin Password:** Change the default admin password immediately after first login in production.

---

**Good luck with your deployment! 🎉**
