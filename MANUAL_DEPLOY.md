# 🚀 MANUAL DEPLOYMENT GUIDE

## Issue
- SSH key authentication needed
- Can't run automated scripts

## Solution: Deploy Manually

### Step 1: Find Your SSH Key

Check what SSH keys you have:
```bash
ls -la ~/.ssh/
```

Look for files like:
- `id_rsa` or `id_rsa.pub`
- `id_ed25519` or `id_ed25519.pub`
- `aura_vps` or similar custom name

### Step 2: Connect to VPS

Try these commands one by one until one works:

```bash
# Try default key
ssh root@165.232.166.78

# Try with specific key
ssh -i ~/.ssh/id_rsa root@165.232.166.78

# Try with ed25519 key
ssh -i ~/.ssh/id_ed25519 root@165.232.166.78

# List all keys and try each
ls ~/.ssh/id_* | grep -v .pub
```

### Step 3: Once Connected, Deploy

After you successfully SSH in, run these commands:

```bash
# Navigate to backend
cd /var/www/aura-backend-new

# Pull latest code
git pull origin main

# Restart backend on port 9000
pm2 delete aura-backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 9000" --name aura-backend
pm2 save

# Verify
lsof -i :9000
curl http://localhost:9000/api/
```

### Step 4: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs aura-backend --lines 20

# Test PoH endpoint (should return 422, not 404)
curl http://localhost:9000/api/poh/enroll
```

## Alternative: Use Your Previous SSH Method

You've connected to this VPS before. Use whatever method you used last time:
- Terminal saved session
- SSH config file
- Password manager
- Different SSH key

Then just copy-paste the deployment commands from Step 3.

## Quick Copy-Paste (After SSH)

```bash
cd /var/www/aura-backend-new && git pull origin main && pm2 delete aura-backend && pm2 start "uvicorn server:app --host 0.0.0.0 --port 9000" --name aura-backend && pm2 save && echo "✅ Deployed!" && lsof -i :9000 && curl http://localhost:9000/api/
```

## If You Can't Find SSH Key

Contact your VPS provider or check:
1. DigitalOcean dashboard (if using DO)
2. Your password manager
3. Previous terminal sessions
4. `.ssh/config` file: `cat ~/.ssh/config`

## Success Criteria

After deployment, you should see:
- ✅ PM2 shows `aura-backend` online
- ✅ Port 9000 is listening
- ✅ API returns JSON: `{"message": "Aura Protocol API"...}`
- ✅ PoH endpoint returns 422 (not 404)
