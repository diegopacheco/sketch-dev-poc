#!/bin/bash

# Build All Script for Coaching Application
# This script builds the backend, frontend, and Docker images

set -e

echo "🔨 Building Complete Coaching Application Stack..."
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo ""
echo "💻 1. Building Backend (Go)..."
echo "================================"
cd backend
if [ -f "build.sh" ]; then
    ./build.sh
else
    echo "Building Go application..."
    go mod tidy
    go build -o coaching-backend .
fi
cd ..
echo "✅ Backend build completed!"

echo ""
echo "🌐 2. Building Frontend (React)..."
echo "=================================="
cd frontend
if command -v bun > /dev/null 2>&1; then
    echo "Using Bun for frontend build..."
    bun install
    bun run build
else
    echo "Using npm for frontend build..."
    npm install
    npm run build
fi
cd ..
echo "✅ Frontend build completed!"

echo ""
echo "🐳 3. Building Docker Images..."
echo "=============================="

echo "Building backend Docker image..."
docker build -t coaching-backend:latest ./backend/
echo "✅ Backend Docker image built!"

echo "Building frontend Docker image..."
docker build -t coaching-frontend:latest ./frontend/
echo "✅ Frontend Docker image built!"

echo "Building all services with docker-compose..."
docker-compose build --no-cache
echo "✅ Docker Compose build completed!"

echo ""
echo "📋 4. Build Summary"
echo "=================="
echo "✅ Backend binary: ./backend/coaching-backend"
echo "✅ Frontend build: ./frontend/build/"
echo "✅ Docker images:"
docker images | grep coaching

echo ""
echo "🎉 All builds completed successfully!"
echo "======================================"
echo ""
echo "🚀 Next steps:"
echo "   Start the stack:    ./start.sh"
echo "   View images:        docker images | grep coaching"
echo "   Test backend:       ./backend/coaching-backend --help"
echo "   Test frontend:      ls -la ./frontend/build/"
echo ""
echo "📋 Useful commands:"
echo "   Run tests:          cd backend && go test ./..."
echo "   Run frontend tests: cd frontend && npm test"
echo "   Clean builds:       docker system prune -f"
echo ""
