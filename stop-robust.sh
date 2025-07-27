#!/bin/bash

# Robust Stop Script for Coaching Application
# Handles both Docker Compose and Development Mode cleanup

set -e

echo "🛑 Stopping Coaching Application Stack"
echo "====================================="

# Function to stop Docker Compose stack
stop_compose() {
    echo "Stopping Docker Compose stack..."
    if docker-compose down --remove-orphans 2>/dev/null; then
        echo "✅ Docker Compose stack stopped"
        return 0
    else
        echo "❌ No Docker Compose stack found or failed to stop"
        return 1
    fi
}

# Function to stop development mode services
stop_development() {
    echo "Stopping development mode services..."
    
    local stopped_something=false
    
    # Stop backend processes
    if [ -f "logs/backend.pid" ]; then
        local backend_pid=$(cat logs/backend.pid)
        if kill $backend_pid 2>/dev/null; then
            echo "✅ Backend process stopped (PID: $backend_pid)"
            stopped_something=true
        fi
        rm -f logs/backend.pid
    fi
    
    # Stop frontend processes  
    if [ -f "logs/frontend.pid" ]; then
        local frontend_pid=$(cat logs/frontend.pid)
        if kill $frontend_pid 2>/dev/null; then
            echo "✅ Frontend process stopped (PID: $frontend_pid)"
            stopped_something=true
        fi
        rm -f logs/frontend.pid
    fi
    
    # Stop MySQL container
    if [ -f "logs/mysql.container" ]; then
        local mysql_container=$(cat logs/mysql.container)
        if docker stop $mysql_container 2>/dev/null; then
            echo "✅ MySQL container stopped ($mysql_container)"
            stopped_something=true
        fi
        if docker rm $mysql_container 2>/dev/null; then
            echo "✅ MySQL container removed ($mysql_container)"
        fi
        rm -f logs/mysql.container
    fi
    
    # Fallback: kill processes by name
    if pkill -f "go run main.go" 2>/dev/null; then
        echo "✅ Stopped remaining Go processes"
        stopped_something=true
    fi
    
    if pkill -f "npm start" 2>/dev/null; then
        echo "✅ Stopped remaining npm processes"
        stopped_something=true
    fi
    
    if pkill -f "react-scripts" 2>/dev/null; then
        echo "✅ Stopped remaining React processes"
        stopped_something=true
    fi
    
    # Stop any coaching-related containers
    local coaching_containers=$(docker ps -q --filter "name=coaching" 2>/dev/null || true)
    if [ -n "$coaching_containers" ]; then
        echo "Stopping coaching containers: $coaching_containers"
        docker stop $coaching_containers 2>/dev/null || true
        docker rm $coaching_containers 2>/dev/null || true
        stopped_something=true
    fi
    
    if [ "$stopped_something" = true ]; then
        echo "✅ Development mode services stopped"
        return 0
    else
        echo "❌ No development mode services found"
        return 1
    fi
}

# Function to clean up ports
cleanup_ports() {
    echo "Checking for processes on application ports..."
    
    # Check port 3000 (Frontend)
    local frontend_process=$(lsof -ti:3000 2>/dev/null || true)
    if [ -n "$frontend_process" ]; then
        echo "Killing process on port 3000: $frontend_process"
        kill -9 $frontend_process 2>/dev/null || true
    fi
    
    # Check port 8080 (Backend)
    local backend_process=$(lsof -ti:8080 2>/dev/null || true)
    if [ -n "$backend_process" ]; then
        echo "Killing process on port 8080: $backend_process"
        kill -9 $backend_process 2>/dev/null || true
    fi
    
    # Check port 3306 (MySQL) - only if not in container
    local mysql_process=$(lsof -ti:3306 2>/dev/null || true)
    if [ -n "$mysql_process" ]; then
        # Only kill if it's not a Docker process
        if ! ps -p $mysql_process -o comm= | grep -q docker 2>/dev/null; then
            echo "Warning: Process on port 3306 (MySQL) - not killing Docker process"
        fi
    fi
}

# Function to show final status
show_final_status() {
    echo "📋 Final Status Check"
    echo "=================="
    
    # Check if services are still running
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "⚠️  Frontend still responding on port 3000"
    else
        echo "✅ Frontend stopped (port 3000 free)"
    fi
    
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo "⚠️  Backend still responding on port 8080"
    else
        echo "✅ Backend stopped (port 8080 free)"
    fi
    
    # Check for Docker containers
    local running_containers=$(docker ps --filter "name=coaching" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null | tail -n +2 || true)
    if [ -n "$running_containers" ]; then
        echo "⚠️  Some coaching containers still running:"
        echo "$running_containers"
    else
        echo "✅ No coaching containers running"
    fi
    
    echo ""
    echo "🎆 Coaching Application cleanup complete!"
    echo ""
    echo "To start again:"
    echo "  ./start.sh (original method)"
    echo "  ./start-robust.sh (with fallbacks)"
}

# Main execution
main() {
    echo "Attempting multiple stop methods..."
    echo ""
    
    local compose_stopped=false
    local dev_stopped=false
    
    # Try Docker Compose first
    if stop_compose; then
        compose_stopped=true
    fi
    
    # Try development mode cleanup
    if stop_development; then
        dev_stopped=true
    fi
    
    # Clean up any remaining processes on ports
    cleanup_ports
    
    # Show results
    if [ "$compose_stopped" = true ] || [ "$dev_stopped" = true ]; then
        echo "✅ Successfully stopped services"
    else
        echo "⚠️  No running services found to stop"
    fi
    
    show_final_status
}

# Run main function
main "$@"
