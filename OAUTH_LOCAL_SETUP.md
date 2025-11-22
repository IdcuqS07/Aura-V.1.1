# OAuth Setup untuk Local Development

## ⚠️ Masalah yang Diperbaiki

**Sebelumnya:**
```
redirect_uri=https://www.aurapass.xyz/poh/callback
```
❌ Redirect ke production, tidak bisa digunakan di localhost

**Sekarang:**
```
redirect_uri=http://localhost:3030/poh/callback
```
✅ Redirect ke localhost untuk development

## 🔧 Konfigurasi

### 1. Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_GITHUB_CLIENT_ID=demo_client_id
REACT_APP_TWITTER_CLIENT_ID=demo_twitter_id
REACT_APP_REDIRECT_URI=http://localhost:3030/poh/callback
PORT=3030
```

### 2. Backend (.env)
```env
GITHUB_CLIENT_ID=demo_client_id
GITHUB_CLIENT_SECRET=demo_client_secret
GITHUB_REDIRECT_URI=http://localhost:3030/poh/callback

TWITTER_CLIENT_ID=demo_twitter_id
TWITTER_CLIENT_SECRET=demo_twitter_secret
TWITTER_REDIRECT_URI=http://localhost:3030/poh/callback
```

## 🔑 Setup Real OAuth (Optional)

Jika ingin test OAuth yang sebenarnya:

### GitHub OAuth App
1. Buka: https://github.com/settings/developers
2. Click "New OAuth App"
3. Isi:
   - **Application name**: Aura Protocol Local
   - **Homepage URL**: http://localhost:3030
   - **Authorization callback URL**: http://localhost:3030/poh/callback
4. Copy Client ID dan Client Secret
5. Update di `.env` files

### Twitter OAuth App
1. Buka: https://developer.twitter.com/
2. Create new app
3. Setup callback URL: http://localhost:3030/poh/callback
4. Copy API Key dan Secret
5. Update di `.env` files

## 🚀 Restart Aplikasi

Setelah update .env, restart frontend:

```bash
# Stop frontend
# (Ctrl+C di terminal atau kill process)

# Start ulang
cd frontend
PORT=3030 yarn start
```

Backend tidak perlu restart karena menggunakan mock data.

## ✅ Testing

1. Buka: http://localhost:3030/proof-of-humanity
2. Connect wallet
3. Click "Connect GitHub" atau "Connect Twitter"
4. Sekarang redirect URI sudah benar: `http://localhost:3030/poh/callback`

## 📝 Notes

- **Demo credentials** tidak akan bekerja untuk OAuth real
- Untuk testing UI, bisa skip OAuth dan langsung test fitur lain
- OAuth hanya diperlukan untuk Proof of Humanity feature
- Fitur lain (Passport, Analytics, Badges) tidak memerlukan OAuth

## 🔄 Mode Development vs Production

**Development (localhost:3030):**
- Redirect URI: `http://localhost:3030/poh/callback`
- Backend: `http://localhost:8080`

**Production (aurapass.xyz):**
- Redirect URI: `https://www.aurapass.xyz/poh/callback`
- Backend: `https://www.aurapass.xyz/api`

Frontend otomatis detect environment dan gunakan redirect URI yang sesuai.
