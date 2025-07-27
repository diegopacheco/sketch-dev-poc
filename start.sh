#!/bin/bash

# Coaching Application Docker Stack Startup Script
# This script starts the complete coaching application stack

set -e

echo "🚀 Starting Coaching Application Stack..."
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p db/mysql_data

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Remove old images if requested
if [ "$1" = "--rebuild" ] || [ "$1" = "-r" ]; then
    echo "🔄 Rebuilding images..."
    docker-compose build --no-cache
else
    echo "🔨 Building images..."
    docker-compose build
fi

# Start the stack
echo "🏗️  Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
echo "   - MySQL database starting..."
while ! docker-compose exec mysql mysqladmin ping -h"localhost" -u"root" -p"rootpassword" --silent; do
    echo "   - Waiting for MySQL..."
    sleep 5
done
echo "   ✅ MySQL is ready!"

echo "   - Backend API starting..."
while ! curl -s http://localhost:8080/health > /dev/null; do
    echo "   - Waiting for Backend API..."
    sleep 5
done
echo "   ✅ Backend API is ready!"

echo "   - Frontend starting..."
while ! curl -s http://localhost:3000 > /dev/null; do
    echo "   - Waiting for Frontend..."
    sleep 5
done
echo "   ✅ Frontend is ready!"

echo ""
echo "🎉 Coaching Application Stack is now running!"
echo "=========================================="
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8080"
echo "🗄️  Database:  localhost:3306"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "📋 Useful Commands:"
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   View MySQL data:     docker-compose exec mysql mysql -u root -prootpassword -e 'USE coaching_db; SHOW TABLES;'"
echo "   Backend health:      curl http://localhost:8080/health"
echo ""
echo "✨ Happy coding!"
