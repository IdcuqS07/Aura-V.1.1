# 🚀 Quick Deploy - Aura Protocol Enhanced

## Status: ❌ Belum Di-Deploy

Enhanced architecture sudah siap, tapi belum running di server.

## 🎯 Deploy Sekarang (3 Langkah)

### 1. Deploy Minimal (Tanpa Redis) - TERCEPAT ⚡

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-now.sh
# Pilih option 1
```

**Fitur yang jalan**:
- ✅ Enhanced API routes
- ✅ Reputation engine
- ✅ Passport & badges (tanpa cache)
- ❌ Async tasks (fallback ke sync)
- ❌ Caching (direct database)

### 2. Deploy Full (Dengan Redis) - RECOMMENDED 🔥

```bash
# Install Redis dulu
brew install redis
brew services start redis

# Deploy
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-now.sh
# Pilih option 2 atau 3
```

**Fitur yang jalan**:
- ✅ Enhanced API routes
- ✅ Reputation engine
- ✅ Feature store (Redis)
- ✅ Caching (10x faster)
- ✅ Async tasks (Celery)
- ✅ Event listener

### 3. Deploy Docker - PALING MUDAH 🐳

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-now.sh
# Pilih option 4
```

**Semua fitur jalan + bonus**:
- ✅ Semua fitur enhanced
- ✅ Redis Commander (GUI)
- ✅ Mongo Express (GUI)
- ✅ Auto-restart
- ✅ Isolated environment

## ✅ Test Deployment

```bash
# Test semua endpoint
./test-deployment.sh

# Atau manual
curl http://localhost:8080/api/v2/status
```

## 📊 Check Status

```bash
# Check enhanced features
curl http://localhost:8080/api/v2/status | python3 -m json.tool

# Expected output:
{
  "enhanced_features": {
    "cache": true/false,
    "message_queue": true/false,
    "reputation_engine": true/false,
    "feature_store": true/false
  },
  "mode": "full" or "fallback"
}
```

## 🔗 Access Points

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:8080 | ❌ Not running |
| Frontend | http://localhost:3030 | ❌ Not running |
| API Docs | http://localhost:8080/docs | ❌ Not running |
| Enhanced Status | http://localhost:8080/api/v2/status | ❌ Not running |

## 🆕 New Endpoints (Enhanced v2)

```bash
# Status check
GET /api/v2/status

# Cached passport
GET /api/v2/passport/{wallet_address}

# Cached badges
GET /api/v2/badges/{wallet_address}

# Calculate reputation
POST /api/v2/reputation/calculate
{
  "wallet_address": "0x..."
}

# Get trust score
POST /api/v2/trust-score
{
  "wallet_address": "0x...",
  "loan_amount": 1000
}

# Cached analytics
GET /api/v2/analytics/cached
```

## 🐛 Troubleshooting

### Port sudah dipakai
```bash
# Kill process di port 8080
lsof -ti:8080 | xargs kill -9
```

### Redis error
```bash
# Check Redis
redis-cli ping

# Start Redis
brew services start redis
```

### Import error
```bash
cd backend
pip install redis celery numpy pandas scikit-learn
```

## 📝 Notes

- **Fallback Mode**: Jika Redis tidak tersedia, sistem akan jalan tanpa caching
- **Graceful Degradation**: Semua endpoint tetap bisa diakses, hanya performa yang berbeda
- **Production Ready**: Siap untuk production dengan Docker deployment

## 🎯 Recommendation

**Untuk Development**: Gunakan Option 1 (Minimal)
**Untuk Testing**: Gunakan Option 2 (Full)
**Untuk Production**: Gunakan Option 4 (Docker)

---

**Mau deploy sekarang?** Jalankan: `./deploy-now.sh` 🚀
