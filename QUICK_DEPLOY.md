# 🚀 Quick Deployment Guide

## Option 1: Local Docker (Test Production Build)

```bash
# Build and run
docker-compose -f docker-compose.prod.yml up --build

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## Option 2: Vercel (Frontend) + Render (Backend)

### Frontend to Vercel
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Backend to Render
1. Go to https://render.com
2. New Web Service
3. Connect GitHub: `IdcuqS07/Aura-V.1.1`
4. Settings:
   - Build Command: `cd "Aura-V.1.0 /backend" && pip install -r requirements.txt`
   - Start Command: `cd "Aura-V.1.0 /backend" && python server.py`
   - Add environment variables from `.env`

## Option 3: Railway (Full Stack)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Option 4: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create App
3. Connect GitHub repo
4. Configure:
   - Backend: Python, port 8080
   - Frontend: Node.js, port 3000

## Option 5: Manual VPS

See `PRODUCTION_DEPLOYMENT.md`

---

## Fastest: Vercel + Render (5 minutes)

### Step 1: Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

### Step 2: Deploy Backend to Render
1. https://render.com → New Web Service
2. Connect repo
3. Root: `Aura-V.1.0 /backend`
4. Build: `pip install -r requirements.txt`
5. Start: `python server.py`
6. Add env vars

### Step 3: Update Frontend URL
Update `REACT_APP_BACKEND_URL` in Vercel to Render URL

Done! ✅
