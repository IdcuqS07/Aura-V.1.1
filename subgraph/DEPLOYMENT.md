# The Graph Subgraph Deployment Guide

## Prerequisites

1. **The Graph Studio Account**: https://thegraph.com/studio/
2. **Subgraph Slug**: Create a new subgraph in Studio
3. **Deploy Key**: Get from Studio dashboard

## Installation

```bash
cd subgraph
npm install
```

## Configuration

Update `subgraph.yaml` with your contract addresses:

```yaml
dataSources:
  - name: SimpleZKBadge
    network: polygon-amoy
    source:
      address: "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678"  # Your badge contract
      
  - name: CreditPassport
    network: polygon-amoy
    source:
      address: "0xf85007A48DbD60B678Fa09ff379b8933b7525949"  # Your passport contract
```

## Deployment Steps

### 1. Authenticate with The Graph Studio

```bash
graph auth --studio <DEPLOY_KEY>
```

### 2. Generate Code

```bash
npm run codegen
```

This generates TypeScript types from your schema and ABIs.

### 3. Build Subgraph

```bash
npm run build
```

### 4. Deploy to Studio

```bash
graph deploy --studio aura-protocol
```

Or use the npm script:

```bash
npm run deploy
```

### 5. Publish to Network

After testing in Studio, publish to the decentralized network:

1. Go to Studio dashboard
2. Click "Publish"
3. Pay curation signal (GRT tokens)
4. Wait for indexing

## Local Development

### Start Local Graph Node

```bash
# Clone graph-node
git clone https://github.com/graphprotocol/graph-node
cd graph-node/docker

# Start services
docker-compose up
```

### Deploy Locally

```bash
# Create local subgraph
npm run create-local

# Deploy to local node
npm run deploy-local
```

### Query Local Subgraph

```bash
# GraphQL endpoint
http://localhost:8000/subgraphs/name/aura-protocol
```

## Update Subgraph URL

After deployment, update backend configuration:

**backend/graph_client.py**:
```python
SUBGRAPH_URL = "https://api.studio.thegraph.com/query/<DEPLOY_ID>/aura-protocol/v0.0.1"
```

## Testing Queries

### Using GraphQL Playground

Visit Studio dashboard and use the playground to test queries.

### Using Backend API

```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn server:app --reload --port 9000

# Test endpoints
curl http://localhost:9000/api/graph/badges/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
curl http://localhost:9000/api/graph/passport/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
curl http://localhost:9000/api/graph/stats
```

## Monitoring

### Check Indexing Status

```bash
curl https://api.studio.thegraph.com/index-node/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ indexingStatuses { subgraph synced health } }"}'
```

### View Logs in Studio

1. Go to Studio dashboard
2. Click on your subgraph
3. View "Logs" tab

## Troubleshooting

### Subgraph Failed to Sync

- Check contract addresses in `subgraph.yaml`
- Verify network is `polygon-amoy`
- Check start block numbers
- Review error logs in Studio

### Missing Events

- Ensure contracts emit events correctly
- Check event signatures match ABI
- Verify block range includes transactions

### Schema Changes

After modifying `schema.graphql`:

```bash
npm run codegen
npm run build
npm run deploy
```

Version will auto-increment.

## Cost Optimization

1. **Start Block**: Set to contract deployment block to reduce indexing time
2. **Entity Design**: Minimize entity relationships
3. **Query Complexity**: Use pagination and filters
4. **Caching**: Implement backend caching (already done in `graph_cache.py`)

## Production Checklist

- [ ] Contracts deployed and verified
- [ ] Subgraph deployed to Studio
- [ ] Queries tested in playground
- [ ] Backend updated with subgraph URL
- [ ] Caching configured
- [ ] Monitoring setup
- [ ] Published to decentralized network (optional)

## Resources

- **The Graph Docs**: https://thegraph.com/docs/
- **Studio Dashboard**: https://thegraph.com/studio/
- **Discord Support**: https://discord.gg/graphprotocol
- **Polygon Amoy Explorer**: https://amoy.polygonscan.com/
