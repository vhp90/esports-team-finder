#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Backend setup
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Frontend build
echo "Installing frontend dependencies..."
cd frontend

# Clean npm cache and node_modules
echo "Cleaning npm cache..."
npm cache clean --force
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Building frontend..."
# Set environment variables directly
export CI=false
export GENERATE_SOURCEMAP=false
export PUBLIC_URL=/
npm run build

# Verify frontend build
if [ ! -f "build/index.html" ]; then
    echo "Error: Frontend build failed - index.html not found!"
    exit 1
fi

echo "Frontend build successful!"

# Setup static files
echo "Setting up static files..."
cd ..
rm -rf backend/static
mkdir -p backend/static

echo "Copying frontend build to backend/static..."
cp -r frontend/build/* backend/static/

# Verify static files
echo "Verifying static files..."
if [ ! -f "backend/static/index.html" ]; then
    echo "Error: Static file copy failed - index.html not found in backend/static!"
    exit 1
fi

echo "Listing contents of backend/static directory:"
ls -la backend/static

echo "Build process completed successfully!"
