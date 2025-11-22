# 🌐 Deploy Monitoring ke Production (aurapass.xyz)

## Opsi 1: Deploy Manual (Recommended)

### Step 1: Update docker-compose.production.yml

Tambahkan service monitor:

```yaml
services:
  # ... services lain ...
  
  monitor:
    build: ./backend
    command: python monitor_runner.py
    env_file: ./backend/.env
    environment:
      - POLYGON_RPC_URL=${POLYGON_RPC_URL}
      - BADGE_CONTRACT_ADDRESS=${BADGE_CONTRACT_ADDRESS}
      - PASSPORT_CONTRACT_ADDRESS=${PASSPORT_CONTRACT_ADDRESS}
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - aura-network
```

### Step 2: SSH ke VPS

```bash
ssh root@your-vps-ip
cd /root/aura-protocol  # atau path project Anda
```

### Step 3: Upload File Monitoring

Dari komputer lokal:

```bash
# Upload backend files
scp backend/websocket_server.py root@your-vps:/root/aura-protocol/backend/
scp backend/block_monitor.py root@your-vps:/root/aura-protocol/backend/
scp backend/monitoring_routes.py root@your-vps:/root/aura-protocol/backend/
scp backend/monitor_runner.py root@your-vps:/root/aura-protocol/backend/
scp backend/requirements-monitoring.txt root@your-vps:/root/aura-protocol/backend/

# Upload frontend files
scp frontend/src/services/websocketService.js root@your-vps:/root/aura-protocol/frontend/src/services/
scp frontend/src/components/LiveDashboard.jsx root@your-vps:/root/aura-protocol/frontend/src/components/
scp frontend/src/App.js root@your-vps:/root/aura-protocol/frontend/src/
```

### Step 4: Install Dependencies di VPS

```bash
# Di VPS
cd /root/aura-protocol/backend
pip install -r requirements-monitoring.txt

cd ../frontend
npm install socket.io-client
```

### Step 5: Rebuild Frontend

```bash
cd /root/aura-protocol/frontend
npm run build
```

### Step 6: Restart Services

```bash
cd /root/aura-protocol
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Step 7: Start Monitor

```bash
# Jalankan monitor sebagai background process
cd /root/aura-protocol/backend
nohup python monitor_runner.py > monitor.log 2>&1 &
```

### Step 8: Akses Dashboard

Buka browser:
```
https://www.aurapass.xyz/monitor
```

---

## Opsi 2: Deploy dengan Script

### Step 1: Edit deploy-monitoring-production.sh

Ganti VPS details:
```bash
VPS_USER="root"
VPS_HOST="your-vps-ip"  # IP VPS Anda
VPS_PATH="/root/aura-protocol"  # Path project di VPS
```

### Step 2: Jalankan Script

```bash
chmod +x deploy-monitoring-production.sh
./deploy-monitoring-production.sh
```

---

## Verifikasi

### Test API Endpoints

```bash
# Health check
curl https://www.aurapass.xyz/api/monitor/health

# Stats
curl https://www.aurapass.xyz/api/monitor/stats

# Activity
curl https://www.aurapass.xyz/api/monitor/activity
```

### Check Logs

```bash
# Di VPS
cd /root/aura-protocol

# Backend logs
docker-compose logs backend

# Monitor logs
tail -f backend/monitor.log

# Nginx logs
docker-compose logs nginx
```

---

## Troubleshooting

### Monitor tidak jalan?

```bash
# Check process
ps aux | grep monitor_runner

# Restart monitor
pkill -f monitor_runner
cd /root/aura-protocol/backend
nohup python monitor_runner.py > monitor.log 2>&1 &
```

### WebSocket tidak connect?

Check nginx config sudah support WebSocket:
```nginx
location /socket.io/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Frontend tidak update?

```bash
# Rebuild frontend
cd /root/aura-protocol/frontend
npm run build

# Restart nginx
docker-compose restart nginx
```

---

## Monitoring Service dengan Systemd (Optional)

Buat service file untuk auto-restart:

```bash
# Di VPS
sudo nano /etc/systemd/system/aura-monitor.service
```

Isi:
```ini
[Unit]
Description=Aura Protocol Block Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/aura-protocol/backend
ExecStart=/usr/bin/python3 monitor_runner.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
sudo systemctl enable aura-monitor
sudo systemctl start aura-monitor
sudo systemctl status aura-monitor
```

---

## URL Akhir

✅ **Monitoring Dashboard**: https://www.aurapass.xyz/monitor
✅ **API Health**: https://www.aurapass.xyz/api/monitor/health
✅ **API Stats**: https://www.aurapass.xyz/api/monitor/stats
