#!/bin/bash

echo "🚀 Starting Aura Protocol - Enhanced Architecture"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo ""
echo "📦 Starting infrastructure services..."
docker-compose -f docker-compose.enhanced.yml up -d redis mongodb

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "🔧 Starting backend services..."
docker-compose -f docker-compose.enhanced.yml up -d backend celery-worker celery-beat event-listener

echo ""
echo "⏳ Waiting for backend to be ready..."
sleep 5

echo ""
echo "🎨 Starting frontend..."
docker-compose -f docker-compose.enhanced.yml up -d frontend

echo ""
echo "📊 Starting monitoring tools..."
docker-compose -f docker-compose.enhanced.yml up -d redis-commander mongo-express

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:        http://localhost:3030"
echo "   Backend API:     http://localhost:8080"
echo "   Redis Commander: http://localhost:8081"
echo "   Mongo Express:   http://localhost:8082"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f docker-compose.enhanced.yml logs -f"
echo ""
echo "🛑 Stop all services:"
echo "   docker-compose -f docker-compose.enhanced.yml down"
echo ""
echo "🎉 Aura Protocol is ready!"
