#!/bin/bash
# Quick fix for aurapass.xyz 403 error

ssh user@aurapass.xyz << 'EOF'
sudo chown -R www-data:www-data /var/www/aura-protocol
sudo chmod -R 755 /var/www/aura-protocol
sudo systemctl restart nginx
sudo systemctl status nginx
EOF