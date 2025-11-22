# 🚀 Deployment Guide - Aura Protocol

## 📍 Current Setup

### Local Development (Your Mac)
- IP: 192.168.1.2 (Local Network)
- Frontend: http://localhost:3030 ✅
- Backend: http://localhost:8080 ✅

### Production Server (VPS)
- IP: 159.65.134.137
- Status: Need to deploy

## 🎯 Deployment Options

### Option 1: Local Testing (Current)
```bash
# Access on your local network
http://192.168.1.2:3030  # Frontend
http://192.168.1.2:8080  # Backend
```

### Option 2: Deploy to VPS (159.65.134.137)

#### Step 1: Upload to VPS
```bash
# Create deployment package
tar -czf aura-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='*.log' \
  backend/ frontend/ docker-compose.production.yml nginx.production.conf

# Upload to VPS
scp aura-deploy.tar.gz root@159.65.134.137:/root/

# SSH to VPS
ssh root@159.65.134.137
```

#### Step 2: Setup on VPS
```bash
# On VPS
cd /root
tar -xzf aura-deploy.tar.gz

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Set environment
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure

# Start services
docker-compose -f docker-compose.production.yml up -d
```

#### Step 3: Configure Firewall
```bash
# On VPS
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3030/tcp  # Frontend
ufw allow 8080/tcp  # Backend
ufw enable
```

#### Step 4: Verify
```bash
# Check services
docker-compose -f docker-compose.production.yml ps

# Test endpoints
curl http://159.65.134.137:8080/api/
curl http://159.65.134.137:3030
```

### Option 3: Quick Deploy Script

Create `deploy-to-vps.sh`:
```bash
#!/bin/bash

VPS_IP="159.65.134.137"
VPS_USER="root"

echo "📦 Creating deployment package..."
tar -czf aura-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='*.log' \
  backend/ frontend/ docker-compose.production.yml

echo "📤 Uploading to VPS..."
scp aura-deploy.tar.gz $VPS_USER@$VPS_IP:/root/

echo "🚀 Deploying on VPS..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /root
tar -xzf aura-deploy.tar.gz
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml ps
EOF

echo "✅ Deployment complete!"
echo "🌐 Access: http://$VPS_IP:3030"
```

## 🔍 Current Status Check

### Local (Working)
```bash
./quick-production-check.sh
```

### VPS (Need to Deploy)
```bash
ssh root@159.65.134.137
# Then run checks on VPS
```

## 📊 Production URLs

### After VPS Deployment:
- Frontend: http://159.65.134.137:3030
- Backend: http://159.65.134.137:8080
- API Docs: http://159.65.134.137:8080/docs

### With Domain (Optional):
- Frontend: https://aurapass.xyz
- Backend: https://api.aurapass.xyz

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Setup firewall (UFW)
- [ ] Configure SSL (Let's Encrypt)
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Setup log rotation

## 📝 Notes

1. **Local Development**: Already working on your Mac
2. **VPS Deployment**: Need to upload and deploy to 159.65.134.137
3. **Domain Setup**: Optional, requires DNS configuration

## 🆘 Troubleshooting

### Can't access VPS:
```bash
# Check SSH access
ssh root@159.65.134.137

# Check if VPS is running
ping 159.65.134.137
```

### Services not starting:
```bash
# Check Docker logs
docker-compose -f docker-compose.production.yml logs

# Check individual service
docker logs aura-backend
docker logs aura-frontend
```
