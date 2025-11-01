#!/bin/bash

# Quick start script for Jewelry AR Try-On
# This will check everything and help you start testing

echo "🚀 Jewelry AR Try-On - Quick Start"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: Run this script from the project root directory"
    echo "   cd ~/Desktop/jewelry-ar-tryon && bash RUN_NOW.sh"
    exit 1
fi

echo "✅ Project directory found"
echo ""

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env not found"
    echo "   Please create it from backend/.env.example"
    exit 1
fi

echo "✅ Backend .env exists"

# Check API key
if grep -q "r8_7qAkqHOZTp0cv54yWfjejocNfT0otZE0Jr5gu" backend/.env; then
    echo "✅ Replicate API key configured"
else
    echo "⚠️  Warning: API key may not be set correctly"
fi

# Check MongoDB URL
if grep -q "mongodb+srv" backend/.env; then
    echo "✅ MongoDB Atlas configured"
elif grep -q "mongodb://localhost" backend/.env; then
    echo "⚠️  Using local MongoDB (make sure it's running)"
else
    echo "❌ MongoDB URL not found in .env"
fi

echo ""
echo "🔧 Setup Instructions:"
echo "======================="
echo ""
echo "TERMINAL 1 - Backend:"
echo "  cd backend"
echo "  python3 -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  python main.py"
echo ""
echo "TERMINAL 2 - Frontend:"
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "BROWSER:"
echo "  1. Add jewelry: http://localhost:8000/docs"
echo "  2. Test app: http://localhost:5173"
echo ""
echo "📚 Full guide: START_TESTING_NOW.md"
echo ""
echo "Ready to start? (Press ENTER)"
read

echo ""
echo "Starting backend in 3 seconds..."
echo "Press Ctrl+C to cancel"
sleep 3

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv and start
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "🚀 Starting backend server..."
echo "   Open new terminal for frontend!"
echo ""

python main.py
