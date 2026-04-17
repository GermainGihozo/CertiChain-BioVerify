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
