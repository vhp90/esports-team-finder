# Install frontend dependencies and build
Write-Host "Building frontend..."
Set-Location frontend
npm install
npm run build

# Move back to root and install backend dependencies
Write-Host "Installing backend dependencies..."
Set-Location ../backend
pip install -r requirements.txt

Write-Host "Build complete!"
