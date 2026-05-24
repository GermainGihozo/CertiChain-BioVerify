# ⚡ Quick Deploy Reference

## One-Command Deployment (After Initial Setup)

### Deploy Backend
```powershell
cd backend && vercel --prod
```

### Deploy Frontend
```powershell
cd frontend && vercel --prod
```

### Deploy Both
```powershell
cd backend && vercel --prod && cd ../frontend && vercel --prod
```

---

## Environment Variables Quick Reference

### Backend (Required)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-random-string>
WEBAUTHN_RP_NAME=CertChain
WEBAUTHN_RP_ID=<backend-domain>
WEBAUTHN_ORIGIN=https://<frontend-url>
FRONTEND_URL=https://<frontend-url>
NODE_ENV=production
```

### Frontend (Required)
```
REACT_APP_API_URL=https://<backend-url>/api
```

---

## Common Commands

### Generate JWT Secret
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### View Logs
```powershell
vercel logs certchain-backend --prod
vercel logs certchain-frontend --prod
```

### List Environment Variables
```powershell
cd backend && vercel env ls
cd frontend && vercel env ls
```

### Add Environment Variable
```powershell
vercel env add VARIABLE_NAME production
```

### Remove Environment Variable
```powershell
vercel env rm VARIABLE_NAME production
```

### Create Admin User
```powershell
cd backend
$env:MONGODB_URI="<your-mongodb-uri>"
node scripts/create-admin.js
Remove-Item Env:\MONGODB_URI
```

---

## Deployment Checklist

- [ ] MongoDB Atlas: Network Access allows 0.0.0.0/0
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Vercel logged in: `vercel login`
- [ ] JWT Secret generated
- [ ] Backend deployed: `cd backend && vercel --prod`
- [ ] Backend env vars configured
- [ ] Frontend deployed: `cd frontend && vercel --prod`
- [ ] Frontend env vars configured
- [ ] Backend CORS updated with frontend URL
- [ ] Admin user created
- [ ] Application tested

---

## URLs to Save

**Backend URL:** `https://certchain-backend-xxx.vercel.app`
**Frontend URL:** `https://certchain-frontend-xxx.vercel.app`

**Admin Credentials:**
- Email: `admin@certchain.com`
- Password: `Admin1234!`

---

## Troubleshooting Quick Fixes

### CORS Error
```powershell
cd backend
vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL production
# Enter: https://<your-frontend-url>
vercel --prod
```

### WebAuthn Not Working
```powershell
cd backend
vercel env rm WEBAUTHN_ORIGIN production
vercel env add WEBAUTHN_ORIGIN production
# Enter: https://<your-frontend-url>
vercel env rm WEBAUTHN_RP_ID production
vercel env add WEBAUTHN_RP_ID production
# Enter: <your-backend-domain> (no https://)
vercel --prod
```

### Database Connection Failed
- Check MongoDB Atlas Network Access
- Verify connection string includes database name
- Check backend logs: `vercel logs certchain-backend --prod`

---

## Helper Script

Run the deployment helper:
```powershell
.\deploy.ps1
```

---

**For detailed instructions, see `START_HERE.md`**
