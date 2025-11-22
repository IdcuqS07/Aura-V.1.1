# Aura Protocol Subgraph

The Graph subgraph for indexing Aura Protocol smart contracts on Polygon Amoy.

## 📊 Indexed Data

### Entities

**Badge**
- Token ID
- Owner address
- Badge type
- ZK proof hash
- Issued timestamp
- Transaction hash

**Passport**
- Token ID
- Owner address
- Credit score (0-1000)
- PoH score
- Badge count
- On-chain activity
- Issued & updated timestamps

**ScoreUpdate**
- Passport reference
- Old & new scores
- Timestamp
- Transaction hash

**User**
- Address
- Badges (derived)
- Passport reference
- Total badges count
- Created timestamp

**GlobalStats**
- Total badges
- Total passports
- Total users
- Average credit score

## 🚀 Setup

### Prerequisites

```bash
npm install -g @graphprotocol/graph-cli
```

### Install Dependencies

```bash
cd subgraph
npm install
```

### Generate Code

```bash
npm run codegen
```

### Build

```bash
npm run build
```

## 📡 Deployment

### Deploy to The Graph Studio

1. Create subgraph at https://thegraph.com/studio/
2. Get deploy key
3. Authenticate:
```bash
graph auth --studio <DEPLOY_KEY>
```

4. Deploy:
```bash
npm run deploy
```

### Deploy Locally (for testing)

1. Start Graph Node locally
2. Create subgraph:
```bash
npm run create-local
```

3. Deploy:
```bash
npm run deploy-local
```

## 🔍 Example Queries

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

### Get User's Passport

```graphql
{
  user(id: "0x...") {
    address
    totalBadges
    passport {
      creditScore
      pohScore
      badgeCount
      lastUpdated
    }
    badges {
      badgeType
      issuedAt
    }
  }
}
```

### Get Passports by Score

```graphql
{
  passports(
    first: 10
    orderBy: creditScore
    orderDirection: desc
    where: { creditScore_gte: "750" }
  ) {
    owner
    creditScore
    pohScore
    badgeCount
  }
}
```

### Get Score History

```graphql
{
  scoreUpdates(
    first: 20
    orderBy: timestamp
    orderDirection: desc
    where: { passport: "1" }
  ) {
    oldScore
    newScore
    timestamp
  }
}
```

### Get Global Statistics

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

## 📚 Smart Contracts

**SimpleZKBadge**: `0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678`
- Events: BadgeMinted

**CreditPassport**: `0xf85007A48DbD60B678Fa09ff379b8933b7525949`
- Events: PassportIssued, ScoreUpdated

## 🔗 Resources

- The Graph Docs: https://thegraph.com/docs/
- Subgraph Studio: https://thegraph.com/studio/
- Polygon Amoy Explorer: https://amoy.polygonscan.com/

## 📝 Notes

- Subgraph indexes data from block 0 (can be adjusted in subgraph.yaml)
- Events are processed in real-time as blocks are mined
- Query endpoint will be available after deployment
- Free tier: 100k queries/month

---

**Status**: Ready for deployment
