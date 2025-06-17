$BunPath = "C:\Users\USER PC\.bun\bin\bun.exe"

# Change to the project directory
Set-Location -Path "C:\Users\USER PC\Desktop\Solus Nexus"

# Install dependencies
Write-Host "Installing project dependencies..."
& $BunPath install --no-cache

# Print completion message
Write-Host "Dependencies installation completed." -ForegroundColor Green
Write-Host "You can now run the app with .\run-app.ps1" -ForegroundColor Green 