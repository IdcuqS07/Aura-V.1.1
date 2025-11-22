# 🚀 VPS Commands Cheat Sheet

## Quick Deploy (Copy-Paste Ready)

### 1. Install Dependencies (Run once)
```bash
apt-get update && apt-get install -y python3-pip python3-venv redis-server && systemctl start redis-server && systemctl enable redis-server && redis-cli ping
```

### 2. Setup Project
```bash
mkdir -p /root/aura-protocol/backend && cd /root/aura-protocol/backend
```

### 3. Create Requirements
```bash
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
motor==3.3.2
web3==6.11.3
httpx==0.25.2
python-dotenv==1.0.0
EOF

cat > requirements-enhanced.txt << 'EOF'
redis==5.0.1
celery==5.3.4
numpy==1.26.2
EOF
```

### 4. Setup Python Environment
```bash
python3 -m venv venv && source venv/bin/activate && pip install -q --upgrade pip && pip install -q -r requirements.txt -r requirements-enhanced.txt
```

### 5. Create .env File
```bash
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017/
DB_NAME=aura_protocol
CORS_ORIGINS=*
PORT=8080
REDIS_URL=redis://localhost:6379/0
EOF
```

### 6. Upload Files (From Local)
**Run on your local machine:**
```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./upload-to-vps.sh
```

### 7. Start Backend (On VPS)
```bash
cd /root/aura-protocol/backend && source venv/bin/activate && pkill -f server.py; nohup python server.py > /root/backend.log 2>&1 &
```

### 8. Check Status
```bash
sleep 3 && ps aux | grep "python.*server.py" | grep -v grep && echo "✅ Backend is running" || echo "❌ Backend failed"
```

### 9. Test API
```bash
curl http://localhost:8080/api/ && echo "" && curl http://localhost:8080/api/v2/status
```

---

## 🔧 Management Commands

### View Logs (Real-time)
```bash
tail -f /root/backend.log
```

### Restart Backend
```bash
cd /root/aura-protocol/backend && source venv/bin/activate && pkill -f server.py && nohup python server.py > /root/backend.log 2>&1 &
```

### Stop Backend
```bash
pkill -f "python.*server.py"
```

### Check if Running
```bash
ps aux | grep "python.*server.py" | grep -v grep
```

### Check Port 8080
```bash
netstat -tulpn | grep 8080
```

### Check Redis
```bash
redis-cli ping
```

---

## 🧪 Testing Commands

### Test from VPS
```bash
curl http://localhost:8080/api/
curl http://localhost:8080/api/analytics
curl http://localhost:8080/api/v2/status
```

### Test from Outside (Local)
```bash
curl http://159.65.134.137:8080/api/
curl http://159.65.134.137:8080/api/v2/status
```

---

## 🔥 One-Line Deploy (All Steps)

```bash
apt-get update && apt-get install -y python3-pip python3-venv redis-server && systemctl start redis-server && mkdir -p /root/aura-protocol/backend && cd /root/aura-protocol/backend && cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
motor==3.3.2
web3==6.11.3
httpx==0.25.2
python-dotenv==1.0.0
redis==5.0.1
celery==5.3.4
numpy==1.26.2
EOF
python3 -m venv venv && source venv/bin/activate && pip install -q -r requirements.txt && cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017/
DB_NAME=aura_protocol
CORS_ORIGINS=*
PORT=8080
REDIS_URL=redis://localhost:6379/0
EOF
echo "✅ Setup complete! Now upload files with: ./upload-to-vps.sh"
```

---

## 📊 Monitoring

### Check System Resources
```bash
htop
```

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -h
```

### Check Network
```bash
netstat -tulpn
```

---

## 🐛 Troubleshooting

### Port 8080 Already in Use
```bash
lsof -ti:8080 | xargs kill -9
```

### Backend Won't Start
```bash
tail -50 /root/backend.log
```

### Redis Not Running
```bash
systemctl status redis-server
systemctl restart redis-server
```

### Python Import Errors
```bash
cd /root/aura-protocol/backend
source venv/bin/activate
pip install -r requirements.txt -r requirements-enhanced.txt
```

---

## 🎯 Quick Access URLs

- **Backend API**: http://159.65.134.137:8080
- **API Docs**: http://159.65.134.137:8080/docs
- **Enhanced Status**: http://159.65.134.137:8080/api/v2/status
- **Analytics**: http://159.65.134.137:8080/api/analytics

---

**Ready to deploy? Start with step 1!** 🚀
