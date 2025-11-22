#!/bin/bash

echo "🚀 Starting Aura Protocol Production"
echo "====================================="

# Set environment variables
export REDIS_PASSWORD=AuraRedis2025Secure
export MONGO_PASSWORD=AuraPass2025Secure

# Stop existing processes
echo "🛑 Stopping existing services..."
pkill -f "npm start" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null
sleep 2

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.production.yml up -d mongodb redis

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 5

# Start backend
echo "🔧 Starting Backend..."
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
nohup python -m uvicorn server:app --host 0.0.0.0 --port 8080 > server.log 2>&1 &
cd ..

# Start frontend
echo "📱 Starting Frontend..."
cd frontend
nohup npm start > frontend.log 2>&1 &
cd ..

# Wait and check
sleep 5

echo ""
echo "✅ Production Started!"
echo ""
echo "📊 Access URLs:"
echo "   Frontend: http://159.65.134.137:3030"
echo "   Backend:  http://159.65.134.137:8080"
echo ""
echo "📝 Check status: ./quick-production-check.sh"
