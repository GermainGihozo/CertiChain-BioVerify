# Quick Start Guide - CertiChain-BioVerify

Get your CertiChain application up and running in minutes!

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites
- Server with Docker installed
- Domain name pointed to your server
- Port 80 and 443 open

### Step 1: Clone Repository
```bash
git clone https://github.com/GermainGihozo/CertiChain-BioVerify.git
cd CertiChain-BioVerify
```

### Step 2: Configure Environment
```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Minimum required changes:**
```env
DOMAIN=your-domain.com
JWT_SECRET=<generate-with: openssl rand -base64 64>
WEBAUTHN_RP_ID=your-domain.com
WEBAUTHN_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
```

### Step 3: Deploy Blockchain Contract
```bash
cd blockchain
npm install

# Edit hardhat.config.js with your network
# Deploy to testnet (Polygon Mumbai)
npx hardhat run scripts/deploy.js --network mumbai

# Copy contract address to .env.production
# CONTRACT_ADDRESS=0x...
# REACT_APP_CONTRACT_ADDRESS=0x...
```

### Step 4: Deploy Application
```bash
cd ..
chmod +x deploy.sh
./deploy.sh
```

### Step 5: Create Admin User
```bash
docker-compose -f docker-compose.prod.yml exec backend node scripts/create-admin.js
```

### Step 6: Setup SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## ✅ Verification

1. **Check services:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

2. **Test backend:**
```bash
curl https://your-domain.com/api/health
```

3. **Test frontend:**
Open browser: `https://your-domain.com`

4. **Login as admin:**
- Email: admin@certchain.com
- Password: (set during admin creation)

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Application
```bash
docker-compose -f docker-compose.prod.yml down
```

### Backup Database
```bash
chmod +x backup.sh
./backup.sh
```

### Restore Database
```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T mongodb mongorestore \
    --db certchain \
    --archive < backups/certchain_backup_YYYYMMDD_HHMMSS.archive
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Redeploy
./deploy.sh
```

## 🌐 Hosting Providers

### Recommended VPS Providers

1. **DigitalOcean** (Easiest)
   - $12/month for 2GB RAM
   - One-click Docker droplet
   - [Sign up](https://www.digitalocean.com/)

2. **Linode** (Good performance)
   - $12/month for 2GB RAM
   - Great documentation
   - [Sign up](https://www.linode.com/)

3. **Vultr** (Budget-friendly)
   - $10/month for 2GB RAM
   - Multiple locations
   - [Sign up](https://www.vultr.com/)

4. **AWS EC2** (Enterprise)
   - t3.small (~$15/month)
   - Free tier available
   - [Sign up](https://aws.amazon.com/)

### Blockchain RPC Providers

1. **Alchemy** (Recommended)
   - Free tier: 300M compute units/month
   - [Sign up](https://www.alchemy.com/)

2. **Infura**
   - Free tier: 100k requests/day
   - [Sign up](https://infura.io/)

3. **QuickNode**
   - Free tier available
   - [Sign up](https://www.quicknode.com/)

## 📊 Monitoring

### Setup Uptime Monitoring
1. [UptimeRobot](https://uptimerobot.com/) - Free
2. [Pingdom](https://www.pingdom.com/) - Paid
3. [StatusCake](https://www.statuscake.com/) - Free tier

### Setup Error Tracking
1. [Sentry](https://sentry.io/) - Free tier
2. [LogRocket](https://logrocket.com/) - Free tier
3. [Rollbar](https://rollbar.com/) - Free tier

## 🔐 Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Strong JWT secret (64+ characters)
- [ ] MongoDB authentication enabled
- [ ] Private keys secured (not in Git)
- [ ] Regular backups scheduled
- [ ] Monitoring setup
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## 🆘 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check if port is in use
sudo netstat -tulpn | grep :5000
```

### Database connection failed
```bash
# Check MongoDB is running
docker-compose -f docker-compose.prod.yml ps mongodb

# Test connection
docker-compose -f docker-compose.prod.yml exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(console.error);"
```

### WebAuthn not working
- Ensure HTTPS is enabled (required for WebAuthn)
- Check `WEBAUTHN_RP_ID` matches your domain
- Check browser console for errors

### Blockchain connection failed
- Verify RPC_URL is correct
- Check Alchemy/Infura API key
- Ensure contract is deployed
- Verify CONTRACT_ADDRESS is correct

## 📞 Support

- **Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** [GitHub Issues](https://github.com/GermainGihozo/CertiChain-BioVerify/issues)
- **Email:** support@certchain.com

## 🎉 Success!

Your CertiChain application is now live! 

Next steps:
1. Create institution accounts
2. Issue test certificates
3. Test biometric authentication
4. Configure custom branding
5. Setup monitoring and backups

---

**Need help?** Open an issue on GitHub or contact support.
