# 🚀 Production Deployment Guide

## Prerequisites

- VPS/Server (Ubuntu 20.04+)
- Domain name
- MongoDB Atlas account (or local MongoDB)
- SSL certificate (Let's Encrypt)
- Node.js 18+
- Python 3.9+
- Nginx

---

## Quick Deploy to Production

### Option 1: Automated Script
```bash
./production-deploy.sh
```

### Option 2: Manual Deployment

---

## Step-by-Step Production Setup

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nginx mongodb python3-pip nodejs npm git

# Install PM2 for process management
sudo npm install -g pm2

# Install Graph CLI
sudo npm install -g @graphprotocol/graph-cli
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/IdcuqS07/Aura-V.1.1.git
cd Aura-V.1.1/Aura-V.1.0\ 
sudo chown -R $USER:$USER .
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env
```

**Update .env for production:**
```env
# MongoDB (use MongoDB Atlas for production)
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=aura_protocol_prod

# CORS (your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Polygon Mainnet (or keep Amoy for testnet)
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_PRIVATE_KEY=your_production_private_key

# Contract Addresses (deploy to mainnet first)
BADGE_CONTRACT_ADDRESS=0x...
PASSPORT_CONTRACT_ADDRESS=0x...
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env.production
nano .env.production
```

**Update .env.production:**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_NETWORK=polygon
```

```bash
# Build for production
yarn build
```

### 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/aura-protocol
```

**Nginx config:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/Aura-V.1.1/Aura-V.1.0\ /frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/aura-protocol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 7. Start Services with PM2

```bash
cd /var/www/Aura-V.1.1/Aura-V.1.0\ /backend

# Start backend
pm2 start server.py --name aura-backend --interpreter python3

# Save PM2 config
pm2 save
pm2 startup
```

### 8. Deploy Subgraph to Mainnet

```bash
cd ../subgraph

# Update subgraph.yaml for mainnet
nano subgraph.yaml
```

Change network to `polygon` (mainnet):
```yaml
network: polygon
```

```bash
# Deploy
graph auth --studio <YOUR_DEPLOY_KEY>
graph deploy --studio aura-protocol
```

---

## Environment Variables Checklist

### Backend (.env)
- [ ] MONGO_URL (MongoDB Atlas)
- [ ] POLYGON_RPC_URL (Mainnet)
- [ ] POLYGON_PRIVATE_KEY (Production key)
- [ ] BADGE_CONTRACT_ADDRESS (Mainnet)
- [ ] PASSPORT_CONTRACT_ADDRESS (Mainnet)
- [ ] CORS_ORIGINS (Production domains)
- [ ] GITHUB_CLIENT_ID/SECRET
- [ ] TWITTER_CLIENT_ID/SECRET

### Frontend (.env.production)
- [ ] REACT_APP_BACKEND_URL
- [ ] REACT_APP_NETWORK=polygon

---

## Monitoring & Maintenance

### Check Status
```bash
pm2 status
pm2 logs aura-backend
```

### Update Deployment
```bash
cd /var/www/Aura-V.1.1/Aura-V.1.0\ 
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart aura-backend

# Frontend
cd ../frontend
yarn install
yarn build
```

### Backup Database
```bash
# MongoDB Atlas has automatic backups
# Or manual backup:
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)
```

---

## Security Checklist

- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Store private keys in secure vault
- [ ] Enable firewall (ufw)
- [ ] Use SSL/TLS (HTTPS)
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domains
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

---

## Firewall Setup

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Performance Optimization

### Backend
- Use Redis for caching
- Enable gzip compression
- Set up CDN for static assets

### Frontend
- Enable service worker
- Optimize images
- Use code splitting

### Database
- Create indexes
- Use connection pooling
- Regular cleanup of old data

---

## Troubleshooting

**Backend not starting:**
```bash
pm2 logs aura-backend
source venv/bin/activate
python server.py  # Test manually
```

**Frontend 404 errors:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**WebSocket connection failed:**
- Check Nginx WebSocket config
- Verify CORS settings
- Check firewall rules

---

## Production URLs

After deployment:
- **Frontend:** https://yourdomain.com
- **API:** https://api.yourdomain.com
- **API Docs:** https://api.yourdomain.com/docs
- **Subgraph:** https://thegraph.com/studio/subgraph/aura-protocol

---

## Cost Estimation

- **VPS:** $5-20/month (DigitalOcean, Linode)
- **MongoDB Atlas:** Free tier or $9/month
- **Domain:** $10-15/year
- **The Graph:** Free for testnet, pay-per-query for mainnet

---

## Next Steps

1. Deploy contracts to Polygon mainnet
2. Update contract addresses in .env
3. Deploy subgraph to mainnet
4. Set up monitoring (Sentry, LogRocket)
5. Configure analytics (Google Analytics)
6. Set up backup automation
7. Create CI/CD pipeline (GitHub Actions)

---

**Ready for Production!** 🚀
