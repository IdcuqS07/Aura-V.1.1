# 🌐 External Access Configuration

## Access URLs

### Local Access
```
http://localhost:3030
```

### External Access
```
http://159.65.134.137:3030
```

## Configuration Applied

- **HOST**: `0.0.0.0` (allows external connections)
- **PORT**: `3030`

## Firewall Requirements

Ensure port 3030 is open:
```bash
# Check if port is accessible
curl http://159.65.134.137:3030

# If using UFW firewall
sudo ufw allow 3030/tcp
```

## Restart Server

```bash
cd frontend
npm start
```

## Notes

- React dev server now accepts connections from any IP
- For production, use nginx reverse proxy (already configured in nginx.production.conf)
- Backend API runs on port 8080
