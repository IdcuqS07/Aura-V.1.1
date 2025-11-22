# Deploy AI Oracle ke Production VPS

## 📦 Files yang Perlu Di-upload

```bash
backend/ai_models.py              # NEW - 4 ML models
backend/oracle_service.py         # NEW - Dynamic oracle
backend/ai_oracle_routes.py       # NEW - API routes
backend/onchain_service.py        # UPDATED - Added get_onchain_data()
backend/github_service.py         # UPDATED - Added fetch_github_data()
backend/twitter_service.py        # UPDATED - Added fetch_twitter_data()
backend/server.py                 # UPDATED - Integrated AI Oracle
```

---

## 🚀 Manual Deploy Steps

### 1. Upload Files ke VPS

```bash
# Connect ke VPS
ssh root@aurapass.xyz

# Backup existing files
cd /root/backend
cp server.py server.py.backup
cp onchain_service.py onchain_service.py.backup
cp github_service.py github_service.py.backup
cp twitter_service.py twitter_service.py.backup
```

### 2. Upload dari Local

**Di terminal local:**

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /backend"

# Upload new files
scp ai_models.py root@aurapass.xyz:/root/backend/
scp oracle_service.py root@aurapass.xyz:/root/backend/
scp ai_oracle_routes.py root@aurapass.xyz:/root/backend/

# Upload updated files
scp onchain_service.py root@aurapass.xyz:/root/backend/
scp github_service.py root@aurapass.xyz:/root/backend/
scp twitter_service.py root@aurapass.xyz:/root/backend/
scp server.py root@aurapass.xyz:/root/backend/
```

### 3. Restart Backend di VPS

```bash
# SSH ke VPS
ssh root@aurapass.xyz

# Check PM2 status
pm2 list

# Restart backend
pm2 restart backend

# Check logs
pm2 logs backend --lines 50
```

### 4. Verify Deployment

```bash
# Test AI Oracle health
curl https://api.aurapass.xyz/api/ai-oracle/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "AI Risk Oracle",
#   "version": "2.0.0"
# }
```

---

## 🧪 Test AI Oracle

### Create API Key

```bash
curl -X POST https://api.aurapass.xyz/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"tier": "free", "user_id": "test-user"}'
```

Save the API key from response.

### Test Risk Assessment

```bash
curl -X POST https://api.aurapass.xyz/api/ai-oracle/assess \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "requested_loan_amount": 10000
  }'
```

### Check Oracle Stats

```bash
curl https://api.aurapass.xyz/api/ai-oracle/stats
```

---

## 🔧 Troubleshooting

### Backend tidak restart?

```bash
# Check PM2 status
pm2 list

# Check logs for errors
pm2 logs backend --err

# Manual restart
pm2 stop backend
pm2 start backend
```

### Import errors?

```bash
# Check Python environment
cd /root/backend
source venv/bin/activate
python3 -c "import ai_models; print('OK')"
```

### AI Oracle not found?

```bash
# Check if files uploaded
ls -la /root/backend/ai_*.py
ls -la /root/backend/oracle_service.py

# Check server.py has AI Oracle integration
grep "ai_oracle" /root/backend/server.py
```

---

## ✅ Success Checklist

- [ ] Files uploaded to VPS
- [ ] Backend restarted successfully
- [ ] `/api/ai-oracle/health` returns 200
- [ ] Can create API key
- [ ] Can assess risk
- [ ] Oracle stats working
- [ ] No errors in PM2 logs

---

## 📝 Quick Commands

```bash
# One-liner upload all files
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /backend" && \
scp ai_models.py oracle_service.py ai_oracle_routes.py \
    onchain_service.py github_service.py twitter_service.py server.py \
    root@aurapass.xyz:/root/backend/

# One-liner restart
ssh root@aurapass.xyz "pm2 restart backend && pm2 logs backend --lines 20"

# One-liner test
curl -s https://api.aurapass.xyz/api/ai-oracle/health | jq
```

---

**Ready to deploy!** 🚀
