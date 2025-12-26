#!/bin/bash

echo "🏫 School Management System - Local Setup"
echo "=========================================="

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

# Check prerequisites
echo ""
print_info "Checking prerequisites..."

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_status "Java found: $JAVA_VERSION"
else
    print_error "Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version | head -n 1 | cut -d' ' -f3)
    print_status "Maven found: $MVN_VERSION"
else
    print_error "Maven not found. Please install Maven."
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

echo ""
print_info "Setting up environment files..."

# Setup backend environment
if [ ! -f "backend/schoolsystem/.env" ]; then
    cp backend/schoolsystem/.env.example backend/schoolsystem/.env
    print_status "Created backend/.env from example"
else
    print_warning "backend/.env already exists"
fi

# Setup frontend environment
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    print_status "Created frontend/.env.local from example"
else
    print_warning "frontend/.env.local already exists"
fi

echo ""
print_info "Installing dependencies..."

# Install frontend dependencies
cd frontend
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
print_info "Setup complete! 🎉"
echo ""
echo "📋 Next steps:"
echo "=============="
echo ""
echo "1. 🗄️  Setup PostgreSQL database:"
echo "   - Install PostgreSQL if not already installed"
echo "   - Create database: createdb school_db"
echo "   - Update backend/.env with your database credentials"
echo ""
echo "2. 🚀 Start the applications:"
echo "   Backend:  cd backend/schoolsystem && mvn spring-boot:run"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "3. 🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:2020"
echo "   API Docs: http://localhost:2020/swagger-ui.html"
echo ""
print_warning "Make sure PostgreSQL is running before starting the backend!"
echo ""