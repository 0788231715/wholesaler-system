#!/bin/bash

echo "🚀 Starting Wholesaler System..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: net start MongoDB"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database..."
npm run seed

# Start the backend server
echo "🔧 Starting backend server..."
npm run dev &

# Wait a bit for backend to start
sleep 5

# Install frontend dependencies (if frontend exists)
if [ -d "../frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd ../frontend
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependencies installation failed"
        exit 1
    fi
    
    echo "🎨 Starting frontend development server..."
    npm run dev &
fi

echo ""
echo "✅ System started successfully!"
echo "======================================"
echo "📊 Backend API: http://localhost:5000"
echo "🎨 Frontend: http://localhost:3000"
echo "📚 API Health: http://localhost:5000/api/health"
echo ""
echo "Sample Login Credentials:"
echo "Admin: admin@wholesaler.com / password123"
echo "Manager: manager@wholesaler.com / password123"
echo "Producer: producer@farm.com / password123"
echo "Retailer: retailer@shop.com / password123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user input to stop
wait