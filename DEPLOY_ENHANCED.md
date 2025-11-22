# 🚀 Deploy Enhanced Architecture ke Aura Protocol

## Status Saat Ini

❌ **Enhanced architecture belum di-deploy**
- File-file baru sudah dibuat di local
- Server Aura belum running
- Redis belum terinstall
- Docker belum running

## 📋 Deployment Options

### Option 1: Deploy Minimal (Tanpa Redis/Celery) ⚡ RECOMMENDED

Deploy enhanced routes dengan fallback ke synchronous mode jika Redis tidak tersedia.

```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /backend

# Install dependencies minimal
pip install redis celery numpy

# Start backend (akan auto-fallback jika Redis tidak ada)
python server.py
```

**Keuntungan**:
- ✅ Tidak perlu setup Redis/Docker
- ✅ Enhanced routes tetap bisa digunakan (tanpa caching)
- ✅ Reputation engine tetap jalan
- ✅ Feature store akan fallback ke database

### Option 2: Deploy Full Stack (Dengan Redis/Celery) 🔥

Deploy dengan semua fitur enhanced architecture.

#### Step 1: Install Redis

**macOS**:
```bash
brew install redis
brew services start redis
```

**Ubuntu/Linux**:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Step 2: Install Dependencies

```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /backend
pip install -r requirements-enhanced.txt
```

#### Step 3: Start Services

**Terminal 1 - Redis** (jika belum running):
```bash
redis-server
```

**Terminal 2 - Celery Worker**:
```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /backend
celery -A message_queue.celery_app worker --loglevel=info
```

**Terminal 3 - Event Listener** (optional):
```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /backend
python event_listener_runner.py
```

**Terminal 4 - Backend API**:
```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /backend
python server.py
```

**Terminal 5 - Frontend**:
```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ /frontend
npm start
```

### Option 3: Deploy dengan Docker 🐳

```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ 

# Start all services
docker-compose -f docker-compose.enhanced.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

## 🔧 Quick Deploy Script

Saya akan membuat script untuk deploy otomatis:

```bash
cd /Users/idcuq/Documents/Aura\ V.1.1/Aura-V.1.0\ 
chmod +x deploy-now.sh
./deploy-now.sh
```

## ✅ Verification

Setelah deploy, test dengan:

```bash
# Test backend
curl http://localhost:8080/api/

# Test enhanced routes
curl http://localhost:8080/api/v2/analytics/cached

# Test reputation engine
curl -X POST http://localhost:8080/api/v2/reputation/calculate \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"}'
```

## 📊 Monitoring

- Backend API: http://localhost:8080
- Frontend: http://localhost:3030
- API Docs: http://localhost:8080/docs
- Redis Commander: http://localhost:8081 (jika pakai Docker)

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
redis-server
```

### Import Error
```bash
# Install missing dependencies
pip install redis celery numpy pandas scikit-learn
```

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in .env
PORT=8081
```

## 🎯 Recommended: Deploy Minimal First

Untuk testing cepat, gunakan **Option 1** (Deploy Minimal):

1. Install dependencies minimal
2. Start backend server
3. Test enhanced routes
4. Jika perlu performa lebih, upgrade ke Option 2

---

**Mau saya buatkan script deploy otomatis?** 🚀
