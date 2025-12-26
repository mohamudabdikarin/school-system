#!/bin/bash

echo "🚀 School Management System Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "This script will guide you through deploying your School Management System"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    print_status "Git repository initialized"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "1. 🗄️  Database (Supabase PostgreSQL)"
echo "   - Create Supabase account at https://supabase.com"
echo "   - Create new project"
echo "   - Copy DATABASE_URL from Settings → Database"
echo ""

echo "2. 🖥️  Backend (Render with Docker)"
echo "   - Create Render account at https://render.com"
echo "   - Create new Web Service from GitHub repo"
echo "   - Environment: Docker"
echo "   - Dockerfile path: ./backend/schoolsystem/Dockerfile"
echo "   - Docker context: ./backend/schoolsystem"
echo "   - Add environment variables:"
echo "     * DATABASE_URL=<your-supabase-connection-string>"
echo "     * JWT_SECRET=AmalSECRETJwtKeyCodeForSchoolManagement-System-Production-2025"
echo "     * CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app"
echo "     * SPRING_PROFILES_ACTIVE=prod"
echo ""

echo "3. 🌐 Frontend (Vercel)"
echo "   - Create Vercel account at https://vercel.com"
echo "   - Import Git repository"
echo "   - Set root directory: frontend"
echo "   - Add environment variable:"
echo "     * VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1"
echo ""

echo "4. 🔧 Final Configuration"
echo "   - Update CORS_ALLOWED_ORIGINS with actual Vercel domain"
echo "   - Update .env.production with actual Render backend URL"
echo "   - Test the deployment"
echo ""

print_status "All configuration files have been created!"
print_warning "Please follow the manual steps above to complete the deployment."

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""

# Check if user wants to push to git
read -p "Do you want to commit and push these changes to git? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Add production deployment configuration for Render + Supabase"
    
    # Check if remote exists
    if git remote get-url origin >/dev/null 2>&1; then
        git push origin main 2>/dev/null || git push origin master 2>/dev/null || print_error "Failed to push. Please check your git remote configuration."
        print_status "Changes pushed to repository"
    else
        print_warning "No git remote found. Please add your repository URL:"
        echo "git remote add origin <your-repo-url>"
        echo "git push -u origin main"
    fi
fi

echo ""
print_status "Deployment preparation complete! 🎉"