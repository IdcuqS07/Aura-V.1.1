#!/bin/bash

# Build frontend
cd frontend
yarn build

# Copy build to server
scp -r build/* root@159.65.134.137:/var/www/aurapass.xyz/

# Restart nginx
ssh root@159.65.134.137 "systemctl restart nginx"

echo "Deployment complete!"