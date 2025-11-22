# 🚀 Quick Start - Lihat Monitoring Dashboard di Browser

## Langkah 1: Install Dependencies

### Backend
```bash
cd "Aura-V.1.0 /backend"
pip install -r requirements-monitoring.txt
```

### Frontend
```bash
cd "Aura-V.1.0 /frontend"
npm install socket.io-client
```

## Langkah 2: Jalankan Backend

### Terminal 1 - Backend Server
```bash
cd "Aura-V.1.0 /backend"
python server.py
```

### Terminal 2 - Block Monitor
```bash
cd "Aura-V.1.0 /backend"
python monitor_runner.py
```

## Langkah 3: Jalankan Frontend

### Terminal 3 - Frontend
```bash
cd "Aura-V.1.0 /frontend"
npm start
```

## Langkah 4: Buka di Browser

Buka browser dan akses:
```
http://localhost:3000/monitor
```

## Apa yang Akan Anda Lihat?

### 📊 Dashboard Real-time dengan:
1. **Stats Cards** - Total users, badges, passports, aktivitas 24 jam
2. **Recent Blocks** - Block terbaru dari Polygon dengan jumlah transaksi
3. **Recent Transactions** - Transaksi ke smart contract Aura
4. **Recent Badges** - Badge yang baru di-mint

### 🔄 Update Otomatis
- Dashboard akan update otomatis setiap ada:
  - Block baru di blockchain
  - Transaksi baru ke contract
  - Badge baru di-mint
  - Stats update

## Test Cepat (Tanpa Menjalankan Monitor)

Jika hanya ingin test API tanpa monitoring real-time:

```bash
# Test health check
curl http://localhost:8080/api/monitor/health

# Test stats
curl http://localhost:8080/api/monitor/stats

# Test activity
curl http://localhost:8080/api/monitor/activity
```

## Troubleshooting

### Port sudah digunakan?
```bash
# Ganti port frontend di package.json atau:
PORT=3030 npm start
```

### WebSocket tidak connect?
- Pastikan backend berjalan di port 8080
- Check REACT_APP_BACKEND_URL di frontend/.env
- Pastikan CORS enabled di backend

### Monitor tidak mendeteksi block?
- Check POLYGON_RPC_URL di backend/.env
- Pastikan contract addresses sudah benar
- Check log di terminal monitor_runner.py

## URL Lengkap

- **Frontend**: http://localhost:3000
- **Monitoring Dashboard**: http://localhost:3000/monitor
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/monitor/health
