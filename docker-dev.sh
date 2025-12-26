#!/bin/bash

echo "🐳 School Management System - Docker Development"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Use docker-compose or docker compose based on availability
DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi

echo ""
print_info "Available commands:"
echo "1. start  - Start all services"
echo "2. stop   - Stop all services"
echo "3. logs   - View logs"
echo "4. build  - Rebuild and start"
echo "5. clean  - Stop and remove all containers/volumes"
echo ""

# Get command from argument or prompt user
if [ $# -eq 0 ]; then
    read -p "Enter command (start/stop/logs/build/clean): " cmd
else
    cmd=$1
fi

case $cmd in
    "start")
        print_info "Starting all services..."
        $DOCKER_COMPOSE_CMD up -d
        if [ $? -eq 0 ]; then
            print_status "Services started successfully!"
            echo ""
            echo "🌐 Access URLs:"
            echo "   Frontend:  http://localhost:5173"
            echo "   Backend:   http://localhost:2020"
            echo "   API Docs:  http://localhost:2020/swagger-ui.html"
            echo "   Database:  localhost:5432"
            echo ""
            print_info "Use '$0 logs' to view logs"
        else
            print_error "Failed to start services"
        fi
        ;;
    "stop")
        print_info "Stopping all services..."
        $DOCKER_COMPOSE_CMD down
        print_status "Services stopped"
        ;;
    "logs")
        print_info "Showing logs (Ctrl+C to exit)..."
        $DOCKER_COMPOSE_CMD logs -f
        ;;
    "build")
        print_info "Rebuilding and starting services..."
        $DOCKER_COMPOSE_CMD down
        $DOCKER_COMPOSE_CMD up --build -d
        if [ $? -eq 0 ]; then
            print_status "Services rebuilt and started!"
        else
            print_error "Failed to rebuild services"
        fi
        ;;
    "clean")
        print_warning "This will remove all containers, networks, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Cleaning up..."
            $DOCKER_COMPOSE_CMD down -v --remove-orphans
            docker system prune -f
            print_status "Cleanup complete"
        else
            print_info "Cleanup cancelled"
        fi
        ;;
    *)
        print_error "Invalid command. Use: start, stop, logs, build, or clean"
        exit 1
        ;;
esac