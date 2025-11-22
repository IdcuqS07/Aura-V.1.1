#!/bin/bash

# Install Docker and Docker Compose
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Start Docker service
systemctl start docker
systemctl enable docker

# Build and run containers
docker-compose build
docker-compose up -d

# Setup SSL
certbot --nginx -d aurapass.xyz -d www.aurapass.xyz --non-interactive --agree-tos -m admin@aurapass.xyz

echo "✅ Setup complete!"