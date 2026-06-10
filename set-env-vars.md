# 🔐 Set Environment Variables

## Your Deployment URL
**Production**: https://chaincertificateverify.vercel.app

## Required Environment Variables

Go to: https://vercel.com/gihozondahayogermain-2913s-projects/chain_certificate_verify/settings/environment-variables

### 1. Update REACT_APP_API_URL
- **Name**: `REACT_APP_API_URL`
- **Value**: `/api`
- **Environment**: Production
- **Action**: Remove old value and add new one

### 2. Update/Add WEBAUTHN_RP_ID
- **Name**: `WEBAUTHN_RP_ID`
- **Value**: `chaincertificateverify.vercel.app`
- **Environment**: Production

### 3. Update/Add WEBAUTHN_ORIGIN
- **Name**: `WEBAUTHN_ORIGIN`
- **Value**: `https://chaincertificateverify.vercel.app`
- **Environment**: Production

### 4. Add WEBAUTHN_RP_NAME (if not exists)
- **Name**: `WEBAUTHN_RP_NAME`
- **Value**: `CertChain`
- **Environment**: Production

### 5. Add MONGODB_URI (if not exists)
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority`
- **Environment**: Production

### 6. Add JWT_SECRET (if not exists)
- **Name**: `JWT_SECRET`
- **Value**: Your secret key (generate a strong random string)
- **Environment**: Production

### 7. Add NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production

## After Adding Variables

1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for deployment to complete
4. Test your app at https://chaincertificateverify.vercel.app

## Test Checklist

- [ ] Open https://chaincertificateverify.vercel.app
- [ ] Health check: https://chaincertificateverify.vercel.app/health
- [ ] Try to register
- [ ] Try to login
- [ ] Check browser console for errors
- [ ] Test all features

## Success!

When everything works:
✅ No CORS errors
✅ Can register and login
✅ All API calls succeed
✅ Biometric authentication works
