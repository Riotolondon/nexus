# Script to verify Node.js and npm installation

Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js is not installed or not in the PATH" -ForegroundColor Red
}

Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "npm is installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "npm is not installed or not in the PATH" -ForegroundColor Red
}

Write-Host "`nIf both are installed, you can now run:" -ForegroundColor Cyan
Write-Host "npm install" -ForegroundColor Cyan
Write-Host "npm start" -ForegroundColor Cyan 