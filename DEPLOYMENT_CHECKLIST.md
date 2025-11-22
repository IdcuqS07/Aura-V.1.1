# ✅ Deployment Checklist - 21 Nov 2024

## Pre-Deployment
- [ ] VPS ready (159.65.134.137)
- [ ] SSH access: `ssh root@159.65.134.137`
- [ ] Domain purchased (aurapass.xyz)

## Step 1: Deploy ke VPS (10 menit)
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./quick-production-deploy.sh
```

**Verify:**
- [ ] Backend: http://159.65.134.137:8080/api/
- [ ] Frontend: http://159.65.134.137:3030

## Step 2: Setup DNS (5 menit)
Login ke domain provider (Cloudflare/Namecheap/etc):

```
Type  Name   Value              TTL
A     @      159.65.134.137     Auto
A     www    159.65.134.137     Auto
A     api    159.65.134.137     Auto
```

**Wait:** DNS propagation (5-30 menit)
**Check:** `ping aurapass.xyz` harus resolve ke 159.65.134.137

## Step 3: Setup SSL (5 menit)
```bash
ssh root@159.65.134.137

# Install SSL certificate
certbot --nginx \
  -d aurapass.xyz \
  -d www.aurapass.xyz \
  -d api.aurapass.xyz \
  --email your@email.com \
  --agree-tos \
  --non-interactive
```

**Verify:**
- [ ] https://aurapass.xyz (should show green lock)
- [ ] https://api.aurapass.xyz/api/ (should return JSON)

## Step 4: Update URLs (2 menit)
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./update-domain.sh
```

## Final Verification
- [ ] https://aurapass.xyz loads
- [ ] Connect wallet works
- [ ] API responds: https://api.aurapass.xyz/api/
- [ ] No console errors
- [ ] SSL certificate valid

## Monitoring
```bash
# View logs
ssh root@159.65.134.137 'docker logs aura-backend -f'

# Check status
ssh root@159.65.134.137 'docker ps'

# Restart if needed
ssh root@159.65.134.137 'cd /root && docker-compose -f docker-compose.production.yml restart'
```

## Troubleshooting

### Backend not responding
```bash
ssh root@159.65.134.137
docker logs aura-backend
docker restart aura-backend
```

### Frontend not loading
```bash
ssh root@159.65.134.137
docker logs aura-frontend
docker restart aura-frontend
```

### SSL issues
```bash
ssh root@159.65.134.137
certbot renew --force-renewal
systemctl reload nginx
```

## Rollback
```bash
ssh root@159.65.134.137
cd /root
docker-compose -f docker-compose.production.yml down
```

## Total Time: ~30 menit
- Deploy: 10 min
- DNS: 5-30 min (waiting)
- SSL: 5 min
- Update: 2 min
- Testing: 5 min
