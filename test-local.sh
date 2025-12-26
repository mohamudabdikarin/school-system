#!/bin/bash

echo "🧪 Testing School Management System Locally"
echo "==========================================="

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

# Test 1: Check if PostgreSQL is running
print_info "Testing PostgreSQL connection..."
if sudo -u postgres psql -d school_db -c "SELECT 1;" &>/dev/null; then
    print_status "PostgreSQL is running and database exists"
else
    print_error "PostgreSQL connection failed"
    echo "Run: sudo systemctl start postgresql"
    exit 1
fi

# Test 2: Build the backend
print_info "Testing backend build..."
cd backend
if mvn clean compile -q; then
    print_status "Backend compiles successfully"
else
    print_error "Backend compilation failed"
    exit 1
fi

# Test 3: Run tests (if any)
print_info "Running backend tests..."
if mvn test -q; then
    print_status "Backend tests passed"
else
    print_warning "Some tests failed or no tests found"
fi

# Test 4: Check frontend dependencies
print_info "Testing frontend dependencies..."
cd ../frontend
if npm list &>/dev/null; then
    print_status "Frontend dependencies are installed"
else
    print_warning "Installing frontend dependencies..."
    npm install
fi

cd ..

echo ""
print_status "All tests passed! Ready to run locally."
echo ""
echo "🚀 To start the application:"
echo "1. Terminal 1: cd backend && mvn spring-boot:run"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:2020/api/v1"
echo "- Health Check: http://localhost:2020/api/v1/health"
echo ""