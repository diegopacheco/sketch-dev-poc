#!/bin/bash

# Validation script for Docker setup

echo "🔍 Validating Docker Setup..."
echo "============================"

# Check required files
echo "📋 Checking required files..."
files=(
    "docker-compose.yml"
    "frontend/Dockerfile"
    "backend/Dockerfile"
    "db/schema.sql"
    "start.sh"
    "stop.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

# Check if directories exist
echo ""
echo "📁 Checking directories..."
dirs=(
    "frontend/src"
    "backend/handlers"
    "db"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir/"
    else
        echo "   ❌ $dir/ (missing)"
    fi
done

# Validate Docker Compose configuration
echo ""
echo "🐳 Validating Docker Compose..."
if docker-compose config --quiet; then
    echo "   ✅ docker-compose.yml is valid"
else
    echo "   ❌ docker-compose.yml has errors"
fi

# Check if Docker is available
echo ""
echo "🐳 Checking Docker availability..."
if command -v docker > /dev/null 2>&1; then
    echo "   ✅ Docker CLI is available"
    if docker info > /dev/null 2>&1; then
        echo "   ✅ Docker daemon is running"
    else
        echo "   ⚠️  Docker daemon is not running"
    fi
else
    echo "   ❌ Docker CLI is not installed"
fi

if command -v docker-compose > /dev/null 2>&1; then
    echo "   ✅ Docker Compose is available"
else
    echo "   ❌ Docker Compose is not installed"
fi

# Check ports
echo ""
echo "🔌 Checking port availability..."
ports=(3000 8080 3306)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "   ⚠️  Port $port is in use"
    else
        echo "   ✅ Port $port is available"
    fi
done

echo ""
echo "✨ Validation complete!"
echo ""
echo "🚀 To start the application:"
echo "   ./start.sh"
echo ""
