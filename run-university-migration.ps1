# PowerShell script to run the university migration SQL file against the Supabase database

# Get the Supabase URL and API Key from the .env file or environment variables
$envFile = ".env"
$supabaseUrl = $null
$supabaseKey = $null

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "EXPO_PUBLIC_SUPABASE_URL=(.*)") {
            $supabaseUrl = $matches[1]
        }
        if ($_ -match "EXPO_PUBLIC_SUPABASE_ANON_KEY=(.*)") {
            $supabaseKey = $matches[1]
        }
    }
}

# If not found in .env, try environment variables
if (-not $supabaseUrl) {
    $supabaseUrl = $env:EXPO_PUBLIC_SUPABASE_URL
}
if (-not $supabaseKey) {
    $supabaseKey = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY
}

# Check if we have the required values
if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Error: Supabase URL and API Key are required. Please set them in .env file or as environment variables."
    exit 1
}

# Path to the migration SQL files
$universityMigrationFile = "supabase/universities_migration.sql"
$rlsFixFile = "supabase/rls_fix.sql"

if (-not (Test-Path $universityMigrationFile)) {
    Write-Host "Error: University migration SQL file not found at $universityMigrationFile"
    exit 1
}

if (-not (Test-Path $rlsFixFile)) {
    Write-Host "Error: RLS fix SQL file not found at $rlsFixFile"
    exit 1
}

# Read the SQL content
$universityMigrationContent = Get-Content $universityMigrationFile -Raw
$rlsFixContent = Get-Content $rlsFixFile -Raw

Write-Host "Running university migration script against Supabase..."

# Use Invoke-RestMethod to execute the SQL against the Supabase REST API
# Note: This is a simplified example. In a real-world scenario, you might need to use the Supabase CLI or a PostgreSQL client.
try {
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Execute the university migration SQL
    Write-Host "Applying university migration..."
    $universityBody = @{
        "query" = $universityMigrationContent
    } | ConvertTo-Json
    
    # Note: This is a placeholder. The actual endpoint might be different depending on your Supabase setup
    $universityResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $universityBody
    
    Write-Host "University migration completed successfully!"
    
    # Execute the RLS fix SQL
    Write-Host "Applying RLS fix..."
    $rlsFixBody = @{
        "query" = $rlsFixContent
    } | ConvertTo-Json
    
    $rlsFixResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $rlsFixBody
    
    Write-Host "RLS fix applied successfully!"
} catch {
    Write-Host "Error executing migration: $_"
    exit 1
}

Write-Host "All migrations completed successfully!"
Write-Host "You can now run your application with the updated database configuration." 