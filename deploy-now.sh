#!/bin/bash

echo "🚀 Aura Protocol - Enhanced Architecture Deployment"
echo "===================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Redis is available
echo "🔍 Checking Redis availability..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
    REDIS_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Redis is not running${NC}"
    echo "   Enhanced features will work in fallback mode"
    REDIS_AVAILABLE=false
fi

echo ""
echo "📦 Installing Python dependencies..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install minimal dependencies
echo "Installing minimal dependencies..."
pip install -q redis celery numpy pandas scikit-learn 2>/dev/null || echo "Some packages may already be installed"

echo ""
echo "🔧 Configuration:"
echo "   - Backend Port: 8080"
echo "   - Frontend Port: 3030"
echo "   - Redis: $([ "$REDIS_AVAILABLE" = true ] && echo "Enabled" || echo "Disabled (fallback mode)")"

echo ""
echo "🎯 Deployment Options:"
echo ""
echo "1. Start Backend Only (Minimal)"
echo "2. Start Backend + Celery Worker (Full)"
echo "3. Start All Services (Backend + Celery + Event Listener)"
echo "4. Start with Docker"
echo ""
read -p "Choose option (1-4): " option

case $option in
    1)
        echo ""
        echo "🚀 Starting Backend API..."
        python server.py
        ;;
    2)
        echo ""
        echo "🚀 Starting Backend + Celery..."
        
        # Start Celery in background
        celery -A message_queue.celery_app worker --loglevel=info &
        CELERY_PID=$!
        
        sleep 2
        
        # Start Backend
        python server.py
        
        # Cleanup on exit
        trap "kill $CELERY_PID" EXIT
        ;;
    3)
        echo ""
        echo "🚀 Starting All Services..."
        
        # Start Celery in background
        celery -A message_queue.celery_app worker --loglevel=info &
        CELERY_PID=$!
        
        # Start Event Listener in background
        python event_listener_runner.py &
        LISTENER_PID=$!
        
        sleep 2
        
        # Start Backend
        python server.py
        
        # Cleanup on exit
        trap "kill $CELERY_PID $LISTENER_PID" EXIT
        ;;
    4)
        echo ""
        echo "🐳 Starting with Docker..."
        cd ..
        
        if ! docker info > /dev/null 2>&1; then
            echo -e "${RED}❌ Docker is not running${NC}"
            echo "Please start Docker first"
            exit 1
        fi
        
        docker-compose -f docker-compose.enhanced.yml up -d
        
        echo ""
        echo -e "${GREEN}✅ Services started with Docker${NC}"
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
        echo "🛑 Stop services:"
        echo "   docker-compose -f docker-compose.enhanced.yml down"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
