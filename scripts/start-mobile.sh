#!/bin/bash

# Get local IP address on MacOS (usually en0 for WiFi)
IP=$(ipconfig getifaddr en0)

if [ -z "$IP" ]; then
    echo "Could not detect IP on en0. Trying en1..."
    IP=$(ipconfig getifaddr en1)
fi

if [ -z "$IP" ]; then
    echo "Could not detect local IP address. Please ensure you are connected to a network."
    exit 1
fi

echo "Detailed Status: Starting Dictator AI..."
echo "----------------------------------------"

# build and run in background
docker compose up --build -d

echo ""
echo "----------------------------------------"
echo "✅ Dictator AI is running!"
echo ""
echo "📱 On your Mobile/Tablet, confirm you are on the SAME WiFi network."
echo "🔗 Open this URL in your browser:"
echo ""
echo "   http://$IP:5001"
echo ""
echo "----------------------------------------"
