#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
npm install
npm run build

# Create static directory in backend if it doesn't exist
echo "Setting up static files..."
cd ../backend
mkdir -p static

# Copy frontend build to backend static directory
echo "Copying frontend build to backend..."
cp -r ../frontend/build/* static/

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Build complete!"
