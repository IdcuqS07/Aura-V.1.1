# Quick Start - Menjalankan Aura Protocol

## 🚀 Cara Menjalankan

### 1. Setup Backend

```bash
cd "Aura-V.1.0 /backend"

# Install dependencies
pip3 install -r requirements.txt

# Start server
python3 server.py
```

Server akan berjalan di: **http://localhost:8000**

---

### 2. Setup Frontend

```bash
cd "Aura-V.1.0 /frontend"

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend akan berjalan di: **http://localhost:3000**

---

## 🔑 Cara Mendapatkan API Key

### Method 1: Via API (Otomatis)

```bash
# Create API key
curl -X POST http://localhost:8000/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "free",
    "user_id": "test-user-123"
  }'
```

**Response:**
```json
{
  "api_key": "aura_free_abc123xyz",
  "tier": "free",
  "rate_limit": 100
}
```

### Method 2: Via MongoDB (Manual)

```bash
# Connect to MongoDB
mongosh "your_mongodb_url"

# Insert API key
use aura_db
db.api_keys.insertOne({
  "api_key": "aura_free_test123",
  "tier": "free",
  "rate_limit": 100,
  "requests_used": 0,
  "created_at": new Date(),
  "is_active": true
})
```

---

## 🧪 Testing AI Oracle

### Test 1: Health Check
```bash
curl http://localhost:8000/api/ai-oracle/health
```

### Test 2: Create Passport (Jika belum ada)
```bash
curl -X POST http://localhost:8000/api/passports?user_id=test-user-123
```

### Test 3: AI Risk Assessment
```bash
curl -X POST http://localhost:8000/api/ai-oracle/assess \
  -H "Authorization: Bearer aura_free_test123" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "requested_loan_amount": 10000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "assessment": {
    "risk_category": "low",
    "risk_score": 25.5,
    "default_probability": 5.2,
    "fraud_detected": false,
    "recommended_terms": {
      "interest_rate": 7.55,
      "max_ltv": 0.62,
      "duration_days": 90,
      "max_loan_amount": 15000
    }
  }
}
```

---

## 📊 API Tiers

| Tier | Rate Limit | Force Refresh | Price |
|------|------------|---------------|-------|
| Free | 100/day | ❌ | $0 |
| Pro | 1000/day | ✅ | $99/month |
| Enterprise | Unlimited | ✅ | Custom |

---

## 🔧 Environment Variables

Create `.env` file di `backend/`:

```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=aura_db

# Server
PORT=8000
CORS_ORIGINS=http://localhost:3000,https://aurapass.xyz

# AI Oracle
AI_ORACLE_ENABLED=true
ORACLE_UPDATE_INTERVAL=300

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_private_key_here
```

---

## 📝 Common Commands

### Backend
```bash
# Start server
python3 server.py

# Check logs
tail -f server.log

# Test endpoint
curl http://localhost:8000/api/
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Test build
serve -s build
```

### Database
```bash
# Check passports
mongosh
use aura_db
db.passports.find().pretty()

# Check API keys
db.api_keys.find().pretty()

# Check oracle stats
db.events.find({event_type: "passport_updated"}).pretty()
```

---

## 🐛 Troubleshooting

### Server tidak start?
```bash
# Check Python version
python3 --version  # Need 3.10+

# Check dependencies
pip3 list | grep fastapi

# Check port
lsof -i :8000
```

### MongoDB connection error?
```bash
# Check MongoDB running
mongosh

# Update MONGO_URL in .env
MONGO_URL=mongodb://localhost:27017
```

### API key tidak work?
```bash
# Check API key exists
mongosh
use aura_db
db.api_keys.find({api_key: "aura_free_test123"})

# Check is_active = true
db.api_keys.updateOne(
  {api_key: "aura_free_test123"},
  {$set: {is_active: true}}
)
```

---

## 🎯 Quick Test Flow

1. **Start Backend**: `python3 server.py`
2. **Create API Key**: `curl -X POST http://localhost:8000/api/api-keys -d '{"tier":"free"}'`
3. **Test Health**: `curl http://localhost:8000/api/ai-oracle/health`
4. **Test Assessment**: Use curl command above with your API key

---

**Ready to go!** 🚀
