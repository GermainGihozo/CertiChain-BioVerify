# Blockchain-Based Academic Certificate Verification System

A full-stack decentralized application for issuing, owning, and verifying academic certificates using Ethereum blockchain, WebAuthn biometrics, and MetaMask wallet integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS, ethers.js, WebAuthn |
| Backend | Node.js, Express, JWT, WebAuthn server |
| Database | MongoDB + Mongoose |
| Blockchain | Ethereum (Hardhat), Solidity |
| Auth | MetaMask, WebAuthn (fingerprint/face/Windows Hello) |

## Project Structure

```
├── blockchain/          # Hardhat project with Solidity smart contracts
├── backend/             # Node.js + Express API server
├── frontend/            # React application
└── README.md
```

## Quick Start

### 1. Blockchain (Smart Contracts)
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat node          # Start local Ethereum node
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # Fill in your values
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Fill in your values
npm start
```

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certchain
JWT_SECRET=your_jwt_secret_here
CONTRACT_ADDRESS=0x...   # From deployment
RPC_URL=http://127.0.0.1:8545
ADMIN_WALLET=0x...
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=0x...
```

## User Roles

- **Admin** — Manages institutions and users
- **Institution** — Issues and manages certificates
- **Student** — Owns certificates, verifies via biometrics
- **Public/Employer** — Verifies certificate authenticity

## Key Features

- 🔗 Immutable certificate records on Ethereum blockchain
- 🔐 WebAuthn biometric ownership verification (fingerprint, face, Windows Hello)
- 🦊 MetaMask wallet integration
- 📄 Certificate hash verification (tamper detection)
- 🔍 Public verification by certificate ID or QR code
- 👤 Role-based access control
- 🛡️ JWT session security

## Default Users
- **Email:** admin@certchain.com
- **Password:** Admin1234!
- **Role:** System Admin

## 🚀 Deployment

Ready to deploy to production? We've got you covered!

### Quick Deploy (5 minutes)
```bash
# 1. Copy production environment
cp .env.production.example .env.production

# 2. Edit with your values
nano .env.production

# 3. Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Deployment Guides
- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[Full Deployment Guide](./DEPLOYMENT.md)** - Complete production setup
- **[Docker Compose](./docker-compose.prod.yml)** - Production configuration

### Hosting Options
1. **VPS (Recommended)** - DigitalOcean, Linode, AWS EC2 (~$12/month)
2. **Vercel + MongoDB Atlas** - Serverless deployment (Free tier available)
3. **AWS ECS/EKS** - Enterprise scalability (~$50+/month)

### What's Included
- ✅ Docker & Docker Compose setup
- ✅ Production environment configuration
- ✅ Automated deployment script
- ✅ Nginx reverse proxy configuration
- ✅ SSL/HTTPS setup guide (Let's Encrypt)
- ✅ Database backup scripts
- ✅ Health checks and monitoring
- ✅ Security best practices

### Quick Commands
```bash
# Deploy/Update
./deploy.sh

# Backup database
./backup.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started quickly
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Certificate Approval Flow](./CERTIFICATE_APPROVAL_FLOW.md) - 3-stage approval process
- [API Documentation](#) - Coming soon

## 🔒 Security Features

- JWT-based authentication
- WebAuthn biometric verification
- Blockchain immutability
- Certificate hash verification
- Role-based access control (RBAC)
- Rate limiting
- CORS protection
- Helmet security headers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/GermainGihozo/CertiChain-BioVerify/issues)
- **Email:** support@certchain.com
- **Documentation:** See guides above

---

**Built with ❤️ by Germain IGIHOZO**
