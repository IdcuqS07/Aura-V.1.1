# 🚀 Deploy VPS - Step by Step Guide

## 📦 Package Ready
✅ aura-deploy.tar.gz (465KB) - Created

## 🎯 Deployment Steps

### Step 1: Upload to VPS (Run on Local Mac)

```bash
# Option A: Using script
./step1-upload.sh

# Option B: Manual
scp aura-deploy.tar.gz root@159.65.134.137:/root/
```

**What you need:**
- Password for root@159.65.134.137
- Or SSH key configured

---

### Step 2: SSH to VPS

```bash
ssh root@159.65.134.137
```

Enter password when prompted.

---

### Step 3: Setup on VPS (Run on VPS)

```bash
# Option A: Using script
cd /root
chmod +x step2-vps-setup.sh
./step2-vps-setup.sh

# Option B: Manual commands
cd /root
tar -xzf aura-deploy.tar.gz

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose -y

# Set environment
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

---

### Step 4: Configure Firewall (Run on VPS)

```bash
# Option A: Using script
./step3-firewall.sh

# Option B: Manual commands
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3030/tcp
ufw allow 8080/tcp
ufw enable

# Check status
ufw status
```

---

### Step 5: Verify Deployment

**On VPS:**
```bash
# Check containers
docker ps

# Test backend
curl http://localhost:8080/api/

# Test frontend
curl http://localhost:3030
```

**From Browser:**
- Frontend: http://159.65.134.137:3030
- Backend: http://159.65.134.137:8080
- API Docs: http://159.65.134.137:8080/docs

---

## 📋 Quick Reference

### Check Service Status (On VPS)
```bash
docker-compose -f docker-compose.production.yml ps
```

### View Logs (On VPS)
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker logs aura-backend
docker logs aura-frontend
```

### Restart Services (On VPS)
```bash
docker-compose -f docker-compose.production.yml restart
```

### Stop Services (On VPS)
```bash
docker-compose -f docker-compose.production.yml down
```

---

## 🆘 Troubleshooting

### Cannot connect to VPS
```bash
# Check if VPS is reachable
ping 159.65.134.137

# Try with password
ssh -o PreferredAuthentications=password root@159.65.134.137
```

### Upload failed
```bash
# Use SFTP
sftp root@159.65.134.137
put aura-deploy.tar.gz /root/
```

### Docker not starting
```bash
# Check Docker status
systemctl status docker

# Start Docker
systemctl start docker
```

### Services not accessible
```bash
# Check if ports are open
netstat -tulpn | grep -E '3030|8080'

# Check firewall
ufw status
```

---

## 📊 Expected Output

### After Step 2 (docker-compose ps):
```
NAME              STATUS    PORTS
aura-backend      Up        0.0.0.0:8080->8080/tcp
aura-frontend     Up        0.0.0.0:3030->3030/tcp
aura-mongodb      Up        27017/tcp
aura-redis        Up        6379/tcp
```

### After Step 5 (curl backend):
```json
{
  "message": "Aura Protocol API",
  "version": "1.0.0",
  "description": "Polygon ZK-ID Credit Layer"
}
```

---

## ✅ Success Checklist

- [ ] Package uploaded to VPS
- [ ] Files extracted on VPS
- [ ] Docker installed
- [ ] Services started
- [ ] Firewall configured
- [ ] Backend accessible (port 8080)
- [ ] Frontend accessible (port 3030)
- [ ] Can access from browser

---

## 🎉 After Successful Deployment

Your application will be available at:
- **Frontend**: http://159.65.134.137:3030
- **Backend**: http://159.65.134.137:8080
- **API Docs**: http://159.65.134.137:8080/docs

Next steps:
1. Test all features
2. Setup monitoring
3. Configure domain (optional)
4. Setup SSL (optional)
