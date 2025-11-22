#!/bin/bash

echo "🚀 Starting Aura Protocol Dashboard..."

# Start backend in background
echo "📡 Starting Backend..."
cd "$(dirname "$0")/backend"
source venv/bin/activate
python server.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd "$(dirname "$0")/frontend"
yarn start

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
