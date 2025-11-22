#!/bin/bash
cd "$(dirname "$0")/frontend"

# Install recharts if not installed
if ! grep -q "recharts" package.json; then
    echo "Installing recharts..."
    yarn add recharts
fi

echo "Starting frontend..."
yarn start
