# Enhanced Live Dashboard Setup

## Installation

1. **Install Dependencies**
```bash
cd frontend
yarn add recharts
```

2. **Start Backend**
```bash
cd backend
python server.py
```

3. **Start Frontend**
```bash
cd frontend
yarn start
```

## Access Dashboard

- **Original Dashboard**: http://localhost:3000/monitor
- **Enhanced Dashboard**: http://localhost:3000/monitor/enhanced

## Features

### Real-time Monitoring
- ✅ Live WebSocket connection status
- ✅ Block-by-block monitoring with charts
- ✅ Transaction feed with real-time updates
- ✅ Badge minting notifications

### Visualizations
- 📊 Block activity area chart
- 📈 Gas usage line chart
- 📉 Transaction history tracking
- 🎨 Gradient UI with animations

### Stats Cards
- 👥 Total Users
- 🏆 Total Badges
- 📄 Total Passports
- 📈 24h Badge Activity with trends

## Configuration

Backend WebSocket endpoint: `ws://localhost:8080/ws/monitor`

Update in `.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

## Architecture

```
Frontend (React)
    ↓
WebSocket Service
    ↓
Backend (FastAPI)
    ↓
Block Monitor → WebSocket Manager → Clients
```

## Customization

Edit `EnhancedLiveDashboard.jsx` to:
- Change chart colors
- Adjust data retention (currently 20 points)
- Modify refresh intervals
- Add new metrics
