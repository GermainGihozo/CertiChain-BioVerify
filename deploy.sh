#!/bin/bash

# CertiChain-BioVerify Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 CertiChain-BioVerify Deployment Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${GREEN}✓${NC} Environment variables loaded"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker and Docker Compose are installed"

# Pull latest code
echo ""
echo "📥 Pulling latest code from Git..."
git pull origin main
echo -e "${GREEN}✓${NC} Code updated"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓${NC} Containers stopped"

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✓${NC} Images built"

# Start containers
echo ""
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓${NC} Containers started"

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

# Check backend health
echo ""
echo "🏥 Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:5000/api/health &> /dev/null; then
        echo -e "${GREEN}✓${NC} Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        echo "Check logs with: docker-compose -f docker-compose.prod.yml logs backend"
        exit 1
    fi
    sleep 2
done

# Check frontend
echo ""
echo "🌐 Checking frontend..."
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend is accessible"
else
    echo -e "${YELLOW}⚠${NC} Frontend might not be ready yet"
fi

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment completed successfully!"
echo "==========================================${NC}"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📊 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:         docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "   Shell access: docker-compose -f docker-compose.prod.yml exec backend sh"
echo ""
echo "🔐 Next steps:"
echo "   1. Create admin user: docker-compose -f docker-compose.prod.yml exec backend node scripts/create-admin.js"
echo "   2. Configure your domain DNS to point to this server"
echo "   3. Setup SSL certificate with Let's Encrypt"
echo "   4. Configure Nginx reverse proxy"
echo ""
