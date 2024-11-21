$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($null -eq $mongoService) {
    Write-Host "MongoDB service is not installed. Please install MongoDB first."
    exit 1
}

if ($mongoService.Status -ne "Running") {
    Write-Host "Starting MongoDB service..."
    Start-Service -Name "MongoDB"
    Start-Sleep -Seconds 5
    $mongoService.Refresh()
    
    if ($mongoService.Status -eq "Running") {
        Write-Host "MongoDB service started successfully!"
    } else {
        Write-Host "Failed to start MongoDB service. Please check MongoDB installation."
        exit 1
    }
} else {
    Write-Host "MongoDB service is already running."
}

# Verify MongoDB connection
try {
    $mongosh = "mongosh"
    $testConnection = & $mongosh --eval "db.runCommand({ping: 1})" --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully connected to MongoDB!"
    } else {
        Write-Host "MongoDB is running but connection test failed."
        exit 1
    }
} catch {
    Write-Host "Error testing MongoDB connection: $_"
    exit 1
}
