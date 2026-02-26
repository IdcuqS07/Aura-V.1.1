#!/bin/bash

# SSH ke server dan build frontend
ssh root@159.65.134.137 << 'EOF'
cd /root/Aura-V.1.1/frontend
yarn install
yarn build
cp -r build/* /var/www/aurapass.xyz/
systemctl restart nginx
echo "Build complete!"
EOF