# CertiChain-BioVerify Deployment Guide

This guide covers deploying the CertiChain-BioVerify application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [VPS Deployment (Recommended)](#vps-deployment)
4. [Vercel + MongoDB Atlas](#vercel--mongodb-atlas)
5. [AWS Deployment](#aws-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment](#post-deployment)

---

## Prerequisites

- Domain name (e.g., certchain.com)
- SSL certificate (Let's Encrypt recommended)
- Server with:
  - 2GB+ RAM
  - 20GB+ storage
  - Ubuntu 22.04 LTS (recommended)
  - Docker & Docker Compose installed

---

## Deployment Options

### Option 1: VPS Deployment (DigitalOcean, Linode, AWS EC2)
**Best for:** Full control, blockchain integration, production use
**Cost:** ~$12-20/month

### Option 2: Vercel + MongoDB Atlas
**Best for:** Quick deployment, serverless
**Cost:** Free tier available
**Limitation:** Blockchain node needs separate hosting

### Option 3: AWS (ECS/EKS)
**Best for:** Enterprise, scalability
**Cost:** Variable, ~$50+/month

---

## VPS Deployment

### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Git
apt install git -y

# Create app user
adduser certchain
usermod -aG docker certchain
su - certchain
```

### Step 2: Clone Repository

```bash
cd ~
git clone https://github.com/GermainGihozo/CertiChain-BioVerify.git
cd CertiChain-BioVerify
```

### Step 3: Configure Environment

```bash
# Create production environment file
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

**Required environment variables:**

```env
# Domain Configuration
DOMAIN=certchain.yourdomain.com
WEBAUTHN_RP_ID=certchain.yourdomain.com
WEBAUTHN_ORIGIN=https://certchain.yourdomain.com
FRONTEND_URL=https://certchain.yourdomain.com

# Security
JWT_SECRET=<generate-strong-random-string-64-chars>

# Blockchain
CONTRACT_ADDRESS=<your-deployed-contract-address>
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/<your-api-key>
ADMIN_WALLET_PRIVATE_KEY=<your-admin-wallet-private-key>

# Database
MONGODB_URI=mongodb://mongodb:27017/certchain

# API URL
REACT_APP_API_URL=https://certchain.yourdomain.com/api
REACT_APP_CONTRACT_ADDRESS=<your-deployed-contract-address>
```

### Step 4: Deploy Blockchain Contract

```bash
cd blockchain

# Install dependencies
npm install

# Configure network (edit hardhat.config.js)
# Add your network (Polygon Mumbai, Sepolia, etc.)

# Deploy contract
npx hardhat run scripts/deploy.js --network <your-network>

# Save the contract address to .env.production
```

### Step 5: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/certchain
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name certchain.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name certchain.yourdomain.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/certchain.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/certchain.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/certchain /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d certchain.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### Step 7: Deploy with Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.yml --env-file .env.production up -d

# Check logs
docker-compose logs -f

# Check running containers
docker-compose ps
```

### Step 8: Initialize Database

```bash
# Create admin user
docker-compose exec backend node scripts/create-admin.js

# Seed test users (optional)
docker-compose exec backend node scripts/seed-users.js
```

---

## Vercel + MongoDB Atlas

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (all IPs)
5. Get connection string

### Step 2: Deploy Backend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend
cd backend

# Create vercel.json
```

**backend/vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

```bash
# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Step 3: Deploy Frontend to Vercel

```bash
cd ../frontend

# Deploy
vercel --prod

# Set environment variables:
# REACT_APP_API_URL=https://your-backend.vercel.app/api
```

**Note:** Blockchain node needs separate hosting (Alchemy, Infura, or own node)

---

## AWS Deployment

### Using AWS ECS (Elastic Container Service)

1. **Push Docker images to ECR:**
```bash
aws ecr create-repository --repository-name certchain-backend
aws ecr create-repository --repository-name certchain-frontend

# Build and push
docker build -t certchain-backend ./backend
docker tag certchain-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/certchain-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/certchain-backend:latest
```

2. **Create ECS Cluster**
3. **Create Task Definitions**
4. **Create Services**
5. **Setup Application Load Balancer**
6. **Configure Route53 for DNS**

---

## Environment Configuration

### Generate Secure JWT Secret

```bash
# Generate 64-character random string
openssl rand -base64 64
```

### Blockchain Configuration

**For Testnet (Polygon Mumbai):**
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

**For Mainnet (Polygon):**
```env
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

Get API key from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)

---

## Post-Deployment

### 1. Health Checks

```bash
# Check backend health
curl https://certchain.yourdomain.com/api/health

# Check frontend
curl https://certchain.yourdomain.com
```

### 2. Create Admin User

```bash
docker-compose exec backend node scripts/create-admin.js
```

### 3. Setup Monitoring

**Install PM2 (if not using Docker):**
```bash
npm install -g pm2
pm2 start backend/src/server.js --name certchain-backend
pm2 startup
pm2 save
```

**Setup monitoring tools:**
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay

### 4. Backup Strategy

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb mongodump --db certchain --archive > backup_$DATE.archive

# Upload to S3 or backup server
```

### 5. Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW or security groups)
- [ ] MongoDB authentication enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates scheduled

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database connection issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check connection from backend
docker-compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err));"
```

### WebAuthn not working
- Ensure HTTPS is enabled (WebAuthn requires secure context)
- Check `WEBAUTHN_RP_ID` matches your domain
- Check `WEBAUTHN_ORIGIN` matches your frontend URL

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Run multiple backend instances
- Use Redis for session storage

### Database Scaling
- MongoDB replica set
- Read replicas
- Sharding for large datasets

### CDN
- CloudFlare for frontend assets
- AWS CloudFront
- Vercel Edge Network

---

## Cost Estimation

### Small Scale (< 1000 users)
- VPS: $12/month (DigitalOcean)
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- **Total: ~$15/month**

### Medium Scale (1000-10000 users)
- VPS: $24/month (4GB RAM)
- MongoDB Atlas: $57/month (M10)
- Blockchain RPC: $49/month (Alchemy Growth)
- CDN: $20/month
- **Total: ~$150/month**

### Enterprise Scale
- AWS ECS/EKS: $200+/month
- RDS/DocumentDB: $100+/month
- Load Balancer: $20/month
- CloudFront: $50+/month
- **Total: $400+/month**

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/GermainGihozo/CertiChain-BioVerify/issues
- Email: support@certchain.com

---

**Last Updated:** April 2026
