#!/bin/bash

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
npm install
npm run build

# Move back to root and install backend dependencies
echo "Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt

echo "Build complete!"
