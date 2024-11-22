#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
export NODE_OPTIONS="--max_old_space_size=2048"  # Prevent memory issues during build
npm install --legacy-peer-deps  # Handle dependency conflicts
CI=false npm run build  # Prevent treating warnings as errors

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
