# 📊 The Graph Subgraph Deployment Guide

## Prerequisites
- Node.js installed
- The Graph account: https://thegraph.com/hosted-service
- GitHub account

## Quick Deploy

```bash
cd subgraph
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps

### 1. Install Graph CLI
```bash
npm install -g @graphprotocol/graph-cli
```

### 2. Install Dependencies
```bash
cd subgraph
npm install
```

### 3. Get Access Token
1. Go to https://thegraph.com/hosted-service/dashboard
2. Click "My Dashboard"
3. Copy your access token

### 4. Authenticate
```bash
graph auth --product hosted-service <YOUR_ACCESS_TOKEN>
```

### 5. Create Subgraph
Go to: https://thegraph.com/hosted-service/subgraph/create
- Name: `aura-protocol`
- Subtitle: `Aura Protocol ZK Credit Layer`

### 6. Generate Code
```bash
graph codegen
```

### 7. Build
```bash
graph build
```

### 8. Deploy
```bash
graph deploy --product hosted-service <YOUR_GITHUB_USERNAME>/aura-protocol
```

## Subgraph Endpoints

After deployment, you'll get:
- **Query URL**: `https://api.thegraph.com/subgraphs/name/<USERNAME>/aura-protocol`
- **Playground**: `https://thegraph.com/hosted-service/subgraph/<USERNAME>/aura-protocol`

## Example Queries

### Get All Badges
```graphql
{
  badges(first: 10, orderBy: issuedAt, orderDirection: desc) {
    id
    tokenId
    owner
    badgeType
    issuedAt
  }
}
```

### Get User with Badges
```graphql
{
  user(id: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1") {
    address
    totalBadges
    badges {
      badgeType
      issuedAt
    }
    passport {
      creditScore
      pohScore
    }
  }
}
```

### Get Global Stats
```graphql
{
  globalStats(id: "global") {
    totalBadges
    totalPassports
    totalUsers
    averageCreditScore
  }
}
```

## Contract Addresses (Polygon Amoy)

- **Badge Contract**: `0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678`
- **Passport Contract**: `0xf85007A48DbD60B678Fa09ff379b8933b7525949`

## Entities

- **Badge**: ZK badges minted by users
- **Passport**: Credit passports with scores
- **User**: User aggregated data
- **ScoreUpdate**: History of score changes
- **GlobalStats**: Protocol-wide statistics

## Status
✅ Schema defined
✅ Subgraph manifest configured
✅ Deployment scripts ready
🔄 Awaiting deployment to hosted service

## Troubleshooting

**Error: "Failed to deploy"**
- Check contract addresses are correct
- Verify network is `polygon-amoy`
- Ensure ABI files exist in `./abis/`

**Error: "Authentication failed"**
- Re-run `graph auth` with correct token
- Check token hasn't expired
