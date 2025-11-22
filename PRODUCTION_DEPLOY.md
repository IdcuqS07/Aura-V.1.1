# 🚀 Production Deployment Guide - Aura Protocol

## 📋 Pre-Deployment Checklist

### 1. Domain & DNS Setup
- [ ] Domain ready (e.g., aurapass.xyz)
- [ ] DNS A record: `@` → VPS IP
- [ ] DNS A record: `api` → VPS IP
- [ ] DNS A record: `www` → VPS IP

### 2. Credentials Ready
- [ ] GitHub OAuth (Client ID + Secret)
- [ ] Twitter OAuth (API Key + Secret)
- [ ] Alchemy API Key
- [ ] MongoDB password (strong)
- [ ] Redis password (strong)

### 3. VPS Requirements
- [ ] Ubuntu 22.04 LTS
- [ ] 2GB+ RAM
- [ ] 20GB+ Storage
- [ ] Root access

---

## 🎯 Quick Deploy (Recommended)

### Step 1: Prepare Environment File

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 /backend"
cp .env.example .env.production
```

Edit `.env.production`:
```bash
# Production MongoDB
MONGO_URL=mongodb://admin:STRONG_PASSWORD_HERE@mongodb:27017
DB_NAME=aura_protocol

# Production CORS
CORS_ORIGINS=https://aurapass.xyz,https://www.aurapass.xyz,https://api.aurapass.xyz

# GitHub OAuth
GITHUB_CLIENT_ID=your_real_github_client_id
GITHUB_CLIENT_SECRET=your_real_github_secret
GITHUB_REDIRECT_URI=https://aurapass.xyz/poh/callback

# Twitter OAuth
TWITTER_CLIENT_ID=your_real_twitter_key
TWITTER_CLIENT_SECRET=your_real_twitter_secret
TWITTER_REDIRECT_URI=https://aurapass.xyz/poh/callback

# Alchemy
ALCHEMY_API_KEY=your_real_alchemy_key
ALCHEMY_POLYGON_URL=https://polygon-amoy.g.alchemy.com/v2/your_key

# Polygon
POLYGON_PRIVATE_KEY=your_deployer_private_key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology

# Redis
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379/0
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# Contracts
BADGE_CONTRACT_ADDRESS=0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
PASSPORT_CONTRACT_ADDRESS=0x1112373c9954B9bbFd91eb21175699b609A1b551
```

### Step 2: Deploy to VPS

```bash
# Run deployment script
./production-deploy.sh YOUR_VPS_IP
```

---

## 🔧 Manual Deployment (Step by Step)

### 1. Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Nginx
apt install nginx certbot python3-certbot-nginx -y
```

### 3. Upload Project

```bash
# From local machine
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
tar czf aura-production.tar.gz \
  backend/ \
  frontend/ \
  docker-compose.production.yml \
  nginx.production.conf

scp aura-production.tar.gz root@YOUR_VPS_IP:/root/
```

### 4. Setup on VPS

```bash
# On VPS
cd /root
tar xzf aura-production.tar.gz
cd aura-protocol

# Copy production env
cp backend/.env.production backend/.env

# Start services
docker-compose -f docker-compose.production.yml up -d
```

### 5. Configure Nginx

```bash
# Copy nginx config
cp nginx.production.conf /etc/nginx/sites-available/aura
ln -s /etc/nginx/sites-available/aura /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

### 6. Setup SSL (Let's Encrypt)

```bash
# Get SSL certificate
certbot --nginx -d aurapass.xyz -d www.aurapass.xyz -d api.aurapass.xyz

# Auto-renewal
certbot renew --dry-run
```

---

## 📊 Verify Deployment

### Check Services

```bash
# Check Docker containers
docker ps

# Should see:
# - aura-backend
# - aura-frontend
# - aura-redis
# - aura-mongodb
# - aura-celery-worker
# - aura-event-listener
```

### Test Endpoints

```bash
# API Health
curl https://api.aurapass.xyz/api/

# Enhanced Status
curl https://api.aurapass.xyz/api/v2/status

# Frontend
curl https://aurapass.xyz
```

### Check Logs

```bash
# Backend logs
docker logs aura-backend -f

# Celery logs
docker logs aura-celery-worker -f

# Event listener logs
docker logs aura-event-listener -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] Only ports 80, 443, 22 open
- [ ] SSH key authentication only
- [ ] Strong passwords for MongoDB/Redis
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Fail2ban installed

### Setup Firewall

```bash
# Enable UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban
```

---

## 📈 Monitoring Setup

### Install Monitoring Tools

```bash
# Install htop
apt install htop -y

# Install Docker stats
docker stats
```

### Setup Uptime Monitoring

Use external services:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- https://aurapass.xyz
- https://api.aurapass.xyz/api/

---

## 🔄 Update & Maintenance

### Update Application

```bash
# On local machine
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./update-production.sh YOUR_VPS_IP
```

### Backup Database

```bash
# On VPS
docker exec aura-mongodb mongodump --out /backup/$(date +%Y%m%d)
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker restart aura-backend
```

---

## 🆘 Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker logs aura-backend

# Common issues:
# - MongoDB connection failed → Check MONGO_URL
# - Redis connection failed → Check REDIS_URL
# - Port already in use → Check docker ps
```

### SSL Certificate Issues

```bash
# Renew certificate
certbot renew --force-renewal

# Check certificate
certbot certificates
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart services
docker-compose restart
```

---

## 📊 Performance Optimization

### Enable Redis Persistence

```yaml
# In docker-compose.production.yml
redis:
  command: redis-server --appendonly yes --requirepass YOUR_PASSWORD
```

### MongoDB Indexes

```bash
# Connect to MongoDB
docker exec -it aura-mongodb mongosh -u admin -p

# Create indexes
use aura_protocol
db.users.createIndex({ wallet_address: 1 })
db.badges.createIndex({ wallet_address: 1 })
db.passports.createIndex({ wallet_address: 1 })
```

### Nginx Caching

Already configured in `nginx.production.conf`

---

## 🎯 Post-Deployment Tasks

1. **Test All Features**
   - [ ] Connect wallet
   - [ ] Mint passport
   - [ ] View badges
   - [ ] Check analytics

2. **Setup Monitoring**
   - [ ] Uptime monitoring
   - [ ] Error tracking (Sentry)
   - [ ] Analytics (Google Analytics)

3. **Documentation**
   - [ ] Update API docs
   - [ ] User guide
   - [ ] Developer docs

4. **Marketing**
   - [ ] Announce launch
   - [ ] Social media
   - [ ] Community engagement

---

## 📞 Support

If issues occur:
1. Check logs: `docker logs aura-backend`
2. Check status: `docker ps`
3. Restart: `docker-compose restart`
4. Review this guide

---

## ✅ Success Criteria

Deployment successful when:
- ✅ https://aurapass.xyz loads
- ✅ https://api.aurapass.xyz/api/ returns JSON
- ✅ SSL certificate valid
- ✅ All Docker containers running
- ✅ Can connect wallet
- ✅ Can mint passport
- ✅ Analytics working

---

**Estimated Time: 1-2 hours**
**Difficulty: Medium**
**Cost: $5-10/month (VPS)**
