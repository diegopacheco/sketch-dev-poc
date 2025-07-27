#!/bin/bash

# Coaching Application Docker Stack Stop Script
# This script stops the complete coaching application stack

set -e

echo "🛑 Stopping Coaching Application Stack..."
echo "======================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    exit 1
fi

# Stop and remove containers
echo "📦 Stopping containers..."
docker-compose down --remove-orphans

# Optional: Remove volumes (uncomment to delete data)
# echo "🗄️  Removing volumes..."
# docker-compose down -v

# Optional: Remove images (uncomment to clean up images)
if [ "$1" = "--cleanup" ] || [ "$1" = "-c" ]; then
    echo "🧽 Removing images..."
    docker-compose down --rmi all --remove-orphans
fi

echo ""
echo "✅ Coaching Application Stack stopped successfully!"
echo ""
echo "📋 Status:"
docker-compose ps
echo ""
echo "📝 Useful commands:"
echo "   Start again:         ./start.sh"
echo "   View stopped containers: docker ps -a"
echo "   Remove all data:     rm -rf db/mysql_data/"
echo ""
