#!/bin/bash
# Script untuk mencari lokasi project di VPS

echo "🔍 Mencari project Aura di VPS..."
echo ""

read -p "VPS IP (contoh: 159.65.134.137): " VPS_HOST
read -p "VPS User (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}

echo ""
echo "Mencari folder project..."

ssh $VPS_USER@$VPS_HOST << 'EOF'
echo "📁 Struktur folder di home:"
ls -la ~/ | grep -i aura

echo ""
echo "📁 Mencari di /root:"
find /root -maxdepth 2 -type d -name "*aura*" 2>/dev/null

echo ""
echo "📁 Mencari di /opt:"
find /opt -maxdepth 2 -type d -name "*aura*" 2>/dev/null

echo ""
echo "📁 Mencari di /var/www:"
find /var/www -maxdepth 2 -type d -name "*aura*" 2>/dev/null

echo ""
echo "🐳 Docker containers yang running:"
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "📂 Current directory:"
pwd
ls -la
EOF
