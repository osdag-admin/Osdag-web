#!/bin/bash

echo "🚀 Starting Osdag Backend and Monitoring Stack locally..."
docker-compose down
docker-compose up -d

echo "⏳ Waiting for services to initialize (15s)..."
sleep 15

echo "========================================================="
echo "✅ Stack is UP!"
echo ""
echo "📊 1. Open GRAFANA to see your graphs and CPU temps:"
echo "      👉 http://localhost:3001"
echo "      (Login: admin / admin, then open 'Osdag Load Test')"
echo ""
echo "🦗 2. Open LOCUST to start the Plate-Girder test:"
echo "      👉 http://localhost:8089"
echo "      (Enter the number of users, e.g., 1 or 5, and click Start)"
echo "========================================================="

echo "Starting Locust Web UI now... (Press Ctrl+C to stop everything when you're done)"
cd load_tests
source venv/bin/activate
locust -f locustfile_plategirder_ws.py --host http://127.0.0.1:8000
