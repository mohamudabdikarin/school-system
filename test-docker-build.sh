#!/bin/bash

echo "🐳 Testing Docker Build for School Management Backend"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
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

echo ""
print_warning "This will build the Docker image for the backend..."
echo ""

# Build the Docker image
echo "Building Docker image..."
cd backend/schoolsystem

if docker build -t school-management-backend .; then
    print_status "Docker image built successfully!"
    echo ""
    echo "🚀 You can now test the container with:"
    echo "docker run -p 8080:8080 \\"
    echo "  -e SPRING_PROFILES_ACTIVE=prod \\"
    echo "  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/school_db \\"
    echo "  -e JWT_SECRET=test-secret \\"
    echo "  school-management-backend"
    echo ""
    echo "📋 Image details:"
    docker images school-management-backend
else
    print_error "Docker build failed!"
    exit 1
fi

cd ../..

echo ""
print_status "Build test complete!"