# 🚀 Deploy Monitoring Manual di VPS

## Step 1: Cari Lokasi Project di VPS

SSH ke VPS dan cari folder project:

```bash
# Di VPS
ls -la ~/
find ~ -name "docker-compose.yml" -o -name "docker-compose.production.yml"
docker ps
```

Biasanya ada di:
- `/root/aura-protocol`
- `/root/Aura-V.1.0`
- `/opt/aura`
- `/var/www/aura`

## Step 2: Upload File dari Komputer Lokal

Dari **komputer lokal** (bukan VPS), jalankan:

```bash
# Ganti dengan path yang benar
VPS_IP="159.65.134.137"  # IP VPS Anda
PROJECT_PATH="/root/aura-protocol"  # Path yang ditemukan di Step 1

# Upload backend files
scp "Aura-V.1.0 /backend/websocket_server.py" root@$VPS_IP:$PROJECT_PATH/backend/
scp "Aura-V.1.0 /backend/block_monitor.py" root@$VPS_IP:$PROJECT_PATH/backend/
scp "Aura-V.1.0 /backend/monitoring_routes.py" root@$VPS_IP:$PROJECT_PATH/backend/
scp "Aura-V.1.0 /backend/monitor_runner.py" root@$VPS_IP:$PROJECT_PATH/backend/
scp "Aura-V.1.0 /backend/requirements-monitoring.txt" root@$VPS_IP:$PROJECT_PATH/backend/

# Upload frontend files
scp "Aura-V.1.0 /frontend/src/services/websocketService.js" root@$VPS_IP:$PROJECT_PATH/frontend/src/services/
scp "Aura-V.1.0 /frontend/src/components/LiveDashboard.jsx" root@$VPS_IP:$PROJECT_PATH/frontend/src/components/
scp "Aura-V.1.0 /frontend/src/App.js" root@$VPS_IP:$PROJECT_PATH/frontend/src/

# Upload docker-compose
scp "Aura-V.1.0 /docker-compose.production.yml" root@$VPS_IP:$PROJECT_PATH/
```

## Step 3: Install Dependencies di VPS

SSH ke VPS:

```bash
ssh root@159.65.134.137
```

Lalu jalankan:

```bash
# Ganti dengan path project Anda
cd /root/aura-protocol  # atau path yang benar

# Install backend dependencies
cd backend
pip3 install flask-socketio python-socketio web3

# Install frontend dependencies
cd ../frontend
npm install socket.io-client

# Build frontend
npm run build
```

## Step 4: Restart Services

```bash
cd /root/aura-protocol  # atau path yang benar

# Stop semua container
docker-compose -f docker-compose.production.yml down

# Start dengan build ulang
docker-compose -f docker-compose.production.yml up -d --build
```

## Step 5: Verifikasi

```bash
# Check containers
docker ps

# Check logs
docker-compose logs monitor
docker-compose logs backend

# Test API
curl http://localhost:8080/api/monitor/health
```

## Step 6: Akses Dashboard

Buka browser:
```
https://www.aurapass.xyz/monitor
```

---

## Troubleshooting

### Jika folder tidak ditemukan:

```bash
# Di VPS, cari semua folder yang ada docker-compose
find / -name "docker-compose.production.yml" 2>/dev/null
```

### Jika docker tidak jalan:

```bash
# Check docker status
systemctl status docker

# Restart docker
systemctl restart docker
```

### Jika nginx tidak proxy ke /monitor:

Check nginx config:
```bash
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf
```

Pastikan ada routing untuk frontend.
