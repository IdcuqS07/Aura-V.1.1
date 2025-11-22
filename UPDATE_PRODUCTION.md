# 🔄 Update Production - aurapass.xyz

## New Features to Deploy

1. ✅ ZK Threshold Proof
2. ✅ Enhanced Live Dashboard  
3. ✅ The Graph Subgraph Integration

---

## Quick Update (SSH to Server)

```bash
# SSH to your server
ssh user@your-server-ip

# Navigate to project
cd /path/to/Aura-V.1.1/Aura-V.1.0\ 

# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart aura-backend

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart services
sudo systemctl restart nginx
```

---

## If Using Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

Backend URL to update in Vercel env:
- `REACT_APP_BACKEND_URL=https://api.aurapass.xyz`

---

## If Using Docker

```bash
# Pull latest
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## New Routes to Test

After deployment, test these new routes:

1. **Enhanced Dashboard**
   ```
   https://www.aurapass.xyz/monitor/enhanced
   ```

2. **Threshold Proof**
   ```
   https://www.aurapass.xyz/threshold
   ```

3. **Backend API**
   ```
   https://api.aurapass.xyz/api/threshold/score/0xABC?github_verified=true
   ```

---

## Environment Variables to Add

Add these to your production `.env`:

```env
# Already have these, just verify
BADGE_CONTRACT_ADDRESS=0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
PASSPORT_CONTRACT_ADDRESS=0x1112373c9954B9bbFd91eb21175699b609A1b551
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

---

## Subgraph Integration (Optional)

Update frontend to use The Graph:

```javascript
// In frontend, add this to fetch data
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/1716185/aura-protocol/v0.0.1';

const query = `{
  badges(first: 10) {
    id
    tokenId
    owner
    badgeType
  }
}`;

fetch(SUBGRAPH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
});
```

---

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads: https://www.aurapass.xyz
- [ ] Enhanced dashboard: https://www.aurapass.xyz/monitor/enhanced
- [ ] Threshold proof: https://www.aurapass.xyz/threshold
- [ ] API health: https://api.aurapass.xyz/api/
- [ ] WebSocket connects
- [ ] Charts render correctly
- [ ] No console errors

---

## Rollback (If Issues)

```bash
git log --oneline -5
git revert <commit-hash>
git push origin main

# Then redeploy
```

---

## Support

If issues occur:
1. Check logs: `pm2 logs aura-backend`
2. Check Nginx: `sudo nginx -t`
3. Check browser console
4. Verify environment variables
