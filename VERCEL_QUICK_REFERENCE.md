# Vercel Deployment - Quick Reference Card

## 🎯 Your Current Progress

✅ MongoDB Atlas cluster created
✅ Connection string obtained
⏳ Ready to deploy!

---

## 📝 Quick Steps

### 1. Deploy Smart Contract (5 min)
```bash
cd blockchain
npm install

# Create .env
echo "ALCHEMY_API_KEY=your_key" > .env
echo "DEPLOYER_PRIVATE_KEY=your_key" >> .env

# Deploy
npx hardhat run scripts/deploy.js --network mumbai

# SAVE THE CONTRACT ADDRESS!
```

### 2. Deploy Backend (10 min)
```bash
cd backend
npm install -g vercel
vercel login
vercel

# Set environment variables (use your values):
vercel env add MONGODB_URI production
# mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain

vercel env add JWT_SECRET production
# Generate: openssl rand -base64 64

vercel env add CONTRACT_ADDRESS production
# Your contract address from step 1

vercel env add RPC_URL production
# https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY

vercel env add ADMIN_WALLET_PRIVATE_KEY production
# Your wallet private key

vercel env add WEBAUTHN_RP_NAME production
# CertChain

vercel env add WEBAUTHN_RP_ID production
# certchain-backend.vercel.app

vercel env add WEBAUTHN_ORIGIN production
# https://certchain-frontend.vercel.app

vercel env add FRONTEND_URL production
# https://certchain-frontend.vercel.app

vercel env add NODE_ENV production
# production

# Deploy to production
vercel --prod

# SAVE YOUR BACKEND URL!
```

### 3. Deploy Frontend (5 min)
```bash
cd ../frontend

# Create .env.production
echo "REACT_APP_API_URL=https://your-backend.vercel.app/api" > .env.production
echo "REACT_APP_CONTRACT_ADDRESS=your_contract_address" >> .env.production

vercel

# Set environment variables
vercel env add REACT_APP_API_URL production
# https://your-backend.vercel.app/api

vercel env add REACT_APP_CONTRACT_ADDRESS production
# Your contract address

# Deploy to production
vercel --prod

# SAVE YOUR FRONTEND URL!
```

### 4. Create Admin User (2 min)
```bash
cd ../backend

# Create temp .env
echo "MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain" > .env.temp

# Run script
node scripts/create-admin.js

# Clean up
rm .env.temp
```

### 5. Test (2 min)
```bash
# Test backend
curl https://your-backend.vercel.app/health

# Test frontend
# Open: https://your-frontend.vercel.app
# Login with: admin@certchain.com / Admin1234!
```

---

## 🔑 Environment Variables Template

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain
JWT_SECRET=<generate-with-openssl-rand-base64-64>
CONTRACT_ADDRESS=<from-blockchain-deployment>
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/<YOUR_KEY>
ADMIN_WALLET_PRIVATE_KEY=<your-wallet-private-key>
WEBAUTHN_RP_NAME=CertChain
WEBAUTHN_RP_ID=<your-backend-domain>
WEBAUTHN_ORIGIN=https://<your-frontend-domain>
FRONTEND_URL=https://<your-frontend-domain>
NODE_ENV=production
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://<your-backend-domain>/api
REACT_APP_CONTRACT_ADDRESS=<from-blockchain-deployment>
```

---

## 🚨 Common Issues

### CORS Error
```bash
# Update backend FRONTEND_URL to match your actual frontend URL
vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL production
# Enter: https://your-actual-frontend.vercel.app
cd backend && vercel --prod
```

### Database Connection Failed
1. MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0
2. Check connection string is correct
3. Ensure password doesn't have special characters (or URL encode them)

### WebAuthn Not Working
1. Both URLs must use HTTPS (Vercel provides this)
2. Update WEBAUTHN_RP_ID to match backend domain
3. Update WEBAUTHN_ORIGIN to match frontend URL

---

## 📞 Need Help?

- Full guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Vercel docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/

---

## ✅ Checklist

- [ ] Smart contract deployed
- [ ] Contract address saved
- [ ] Backend deployed to Vercel
- [ ] Backend env vars configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend env vars configured
- [ ] Admin user created
- [ ] Application tested
- [ ] URLs saved for reference

---

**Total time: ~25 minutes**

**Your MongoDB is ready! Let's deploy! 🚀**
