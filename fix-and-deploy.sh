#!/bin/bash

echo "🔧 Fixing import issues and deploying to server..."

# Fix remaining import issues
echo "Fixing import paths..."

# Fix ThresholdProof.jsx if it exists
if [ -f "frontend/src/components/ThresholdProof.jsx" ]; then
    sed -i '' 's|@/components/ui/|./ui/|g' frontend/src/components/ThresholdProof.jsx
fi

# Fix any other components with @/components/ui imports
find frontend/src/components -name "*.jsx" -o -name "*.js" | xargs grep -l "@/components/ui" | while read file; do
    echo "Fixing imports in $file"
    sed -i '' 's|@/components/ui/|./ui/|g' "$file"
done

# Build frontend
echo "Building frontend..."
cd frontend
yarn build
cd ..

# Create deployment package
echo "Creating deployment package..."
tar -czf aura-fixed-deployment.tar.gz \
    backend/ \
    frontend/build/ \
    contracts/ \
    package.json \
    docker-compose.yml \
    nginx.conf

echo "✅ Deployment package created: aura-fixed-deployment.tar.gz"
echo "📦 Ready to upload to server"

# Show next steps
echo ""
echo "Next steps:"
echo "1. Upload aura-fixed-deployment.tar.gz to your server"
echo "2. Extract and run deployment script on server"
echo "3. The fixed application will be available at https://www.aurapass.xyz"