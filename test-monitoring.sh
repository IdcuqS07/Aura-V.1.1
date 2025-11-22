#!/bin/bash

echo "🔍 Testing Real-time Monitoring System"
echo "======================================"

# Test health endpoint
echo -e "\n1. Testing health endpoint..."
curl -s http://localhost:8080/api/monitor/health | jq

# Test stats endpoint
echo -e "\n2. Testing stats endpoint..."
curl -s http://localhost:8080/api/monitor/stats | jq

# Test activity endpoint
echo -e "\n3. Testing activity endpoint..."
curl -s http://localhost:8080/api/monitor/activity | jq

echo -e "\n✅ Monitoring API tests complete"
echo "📡 WebSocket endpoint: ws://localhost:8080/ws/monitor"
