#!/bin/bash

# Create necessary directories
mkdir -p backend/static

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
CI=false npm run build

echo "Moving frontend build to backend/static..."
cp -r build/* ../backend/static/

echo "Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt

echo "Build complete!"
