#!/bin/bash

echo "🔧 Fixing JAVA_HOME Environment Variable"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Find Java installation
JAVA_PATH=$(readlink -f /usr/bin/java)
JAVA_HOME_PATH=$(dirname $(dirname $JAVA_PATH))

print_info "Found Java at: $JAVA_PATH"
print_info "Setting JAVA_HOME to: $JAVA_HOME_PATH"

# Set JAVA_HOME for current session
export JAVA_HOME=$JAVA_HOME_PATH
export PATH=$JAVA_HOME/bin:$PATH

# Add to .bashrc for permanent setting
if ! grep -q "export JAVA_HOME=" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Java Environment Variables" >> ~/.bashrc
    echo "export JAVA_HOME=$JAVA_HOME_PATH" >> ~/.bashrc
    echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
    print_status "Added JAVA_HOME to ~/.bashrc"
else
    print_info "JAVA_HOME already exists in ~/.bashrc"
fi

# Verify Java setup
echo ""
print_info "Verifying Java setup..."
echo "JAVA_HOME: $JAVA_HOME"
echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "Javac version: $(javac -version 2>&1)"

# Test Maven
if command -v mvn &> /dev/null; then
    echo "Maven version: $(mvn -version | head -n 1)"
    print_status "Java and Maven are properly configured!"
else
    print_error "Maven not found. Install with: sudo apt install maven"
fi

echo ""
print_info "To apply changes to current terminal, run:"
echo "source ~/.bashrc"
echo ""
print_info "Or close and reopen your terminal"