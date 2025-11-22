#!/bin/bash

echo "🚀 Aura Protocol - Production Deployment"
echo "========================================"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please don't run as root"
   exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo "Copy .env.production.example and configure it first"
    exit 1
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. MongoDB Atlas configured? (y/n)"
read -r mongo_check
if [ "$mongo_check" != "y" ]; then
    echo "❌ Configure MongoDB Atlas first"
    exit 1
fi

echo "2. Domain DNS configured? (y/n)"
read -r dns_check
if [ "$dns_check" != "y" ]; then
    echo "❌ Configure DNS first"
    exit 1
fi

echo "3. Contracts deployed to mainnet? (y/n)"
read -r contract_check
if [ "$contract_check" != "y" ]; then
    echo "⚠️  Warning: Using testnet contracts"
fi

echo ""
echo "🔧 Installing dependencies..."

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Frontend
cd frontend
yarn install
yarn build
cd ..

echo ""
echo "🐳 Starting with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Access your application:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8080"
echo "- API Docs: http://localhost:8080/docs"

echo ""
echo "📝 Next Steps:"
echo "1. Configure Nginx reverse proxy"
echo "2. Set up SSL with Let's Encrypt"
echo "3. Configure firewall"
echo "4. Set up monitoring"

echo ""
echo "🔍 View logs:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
