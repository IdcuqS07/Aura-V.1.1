# 🔧 Maintenance Guide - Aura Protocol

## Daily Checks

### Quick Health Check
```bash
./monitor.sh
```

### Check Logs for Errors
```bash
ssh root@159.65.134.137 'docker logs aura-backend --tail 100 | grep -i error'
```

## Common Tasks

### 1. Update Application
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-complete.sh
```

### 2. Restart Services
```bash
# Restart all
ssh root@159.65.134.137 'cd /root && docker-compose -f docker-compose.production.yml restart'

# Restart specific service
ssh root@159.65.134.137 'docker restart aura-backend'
ssh root@159.65.134.137 'docker restart aura-frontend'
```

### 3. View Logs
```bash
# Backend
ssh root@159.65.134.137 'docker logs aura-backend -f'

# Frontend
ssh root@159.65.134.137 'docker logs aura-frontend -f'

# All containers
ssh root@159.65.134.137 'docker-compose -f /root/docker-compose.production.yml logs -f'
```

### 4. Database Backup
```bash
# Manual backup
ssh root@159.65.134.137 'docker exec aura-mongodb mongodump --out /backup/$(date +%Y%m%d)'

# Download backup
scp -r root@159.65.134.137:/root/backups ./local-backups
```

### 5. SSL Certificate Renewal
```bash
# Auto-renewal (runs automatically)
ssh root@159.65.134.137 'certbot renew'

# Force renewal
ssh root@159.65.134.137 'certbot renew --force-renewal'
```

## Troubleshooting

### Backend Not Responding
```bash
ssh root@159.65.134.137
docker logs aura-backend --tail 50
docker restart aura-backend
```

### High Memory Usage
```bash
ssh root@159.65.134.137
free -h
docker stats --no-stream
docker-compose -f /root/docker-compose.production.yml restart
```

### Database Issues
```bash
ssh root@159.65.134.137
docker logs aura-mongodb
docker restart aura-mongodb
```

### Clear Redis Cache
```bash
ssh root@159.65.134.137 'docker exec aura-redis redis-cli -a AuraRedis2025Secure FLUSHALL'
```

## Performance Optimization

### Check Resource Usage
```bash
ssh root@159.65.134.137 'docker stats --no-stream'
```

### Clean Docker
```bash
ssh root@159.65.134.137 'docker system prune -af'
```

## Security Updates

### Update System
```bash
ssh root@159.65.134.137
apt update && apt upgrade -y
reboot
```

### Check Firewall
```bash
ssh root@159.65.134.137 'ufw status'
```

## Monitoring Setup

### UptimeRobot (Free)
1. Go to uptimerobot.com
2. Add monitors:
   - https://aurapass.xyz
   - https://api.aurapass.xyz/api/

### Check SSL Expiry
```bash
ssh root@159.65.134.137 'certbot certificates'
```
