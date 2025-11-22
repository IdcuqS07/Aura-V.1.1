# Aura Protocol V.1.1

[![Live App](https://img.shields.io/badge/app-live-success)](https://www.aurapass.xyz/)
[![On-Chain](https://img.shields.io/badge/on--chain-Polygon%20Amoy-8247E5)](https://amoy.polygonscan.com/)
[![Version](https://img.shields.io/badge/version-1.1-blue)](https://github.com/IdcuqS07/Aura-V.1.1)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Universal Trust in a Trustless World - Polygon ZK-ID Credit Layer

## 🌟 Overview

Aura Protocol V.1.1 is a **production-ready** decentralized credibility layer that builds **ZK Credit Passports** — on-chain financial identities that verify reputation without revealing personal data.

### What's New in V.1.1
- ✅ **AI Risk Oracle V2**: 4 ML models (Credit Risk, Default Predictor, Fraud Detector, Terms Recommender)
- ✅ **19 Feature Extraction**: Passport, transaction, DeFi, social, and market data analysis
- ✅ **Production Deployment**: Live at https://api.aurapass.xyz with full CORS support
- ✅ **API Key System**: Bearer token authentication with rate limiting
- ✅ **Real-time Analytics**: On-chain data from Polygon Amoy testnet

**🔗 REAL ON-CHAIN DEPLOYMENT** on Polygon Amoy Testnet

**Live Application**: [https://www.aurapass.xyz/](https://www.aurapass.xyz/)  
**API Endpoint**: [https://api.aurapass.xyz](https://api.aurapass.xyz)

## ✨ V.1.1 Features (Production Ready)

### Core Infrastructure
- ✅ **Soulbound NFT**: Non-transferable ZK-ID badges (ON-CHAIN)
- ✅ **Credit Passport NFT**: Dynamic on-chain credit scores (ON-CHAIN)
- ✅ **Smart Contracts Deployed**: Real contracts on Polygon Amoy
- ✅ **Production API**: https://api.aurapass.xyz with nginx reverse proxy
- ✅ **API Key Authentication**: Bearer token with rate limiting

### AI Risk Oracle V2 (FLAGSHIP)
- ✅ **4 ML Models**:
  - Credit Risk Classifier (7 weighted features)
  - Default Predictor (5 risk factors)
  - Fraud Detector (anomaly detection)
  - Terms Recommender (interest rate & LTV calculator)
- ✅ **19 Feature Extraction**: Comprehensive data analysis
- ✅ **Real-time Assessment**: API endpoint `/api/ai-oracle/assess`
- ✅ **Batch Processing**: `/api/ai-oracle/batch-assess`
- ✅ **Force Refresh**: Rate-limited partner API

### Proof-as-a-Service
- ✅ **Proof Generation**: `/api/proof/generate`
- ✅ **Proof Verification**: `/api/proof/verify`
- ✅ **On-chain Registry**: ProofRegistry contract integration

### Analytics & Monitoring
- ✅ **Real-time Dashboard**: On-chain data from Polygon Amoy
- ✅ **Ecosystem Metrics**: Users, badges, passports, volume
- ✅ **API Usage Tracking**: Per-key request counting

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui, React Router
- **Backend**: FastAPI (Python), MongoDB
- **Blockchain**: Solidity, Hardhat, OpenZeppelin
- **Network**: Polygon (Amoy Testnet)
- **Testing**: Hardhat, Pytest

## Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB
- Yarn

## Installation

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
yarn install
```

## Configuration

### Backend (.env)

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=aura_protocol
CORS_ORIGINS=*
```

### Frontend (.env)

```
REACT_APP_BACKEND_URL=http://localhost:9000
```

## Running the Application

### Start MongoDB

```bash
brew services start mongodb/brew/mongodb-community
```

### Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 9000
```

### Start Frontend

```bash
cd frontend
yarn start
```

Access the application at `http://localhost:3000`

## 🎯 Core Features

### Wave 1: Foundation
- ✅ **Proof of Uniqueness**: ZK proof generation
- ✅ **ZK Identity Layer**: Decentralized identity system
- ✅ **Civic & Worldcoin Integration**: Multi-provider verification
- ✅ **ZK-ID Badge Launch**: Soulbound NFT badges

### Wave 2: ZK Credit Passport (Complete ✅)
- ✅ **Credit Passport NFT**: On-chain financial identity
- ✅ **Proof-as-a-Service API**: `/proof/generate` & `/proof/verify`
- ✅ **Analytics Dashboard**: Real-time ecosystem metrics
- ✅ **Premium Features**: Free, Pro ($29/mo), Enterprise ($199/mo)
- ✅ **Smart Contracts Deployed**: Polygon Amoy testnet
  

### Wave 3: Expansion (In Progress)
- 🔄 **Real ZK Proofs**: Polygon ID integration
- 🔄 **The Graph Subgraph**: Event indexing and historical data
- 🔄 **Real DeFi Data**: Aave, Uniswap, Compound integration
- 🔄 **Cross-Chain Layer (AuraX)**: Multi-chain support
- 🔄 **Reputation DAO**: Decentralized governance
- 🔄 **Dynamic Oracle Service**: Continuous 5-min updates (currently disabled)

## 📡 API Endpoints

### User Management
- `POST /api/users` - Create user
- `GET /api/users/{user_id}` - Get user
- `POST /api/users/{user_id}/verify` - Verify identity

### Passport & Badges
- `POST /api/passports` - Create credit passport
- `GET /api/passports/{user_id}` - Get passport
- `GET /api/badges/{user_id}` - Get user badges

### Proof-as-a-Service (Requires API Key)
- `POST /api/proof/generate` - Generate ZK proof
- `POST /api/proof/verify` - Verify ZK proof

### Blockchain
- `POST /api/blockchain/civic-verify` - Civic verification
- `POST /api/blockchain/worldcoin-verify` - Worldcoin verification
- `GET /api/blockchain/badges/{wallet_address}` - Get on-chain badges

### AI Risk Oracle
- `POST /api/ai-oracle/assess` - Get AI risk assessment (requires API key)
- `POST /api/ai-oracle/batch-assess` - Batch risk assessment (requires API key)
- `POST /api/ai-oracle/refresh/{address}` - Force refresh (rate-limited)
- `GET /api/ai-oracle/stats` - Oracle statistics
- `GET /api/ai-oracle/health` - Health check

### Analytics
- `GET /api/analytics` - Get ecosystem analytics
- `GET /api/analytics/onchain` - Real-time on-chain analytics

## 🔑 API Authentication

```bash
curl -X POST https://api.auraprotocol.com/proof/generate \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123"}'
```

**Test API Keys** (for development):
- `demo_key_12345` - 100 requests/day
- `premium_key_67890` - 1000 requests/day

**Note**: These are test keys. Production keys can be generated via the dashboard.

## 🧪 Smart Contracts (DEPLOYED ON-CHAIN)

### Deployed Contracts on Polygon Amoy Testnet
- **SimpleZKBadge**: `0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678`
  - Soulbound NFT for ZK-ID badges
  - [View on PolygonScan](https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678)

- **CreditPassport**: `0x1112373c9954B9bbFd91eb21175699b609A1b551`
  - Dynamic credit score NFT (0-1000)
  - User mint functionality
  - [View on PolygonScan](https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551)

- **ProofRegistry**: `0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B`
  - On-chain proof verification
  - [View on PolygonScan](https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B)

### Testing
```bash
cd contracts
npx hardhat test
```

### Deployment
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 📚 Documentation

- [Final TODO List](AURA_FINAL_TODO.md) - Complete development roadmap
- [Data Flow Diagram](AURA_PROTOCOL_DATA_FLOW.md) - System architecture
- [Passport Data Flow](passport-data-flow.md) - User journey flow
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to Polygon Amoy
- [Polygon Integration Guide](README_POLYGON_INTEGRATION.md)
- [Integration Summary](INTEGRATION_SUMMARY.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🗺️ Roadmap

Visit [/roadmap](https://www.aurapass.xyz/roadmap) for detailed development timeline.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Live Application**: https://www.aurapass.xyz/
- **API Endpoint**: https://api.aurapass.xyz
- **GitHub**: https://github.com/IdcuqS07/Aura-V.1.1
- **Polygon Amoy Explorer**: https://amoy.polygonscan.com/
- **SimpleZKBadge Contract**: https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
- **CreditPassport Contract**: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551
- **ProofRegistry Contract**: https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B
- **Testnet Guide**: [/testnet](https://www.aurapass.xyz/testnet)

## 📊 Current Status

**Version**: 1.1  
**Wave 1**: ✅ 100% Complete  
**Wave 2**: ✅ 100% Complete  
**Wave 3**: 🔄 20% Complete  
**Production**: ✅ Deployed & Live

**Last Updated**: January 2025

---

**Built with ❤️ for Polygon zkEVM**
