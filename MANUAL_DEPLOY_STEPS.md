# 🚀 Manual VPS Deployment - Step by Step

## Prerequisites
- VPS IP: 159.65.134.137
- SSH access (password or key)

## Step 1: Create Deployment Package

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "

# Create package
tar -czf aura-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='*.log' \
  --exclude='build' \
  --exclude='.git' \
  backend/ frontend/ docker-compose.production.yml
```

## Step 2: Upload to VPS

```bash
# Upload file
scp aura-deploy.tar.gz root@159.65.134.137:/root/

# Or use password
scp -o PreferredAuthentications=password aura-deploy.tar.gz root@159.65.134.137:/root/
```

## Step 3: SSH to VPS

```bash
ssh root@159.65.134.137
```

## Step 4: Extract and Setup (On VPS)

```bash
# Extract
cd /root
tar -xzf aura-deploy.tar.gz

# Check files
ls -la
```

## Step 5: Install Docker (On VPS)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt update
apt install docker-compose -y

# Verify
docker --version
docker-compose --version
```

## Step 6: Setup Environment (On VPS)

```bash
# Set passwords
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure

# Or create .env file
echo "REDIS_PASSWORD=AuraRedis2025Secure" > .env
echo "MONGO_PASSWORD=AuraPass2025Secure" >> .env
```

## Step 7: Start Services (On VPS)

```bash
# Start with Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## Step 8: Configure Firewall (On VPS)

```bash
# Allow ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3030/tcp
ufw allow 8080/tcp
ufw enable

# Check status
ufw status
```

## Step 9: Verify Deployment (On VPS)

```bash
# Check containers
docker ps

# Test backend
curl http://localhost:8080/api/

# Test frontend
curl http://localhost:3030
```

## Step 10: Test from Browser

Open in browser:
- Frontend: http://159.65.134.137:3030
- Backend: http://159.65.134.137:8080
- API Docs: http://159.65.134.137:8080/docs

## Troubleshooting

### If Docker fails:
```bash
docker-compose -f docker-compose.production.yml logs
```

### If ports are blocked:
```bash
netstat -tulpn | grep -E '3030|8080'
```

### Restart services:
```bash
docker-compose -f docker-compose.production.yml restart
```
