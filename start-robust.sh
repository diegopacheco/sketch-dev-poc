#!/bin/bash

# Robust Coaching Application Startup Script
# Handles Docker permission issues and provides fallback methods

set -e

echo "🚀 Starting Coaching Application Stack (Robust Mode)"
echo "======================================================"

# Function to check Docker availability
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker is not installed"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker daemon is not running"
        return 1
    fi
    
    echo "✅ Docker is available"
    return 0
}

# Function to test Docker build capabilities
test_docker_build() {
    echo "Testing Docker build capabilities..."
    
    # Test BuildKit
    if DOCKER_BUILDKIT=1 docker build -t test-buildkit - <<< 'FROM alpine' >/dev/null 2>&1; then
        echo "✅ BuildKit works"
        docker rmi test-buildkit >/dev/null 2>&1
        return 0
    fi
    
    # Test legacy build
    if DOCKER_BUILDKIT=0 docker build -t test-legacy - <<< 'FROM alpine' >/dev/null 2>&1; then
        echo "✅ Legacy build works"
        docker rmi test-legacy >/dev/null 2>&1
        export DOCKER_BUILDKIT=0
        export COMPOSE_DOCKER_CLI_BUILD=0
        return 0
    fi
    
    echo "❌ Docker build has permission issues"
    return 1
}

# Function to start with Docker Compose
start_with_compose() {
    echo "📦 Attempting Docker Compose startup..."
    
    # Create necessary directories
    mkdir -p db/mysql_data
    
    # Stop existing containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Set environment variables for legacy build
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
    
    # Try building with different methods
    echo "Building images..."
    if docker-compose build --no-cache; then
        echo "✅ Images built successfully"
    else
        echo "❌ Docker Compose build failed"
        return 1
    fi
    
    # Start services
    echo "Starting services..."
    if docker-compose up -d; then
        echo "✅ Services started with Docker Compose"
        
        # Wait for services
        wait_for_services_compose
        return 0
    else
        echo "❌ Docker Compose startup failed"
        return 1
    fi
}

# Function to wait for services in compose mode
wait_for_services_compose() {
    echo "Waiting for services to be ready..."
    
    # Wait for MySQL
    echo "  Waiting for MySQL..."
    local mysql_ready=false
    for i in {1..30}; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword >/dev/null 2>&1; then
            mysql_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$mysql_ready" = true ]; then
        echo "  ✅ MySQL is ready"
    else
        echo "  ❌ MySQL failed to start"
        return 1
    fi
    
    # Wait for Backend
    echo "  Waiting for Backend..."
    local backend_ready=false
    for i in {1..30}; do
        if curl -f http://localhost:8080/health >/dev/null 2>&1; then
            backend_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$backend_ready" = true ]; then
        echo "  ✅ Backend is ready"
    else
        echo "  ❌ Backend failed to start"
        return 1
    fi
    
    # Wait for Frontend
    echo "  Waiting for Frontend..."
    local frontend_ready=false
    for i in {1..30}; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            frontend_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$frontend_ready" = true ]; then
        echo "  ✅ Frontend is ready"
    else
        echo "  ❌ Frontend failed to start"
        return 1
    fi
}

# Function to start in development mode
start_development_mode() {
    echo "🛠️ Starting in Development Mode (without Docker Compose)..."
    
    # Start MySQL container directly
    echo "Starting MySQL container..."
    docker run -d --name coaching-mysql-dev \
        -e MYSQL_ROOT_PASSWORD=rootpassword \
        -e MYSQL_DATABASE=coaching_db \
        -e MYSQL_USER=coaching_user \
        -e MYSQL_PASSWORD=coaching_password \
        -p 3306:3306 \
        --restart unless-stopped \
        mysql:9.0 2>/dev/null || {
        echo "MySQL container might already exist, trying to start it..."
        docker start coaching-mysql-dev 2>/dev/null || {
            echo "Removing existing container and retrying..."
            docker rm -f coaching-mysql-dev 2>/dev/null || true
            docker run -d --name coaching-mysql-dev \
                -e MYSQL_ROOT_PASSWORD=rootpassword \
                -e MYSQL_DATABASE=coaching_db \
                -e MYSQL_USER=coaching_user \
                -e MYSQL_PASSWORD=coaching_password \
                -p 3306:3306 \
                --restart unless-stopped \
                mysql:9.0
        }
    }
    
    # Wait for MySQL
    echo "Waiting for MySQL to be ready..."
    for i in {1..60}; do
        if docker exec coaching-mysql-dev mysqladmin ping -h localhost -u root -prootpassword >/dev/null 2>&1; then
            echo "✅ MySQL is ready"
            break
        fi
        echo "  MySQL not ready yet (attempt $i/60)..."
        sleep 3
    done
    
    # Initialize database if needed
    if [ -f "db/schema.sql" ]; then
        echo "Initializing database schema..."
        docker exec -i coaching-mysql-dev mysql -u root -prootpassword coaching_db < db/schema.sql 2>/dev/null || true
    fi
    
    # Start Backend
    echo "Starting Backend in development mode..."
    cd backend
    export DATABASE_URL="coaching_user:coaching_password@tcp(localhost:3306)/coaching_db?charset=utf8mb4&parseTime=True&loc=Local"
    export PORT=8080
    export GIN_MODE=release
    
    # Kill any existing backend processes
    pkill -f "go run main.go" 2>/dev/null || true
    pkill -f "coaching-backend" 2>/dev/null || true
    
    # Start backend
    nohup go run main.go > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for Backend
    echo "Waiting for Backend to be ready..."
    for i in {1..30}; do
        if curl -f http://localhost:8080/health >/dev/null 2>&1; then
            echo "✅ Backend is ready"
            break
        fi
        echo "  Backend not ready yet (attempt $i/30)..."
        sleep 3
    done
    
    # Start Frontend
    echo "Starting Frontend in development mode..."
    cd frontend
    
    # Kill any existing frontend processes
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install >/dev/null 2>&1
    fi
    
    # Start frontend
    nohup npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for Frontend
    echo "Waiting for Frontend to be ready..."
    for i in {1..60}; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            echo "✅ Frontend is ready"
            break
        fi
        echo "  Frontend not ready yet (attempt $i/60)..."
        sleep 5
    done
    
    # Save PIDs for cleanup
    mkdir -p logs
    echo $BACKEND_PID > logs/backend.pid
    echo $FRONTEND_PID > logs/frontend.pid
    echo "coaching-mysql-dev" > logs/mysql.container
    
    return 0
}

# Function to display service status
show_status() {
    echo "🎆 Coaching Application is now running!"
    echo "======================================"
    echo "Frontend:  http://localhost:3000"
    echo "Backend:   http://localhost:8080"
    echo "Database:  localhost:3306"
    echo ""
    echo "Service Status:"
    
    # Check Frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "  ✅ Frontend: Running"
    else
        echo "  ❌ Frontend: Not responding"
    fi
    
    # Check Backend
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo "  ✅ Backend: Running"
    else
        echo "  ❌ Backend: Not responding"
    fi
    
    # Check Database
    if docker exec coaching-mysql-dev mysqladmin ping -h localhost -u root -prootpassword >/dev/null 2>&1; then
        echo "  ✅ Database: Running"
    elif docker-compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword >/dev/null 2>&1; then
        echo "  ✅ Database: Running (Compose)"
    else
        echo "  ❌ Database: Not responding"
    fi
    
    echo ""
    echo "Logs:"
    echo "  Backend:  logs/backend.log (or docker-compose logs backend)"
    echo "  Frontend: logs/frontend.log (or docker-compose logs frontend)"
    echo "  MySQL:    docker logs coaching-mysql-dev (or docker-compose logs mysql)"
    echo ""
    echo "To stop services: ./stop-robust.sh"
}

# Main execution flow
main() {
    # Create logs directory
    mkdir -p logs
    
    # Check Docker availability
    if ! check_docker; then
        echo "❌ Cannot proceed without Docker"
        exit 1
    fi
    
    # Test Docker build capabilities
    if test_docker_build; then
        echo "Attempting Docker Compose method..."
        if start_with_compose; then
            show_status
            return 0
        else
            echo "Docker Compose failed, trying development mode..."
        fi
    else
        echo "Docker build has permission issues, using development mode..."
    fi
    
    # Fallback to development mode
    if start_development_mode; then
        show_status
        return 0
    else
        echo "❌ All startup methods failed"
        echo "Please check logs in the logs/ directory"
        return 1
    fi
}

# Run main function
main "$@"
