# 🚀 Deploy ke VPS - Quick Guide

## VPS Info
- **IP**: 159.65.134.137
- **User**: root
- **OS**: Ubuntu/Debian

## 🎯 Deploy (1 Command)

```bash
cd "/Users/idcuq/Documents/Aura V.1.1/Aura-V.1.0 "
./deploy-to-vps.sh
```

## ✅ Verify Deployment

```bash
# Test API
curl http://159.65.134.137:8080/api/

# Test enhanced status
curl http://159.65.134.137:8080/api/v2/status

# Test analytics
curl http://159.65.134.137:8080/api/analytics
```

## 📊 Access Points

- Backend API: http://159.65.134.137:8080
- API Docs: http://159.65.134.137:8080/docs
- Enhanced Status: http://159.65.134.137:8080/api/v2/status

## 🔧 Manual Commands

### View Logs
```bash
ssh root@159.65.134.137 'tail -f /root/backend.log'
```

### Restart Backend
```bash
ssh root@159.65.134.137 'cd /root/aura-protocol/backend && source venv/bin/activate && pkill -f server.py && nohup python server.py > /root/backend.log 2>&1 &'
```

### Check Status
```bash
ssh root@159.65.134.137 'pgrep -f "python.*server.py" && echo "Running" || echo "Stopped"'
```

---

**Ready to deploy?** Run: `./deploy-to-vps.sh` 🚀
