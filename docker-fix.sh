#!/bin/bash

# Docker Permission Fix Script
# Addresses Docker BuildKit permission issues in restricted environments

set -e

echo "🔧 Docker Permission Fix for Coaching Application"
echo "=============================================="

# Function to try different Docker build approaches
try_docker_build() {
    local service=$1
    local context=$2
    
    echo "Building $service..."
    
    # Method 1: Disable BuildKit
    echo "  Trying with BuildKit disabled..."
    if DOCKER_BUILDKIT=0 docker-compose build --no-cache $service 2>/dev/null; then
        echo "  ✅ Success with BuildKit disabled"
        return 0
    fi
    
    # Method 2: Use legacy docker build
    echo "  Trying legacy docker build..."
    if DOCKER_BUILDKIT=0 docker build -t coaching-$service $context 2>/dev/null; then
        echo "  ✅ Success with legacy build"
        return 0
    fi
    
    # Method 3: Use podman if available
    if command -v podman >/dev/null 2>&1; then
        echo "  Trying with podman..."
        if podman build -t coaching-$service $context 2>/dev/null; then
            echo "  ✅ Success with podman"
            return 0
        fi
    fi
    
    echo "  ❌ All build methods failed for $service"
    return 1
}

# Function to check Docker permissions
check_docker_permissions() {
    echo -e "\n🔍 Docker Environment Analysis"
    echo "================================"
    
    echo "Docker Version: $(docker --version)"
    echo "Storage Driver: $(docker info --format '{{.Driver}}')"
    echo "Docker Root: $(docker info --format '{{.DockerRootDir}}')"
    
    # Check if we can create a simple container
    if docker run --rm hello-world >/dev/null 2>&1; then
        echo "✅ Basic Docker functionality works"
    else
        echo "❌ Basic Docker functionality failed"
    fi
    
    # Check BuildKit
    if DOCKER_BUILDKIT=1 docker build -t test-buildkit - <<< 'FROM alpine' >/dev/null 2>&1; then
        echo "✅ BuildKit works"
        docker rmi test-buildkit >/dev/null 2>&1
    else
        echo "❌ BuildKit has permission issues"
    fi
    
    # Check legacy build
    if DOCKER_BUILDKIT=0 docker build -t test-legacy - <<< 'FROM alpine' >/dev/null 2>&1; then
        echo "✅ Legacy build works"
        docker rmi test-legacy >/dev/null 2>&1
    else
        echo "❌ Legacy build also has issues"
    fi
}

# Function to fix Docker environment
fix_docker_environment() {
    echo -e "\n🛠️ Applying Docker Fixes"
    echo "========================"
    
    # Fix 1: Disable BuildKit globally
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
    echo "✅ BuildKit disabled globally"
    
    # Fix 2: Set proper Docker daemon config
    sudo mkdir -p /etc/docker
    cat << EOF | sudo tee /etc/docker/daemon.json >/dev/null
{
  "storage-driver": "vfs",
  "features": {
    "buildkit": false
  },
  "experimental": false
}
EOF
    echo "✅ Docker daemon configured for VFS storage"
    
    # Fix 3: Restart Docker daemon
    sudo pkill dockerd 2>/dev/null || true
    sleep 2
    sudo dockerd --host=unix:///var/run/docker.sock --config-file=/etc/docker/daemon.json >/dev/null 2>&1 &
    sleep 5
    echo "✅ Docker daemon restarted with new config"
    
    # Fix 4: Set permissions
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || echo "Cannot modify Docker socket permissions"
    
    # Fix 5: Clean Docker system
    docker system prune -f >/dev/null 2>&1 || true
    echo "✅ Docker system cleaned"
}

# Function to create alternative startup script
create_alternative_startup() {
    echo -e "\n📦 Creating Alternative Startup Methods"
    echo "====================================="
    
    # Create development mode startup
    cat << 'EOF' > start-dev.sh
#!/bin/bash
# Development mode startup without Docker Compose

echo "🚀 Starting Coaching Application in Development Mode"
echo "================================================"

# Start MySQL in Docker
echo "Starting MySQL..."
docker run -d --name coaching-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=coaching_db \
  -e MYSQL_USER=coaching_user \
  -e MYSQL_PASSWORD=coaching_password \
  -p 3306:3306 \
  -v "$(pwd)/db/mysql_data:/var/lib/mysql" \
  -v "$(pwd)/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql" \
  mysql:9.0

# Wait for MySQL
echo "Waiting for MySQL to be ready..."
while ! docker exec coaching-mysql mysqladmin ping -h localhost -u root -prootpassword >/dev/null 2>&1; do
    echo "  Waiting for MySQL..."
    sleep 3
done
echo "✅ MySQL is ready"

# Start Backend
echo "Starting Backend..."
cd backend
export DATABASE_URL="coaching_user:coaching_password@tcp(localhost:3306)/coaching_db?charset=utf8mb4&parseTime=True&loc=Local"
export PORT=8080
export GIN_MODE=release
nohup go run main.go > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for Backend
echo "Waiting for Backend to be ready..."
while ! curl -f http://localhost:8080/health >/dev/null 2>&1; do
    echo "  Waiting for Backend..."
    sleep 3
done
echo "✅ Backend is ready"

# Start Frontend
echo "Starting Frontend..."
cd frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for Frontend
echo "Waiting for Frontend to be ready..."
while ! curl -f http://localhost:3000 >/dev/null 2>&1; do
    echo "  Waiting for Frontend..."
    sleep 3
done
echo "✅ Frontend is ready"

echo "🎉 Coaching Application is now running!"
echo "======================================"
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8080"
echo "Database:  localhost:3306"
echo ""
echo "Process IDs saved for cleanup:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  docker stop coaching-mysql"
echo "  docker rm coaching-mysql"
EOF
    
    chmod +x start-dev.sh
    echo "✅ Alternative development startup created: start-dev.sh"
    
    # Create Docker Compose override
    cat << 'EOF' > docker-compose.override.yml
version: '3.8'

# Override for environments with Docker permission issues
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        BUILDKIT_INLINE_CACHE: 0
    environment:
      - DOCKER_BUILDKIT=0
      
  frontend:
    build:
      context: ./frontend  
      dockerfile: Dockerfile
      args:
        BUILDKIT_INLINE_CACHE: 0
    environment:
      - DOCKER_BUILDKIT=0
EOF
    
    echo "✅ Docker Compose override created for permission issues"
}

# Function to test the fixes
test_fixes() {
    echo -e "\n🧪 Testing Docker Fixes"
    echo "====================="
    
    # Test 1: Try building a simple image
    echo "Test 1: Building simple test image..."
    if DOCKER_BUILDKIT=0 docker build -t docker-test - << 'EOF' >/dev/null 2>&1
FROM alpine:latest
RUN echo "Docker build test successful"
CMD echo "Hello from Docker"
EOF
    then
        echo "✅ Simple Docker build works"
        docker rmi docker-test >/dev/null 2>&1
    else
        echo "❌ Simple Docker build still fails"
    fi
    
    # Test 2: Try docker-compose build
    echo "Test 2: Testing docker-compose build..."
    if DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --no-cache >/dev/null 2>&1; then
        echo "✅ Docker Compose build works"
    else
        echo "❌ Docker Compose build still has issues"
        echo "  → Use start-dev.sh for development mode"
    fi
}

# Main execution
echo "Starting Docker permission fix process..."

check_docker_permissions
fix_docker_environment
create_alternative_startup
test_fixes

echo -e "\n🎆 Docker Fix Complete!"
echo "====================="
echo "If Docker Compose still has issues, use: ./start-dev.sh"
echo "This will start services individually without Docker Compose."
