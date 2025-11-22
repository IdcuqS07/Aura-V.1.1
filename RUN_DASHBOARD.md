# 🚀 Menjalankan Enhanced Dashboard

## Terminal 1 - Backend
```bash
cd "Aura-V.1.0 /backend"
source venv/bin/activate
python server.py
```

## Terminal 2 - Frontend  
```bash
cd "Aura-V.1.0 /frontend"
yarn start
```

## Akses Dashboard
Setelah kedua server berjalan, buka browser:

- **Enhanced Dashboard**: http://localhost:3000/monitor/enhanced
- **Original Dashboard**: http://localhost:3000/monitor

## Status
✅ Recharts installed
✅ Backend dependencies installed
✅ Virtual environment ready
✅ EnhancedLiveDashboard.jsx created
✅ Routes configured

## Troubleshooting

**Jika MongoDB error:**
```bash
# Install MongoDB atau gunakan MongoDB Atlas
brew install mongodb-community
brew services start mongodb-community
```

**Jika port sudah digunakan:**
- Backend default: 8080
- Frontend default: 3000

Ubah di `.env` file jika perlu.
