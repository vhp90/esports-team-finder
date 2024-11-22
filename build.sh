#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
# Clean install dependencies
rm -rf node_modules package-lock.json
export NODE_OPTIONS="--max_old_space_size=2048"  # Prevent memory issues during build
npm cache clean --force
npm install --legacy-peer-deps
CI=false npm run build

# Create static directory in backend if it doesn't exist
echo "Setting up static files..."
cd ../backend
mkdir -p static

# Clean existing files in static directory
rm -rf static/*

# Copy frontend build to backend static directory
echo "Copying frontend build to backend..."
cp -r ../frontend/build/* static/

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Build complete!"
