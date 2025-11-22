# 🚀 Aura Protocol - Production Deployment

## 📁 File Deployment yang Tersedia

### 1. Quick Reference
- **QUICK_DEPLOY.txt** - Panduan cepat satu halaman
- **DEPLOY_NOW.md** - Panduan ringkas 3 langkah
- **DEPLOYMENT_CHECKLIST.md** - Checklist lengkap dengan troubleshooting

### 2. Deployment Scripts
- **deploy-complete.sh** - ⭐ ONE COMMAND deploy (recommended)
- **quick-production-deploy.sh** - Deploy tanpa SSL
- **production-deploy.sh** - Deploy lengkap dengan validasi
- **update-domain.sh** - Update URLs setelah SSL setup

### 3. Monitoring
- **monitor.sh** - Check status sistem & services

### 4. Configuration Files
- **docker-compose.production.yml** - Docker compose untuk production
- **nginx.production.conf** - Nginx config dengan SSL & rate limiting
- **backend/.env.production** - Backend environment variables
- **frontend/.env.production** - Frontend environment variables

## 🎯 Cara Deploy (Pilih Salah Satu)

### Option A: One Command (Paling Mudah)
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-complete.sh
```
Kemudian ikuti instruksi di layar untuk DNS & SSL.

### Option B: Step by Step
```bash
# 1. Deploy
./quick-production-deploy.sh

# 2. Setup DNS di domain provider
# 3. Setup SSL (setelah DNS ready)
ssh root@159.65.134.137
certbot --nginx -d aurapass.xyz -d www.aurapass.xyz -d api.aurapass.xyz

# 4. Update URLs
./update-domain.sh
```

## 📋 Pre-Requirements

1. **VPS Ready**
   - IP: 159.65.134.137
   - OS: Ubuntu 22.04
   - RAM: 2GB+
   - SSH access: `ssh root@159.65.134.137`

2. **Domain Ready**
   - Domain: aurapass.xyz
   - Access ke DNS management

3. **Credentials Ready** (sudah ada di .env.production)
   - GitHub OAuth ✅
   - Twitter OAuth ✅
   - Alchemy API ✅
   - MongoDB password ✅
   - Redis password ✅

## ✅ Verification Steps

Setelah deployment, verify:

1. **Services Running**
   ```bash
   ssh root@159.65.134.137 'docker ps'
   ```
   Harus ada 6 containers: backend, frontend, mongodb, redis, celery, event-listener

2. **API Working**
   ```bash
   curl https://api.aurapass.xyz/api/
   ```
   Harus return JSON response

3. **Frontend Loading**
   - Buka https://aurapass.xyz
   - Harus load tanpa error
   - Check browser console (F12)

4. **SSL Valid**
   - Green lock icon di browser
   - Certificate valid untuk aurapass.xyz

## 🔍 Monitoring

```bash
# Quick status check
./monitor.sh

# View live logs
ssh root@159.65.134.137 'docker logs aura-backend -f'

# Check all containers
ssh root@159.65.134.137 'docker ps'
```

## 🆘 Troubleshooting

### Backend tidak respond
```bash
ssh root@159.65.134.137
docker logs aura-backend
docker restart aura-backend
```

### Frontend tidak load
```bash
ssh root@159.65.134.137
docker logs aura-frontend
docker restart aura-frontend
```

### SSL error
```bash
ssh root@159.65.134.137
certbot renew --force-renewal
systemctl reload nginx
```

### Restart semua services
```bash
ssh root@159.65.134.137
cd /root
docker-compose -f docker-compose.production.yml restart
```

## 📊 Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
├─→ Frontend (Port 3030) → https://aurapass.xyz
└─→ Backend (Port 8080)  → https://api.aurapass.xyz
        ↓
    ├─→ MongoDB (Port 27017)
    ├─→ Redis (Port 6379)
    ├─→ Celery Worker
    └─→ Event Listener
```

## 🔐 Security Features

- ✅ SSL/TLS encryption (Let's Encrypt)
- ✅ Firewall configured (UFW)
- ✅ Rate limiting (Nginx)
- ✅ CORS protection
- ✅ Strong passwords (MongoDB, Redis)
- ✅ Security headers
- ✅ Only ports 22, 80, 443 open

## 📈 Performance

- ✅ Nginx caching
- ✅ Gzip compression
- ✅ Redis caching
- ✅ Docker resource limits
- ✅ MongoDB indexes

## 🔄 Update Application

```bash
# Update code
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-complete.sh

# Or manual update
ssh root@159.65.134.137
cd /root
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 💾 Backup

```bash
# Backup database
ssh root@159.65.134.137
docker exec aura-mongodb mongodump --out /backup/$(date +%Y%m%d)

# Download backup
scp -r root@159.65.134.137:/root/backups ./backups-local
```

## 📞 Support

Jika ada masalah:
1. Check logs: `./monitor.sh`
2. Check containers: `ssh root@159.65.134.137 'docker ps'`
3. Restart services: `ssh root@159.65.134.137 'cd /root && docker-compose -f docker-compose.production.yml restart'`
4. Review documentation: DEPLOYMENT_CHECKLIST.md

## ⏱️ Estimated Timeline

| Task | Time |
|------|------|
| Deploy to VPS | 10 min |
| DNS Setup | 5 min |
| DNS Propagation | 5-30 min |
| SSL Setup | 5 min |
| Update URLs | 2 min |
| Testing | 5 min |
| **Total** | **30-60 min** |

## 🎯 Success Criteria

Deployment berhasil jika:
- ✅ https://aurapass.xyz loads
- ✅ https://api.aurapass.xyz/api/ returns JSON
- ✅ SSL certificate valid (green lock)
- ✅ All 6 Docker containers running
- ✅ Can connect wallet
- ✅ No console errors

---

**Ready to deploy? Start with:**
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-complete.sh
```

Good luck! 🚀
