# 🚀 Deploy Subgraph - Step by Step

## ✅ Prerequisites Done
- ✅ Graph CLI installed
- ✅ Dependencies installed
- ✅ Schema ready
- ✅ Subgraph manifest configured

## 📋 Deployment Steps

### Step 1: Get Access Token
1. Go to: https://thegraph.com/hosted-service/dashboard
2. Connect your wallet or GitHub
3. Click "My Dashboard"
4. Copy your **Access Token**

### Step 2: Authenticate
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /subgraph"
graph auth --product hosted-service <YOUR_ACCESS_TOKEN>
```

### Step 3: Create Subgraph (First Time Only)
1. Go to: https://thegraph.com/hosted-service/subgraph/create
2. Fill in:
   - **Name**: `aura-protocol`
   - **Subtitle**: `Aura Protocol ZK Credit Layer on Polygon`
   - **Description**: `Track ZK badges, credit passports, and on-chain reputation`
3. Click "Create Subgraph"

### Step 4: Generate Code
```bash
graph codegen
```

### Step 5: Build
```bash
graph build
```

### Step 6: Deploy
```bash
graph deploy --product hosted-service <YOUR_GITHUB_USERNAME>/aura-protocol
```

Example:
```bash
graph deploy --product hosted-service johndoe/aura-protocol
```

---

## 🎯 Quick Deploy (All in One)

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /subgraph"

# Authenticate (replace with your token)
graph auth --product hosted-service <YOUR_TOKEN>

# Build and deploy
graph codegen && graph build && graph deploy --product hosted-service <USERNAME>/aura-protocol
```

---

## 📊 After Deployment

Your subgraph will be available at:
- **Query URL**: `https://api.thegraph.com/subgraphs/name/<USERNAME>/aura-protocol`
- **Playground**: `https://thegraph.com/hosted-service/subgraph/<USERNAME>/aura-protocol`

### Test Query
```graphql
{
  badges(first: 5, orderBy: issuedAt, orderDirection: desc) {
    id
    tokenId
    owner
    badgeType
    issuedAt
  }
  globalStats(id: "global") {
    totalBadges
    totalPassports
    totalUsers
  }
}
```

---

## ⚠️ Important Notes

1. **Contract Addresses** (already configured):
   - Badge: `0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678`
   - Passport: `0xf85007A48DbD60B678Fa09ff379b8933b7525949`

2. **Network**: `polygon-amoy` (testnet)

3. **Indexing**: Takes 5-10 minutes after deployment

4. **Updates**: To update, just run deploy command again

---

## 🐛 Troubleshooting

**Error: "Failed to authenticate"**
```bash
# Re-authenticate
graph auth --product hosted-service <NEW_TOKEN>
```

**Error: "Subgraph not found"**
- Make sure you created it on the hosted service first
- Check username is correct

**Error: "Build failed"**
```bash
# Clean and rebuild
rm -rf build generated
graph codegen
graph build
```

---

## 📝 Next Steps After Deploy

1. Wait for indexing to complete
2. Test queries in playground
3. Integrate query URL into frontend
4. Monitor subgraph health

---

## 🎉 Ready to Deploy!

Run these commands:
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /subgraph"
graph auth --product hosted-service <YOUR_TOKEN>
graph codegen && graph build
graph deploy --product hosted-service <USERNAME>/aura-protocol
```
