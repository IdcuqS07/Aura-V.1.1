#!/bin/bash
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install
fi

# Start frontend on port 3030
echo "Starting frontend on port 3030..."
PORT=3030 yarn start
