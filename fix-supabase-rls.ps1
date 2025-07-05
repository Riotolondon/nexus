# PowerShell script to fix Row Level Security (RLS) issues in Supabase
# This script temporarily disables RLS on the users table to allow registration

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '([^=]+)=(.*)') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$SUPABASE_URL = $env:EXPO_PUBLIC_SUPABASE_URL
$SUPABASE_KEY = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_KEY) {
    Write-Host "Error: Supabase URL and key are required. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    exit 1
}

Write-Host "This script will fix Row Level Security (RLS) issues in your Supabase database."
Write-Host "It will temporarily disable RLS on the users table to allow registration."
Write-Host "Press Ctrl+C to cancel or any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# SQL to fix RLS issues
$sql = @"
-- Temporarily disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Add insert policy for when RLS is re-enabled
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'Allow inserts during signup'
    ) THEN
        CREATE POLICY "Allow inserts during signup" ON public.users
            FOR INSERT
            WITH CHECK (true);
    END IF;
END
\$\$;

-- Grant permissions to service_role and authenticated users
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
"@

# Encode the SQL for sending via REST API
$body = @{
    "query" = $sql
} | ConvertTo-Json

# Set up headers for the API request
$headers = @{
    "apikey" = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "params=single-object"
}

try {
    Write-Host "Applying RLS fixes to Supabase..."
    
    # Execute the SQL via REST API
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body | Out-Null
    
    Write-Host "Success! RLS has been temporarily disabled on the users table."
    Write-Host "You should now be able to register users without RLS errors."
    Write-Host ""
    Write-Host "IMPORTANT: After you've finished testing, consider re-enabling RLS for security:"
    Write-Host "1. Go to the Supabase dashboard"
    Write-Host "2. Open the SQL Editor"
    Write-Host "3. Run: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;"
} catch {
    Write-Host "Error applying RLS fixes: $_"
    exit 1
} 