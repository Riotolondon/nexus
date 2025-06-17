# Change to the project directory
Set-Location -Path "C:\Users\USER PC\Desktop\Solus Nexus"

# First, check if npm is installed
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm is not installed or not in the PATH. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Set the npm registry to Cloudflare's mirror
npm config set registry https://npm.cloudflare.com

# Install dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
npm install

# Print completion message
Write-Host "Dependencies installation completed." -ForegroundColor Green
Write-Host "You can now run the app with 'npm start'" -ForegroundColor Green 