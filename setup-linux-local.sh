#!/bin/bash

echo "🐧 Setting up School Management System - Linux Local Development"
echo "=============================================================="

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Don't run this script as root!"
    exit 1
fi

echo ""
print_info "Checking and installing prerequisites..."

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_status "Java found: $JAVA_VERSION"
else
    print_warning "Java not found. Installing OpenJDK 21..."
    sudo apt update
    sudo apt install -y openjdk-21-jdk
    print_status "Java 21 installed"
fi

# Check Maven
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version | head -n 1 | cut -d' ' -f3)
    print_status "Maven found: $MVN_VERSION"
else
    print_warning "Maven not found. Installing Maven..."
    sudo apt update
    sudo apt install -y maven
    print_status "Maven installed"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | cut -d' ' -f3)
    print_status "PostgreSQL found: $PG_VERSION"
else
    print_warning "PostgreSQL not found. Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL installed and started"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_warning "Node.js not found. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js 18 installed"
fi

echo ""
print_info "Setting up PostgreSQL database..."

# Setup PostgreSQL database
sudo -u postgres psql -c "CREATE DATABASE school_db;" 2>/dev/null || print_warning "Database school_db might already exist"
sudo -u postgres psql -c "CREATE USER admin WITH PASSWORD 'secret123';" 2>/dev/null || print_warning "User admin might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_db TO admin;" 2>/dev/null
sudo -u postgres psql -c "ALTER USER admin CREATEDB;" 2>/dev/null

print_status "PostgreSQL database setup complete"

echo ""
print_info "Setting up environment files..."

# Setup backend environment
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Local Development Environment Variables
DB_USERNAME=admin
DB_PASSWORD=secret123
JWT_SECRET=AmalSECRETJwtKeyCodeForSchoolManagement-System-Dev
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
    print_status "Created backend/.env"
else
    print_warning "backend/.env already exists"
fi

# Setup frontend environment
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:2020/api/v1
EOF
    print_status "Created frontend/.env.local"
else
    print_warning "frontend/.env.local already exists"
fi

echo ""
print_info "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
print_status "Setup complete! 🎉"
echo ""
echo "📋 Next steps:"
echo "=============="
echo ""
echo "1. 🚀 Start the backend:"
echo "   cd backend && mvn spring-boot:run"
echo ""
echo "2. 🌐 Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. 🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:2020"
echo "   Health:   http://localhost:2020/api/v1/health"
echo ""
echo "4. 🔑 Default login credentials:"
echo "   Admin: ADM-1 / password: 1234"
echo "   Teacher: TCH-1 / password: 1234"
echo "   Student: STD-1 / password: 1234"
echo ""