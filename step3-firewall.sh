#!/bin/bash
# Run this script ON THE VPS

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 3: Configure Firewall                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🔥 Configuring UFW firewall..."
echo ""

# Allow SSH first (important!)
ufw allow 22/tcp
echo "✅ SSH (22) allowed"

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ HTTP/HTTPS (80, 443) allowed"

# Allow application ports
ufw allow 3030/tcp
ufw allow 8080/tcp
echo "✅ Application ports (3030, 8080) allowed"

# Enable firewall
echo "y" | ufw enable

echo ""
echo "📊 Firewall Status:"
ufw status numbered
echo ""
echo "✅ Firewall configured!"
