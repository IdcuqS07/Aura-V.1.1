#!/bin/bash

echo "🚀 Deploying Aura Protocol Subgraph to The Graph"

# Check if graph CLI is installed
if ! command -v graph &> /dev/null; then
    echo "Installing Graph CLI..."
    npm install -g @graphprotocol/graph-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate types
echo "🔨 Generating types..."
graph codegen

# Build subgraph
echo "🏗️  Building subgraph..."
graph build

# Deploy to hosted service
echo "📤 Deploying to The Graph..."
echo "Please run: graph auth --product hosted-service <ACCESS_TOKEN>"
echo "Then run: graph deploy --product hosted-service <GITHUB_USERNAME>/aura-protocol"

echo ""
echo "✅ Build complete! Ready to deploy."
echo ""
echo "Next steps:"
echo "1. Get access token from: https://thegraph.com/hosted-service/dashboard"
echo "2. Run: graph auth --product hosted-service <YOUR_ACCESS_TOKEN>"
echo "3. Run: graph deploy --product hosted-service <YOUR_GITHUB_USERNAME>/aura-protocol"
