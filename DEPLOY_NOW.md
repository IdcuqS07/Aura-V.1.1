# 🚀 Deploy Production - 21 Nov 2024

## VPS Info
- IP: 159.65.134.137
- Domain: aurapass.xyz (setup DNS dulu)

## Quick Deploy (3 Langkah)

### 1️⃣ Deploy ke VPS
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./production-deploy.sh 159.65.134.137
```

### 2️⃣ Setup Domain & SSL
```bash
# Login ke VPS
ssh root@159.65.134.137

# Setup SSL (setelah DNS ready)
certbot --nginx -d aurapass.xyz -d www.aurapass.xyz -d api.aurapass.xyz --email your@email.com --agree-tos
```

### 3️⃣ Update Frontend URL
```bash
# Di VPS, update frontend env
cd /root/aura-protocol
nano frontend/.env

# Ganti:
REACT_APP_BACKEND_URL=https://api.aurapass.xyz
REACT_APP_REDIRECT_URI=https://aurapass.xyz/poh/callback

# Restart
docker-compose -f docker-compose.production.yml restart frontend
```

## DNS Setup (Cloudflare/Domain Provider)
```
Type  Name   Value
A     @      159.65.134.137
A     www    159.65.134.137
A     api    159.65.134.137
```

## Verify
- Frontend: https://aurapass.xyz
- API: https://api.aurapass.xyz/api/
- Logs: `ssh root@159.65.134.137 'docker logs aura-backend -f'`

## Troubleshooting
```bash
# Check containers
docker ps

# Restart all
docker-compose -f docker-compose.production.yml restart

# View logs
docker logs aura-backend -f
docker logs aura-frontend -f
```
