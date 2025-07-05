# Quick fix for Supabase RLS issues
# This script will open your browser to the Supabase SQL Editor with the fix already prepared

# Get Supabase URL from .env or environment variables
$envFile = ".env"
$supabaseUrl = $null

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "EXPO_PUBLIC_SUPABASE_URL=(.*)") {
            $supabaseUrl = $matches[1]
        }
    }
}

if (-not $supabaseUrl) {
    $supabaseUrl = $env:EXPO_PUBLIC_SUPABASE_URL
}

if (-not $supabaseUrl) {
    Write-Host "Couldn't find Supabase URL. Using default URL."
    $supabaseUrl = "https://rrmrspnzyeqjoegrilqe.supabase.co"
}

# Extract project reference from URL
$projectRef = $supabaseUrl -replace "https://", "" -replace "\.supabase\.co.*", ""

# Generate SQL Editor URL
$sqlEditorUrl = "https://app.supabase.com/project/$projectRef/sql/new"

# SQL to fix RLS issues
$sql = @"
-- Fix for Row Level Security (RLS) issues
-- Option 1: Disable RLS temporarily (fastest solution)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a stored procedure to bypass RLS
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_university_id UUID,
    user_study_level TEXT DEFAULT 'undergraduate',
    user_field_of_study TEXT DEFAULT '',
    user_bio TEXT DEFAULT ''
) RETURNS void AS $$
BEGIN
    INSERT INTO public.users (
        id, email, name, university_id, study_level, field_of_study, bio, 
        interests, skills, is_verified, created_at, updated_at
    ) VALUES (
        user_id, user_email, user_name, user_university_id, user_study_level,
        user_field_of_study, user_bio, '{}', '{}', false, NOW(), NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Option 3: Add an RLS policy (best practice)
CREATE POLICY "Allow inserts to users table" ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO anon;
"@

# Save SQL to a temporary file
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
Set-Content -Path $tempFile -Value $sql

# Open the file with the default text editor
Write-Host "Opening SQL fix in your default text editor..."
Invoke-Item $tempFile

# Open the Supabase SQL Editor in the default browser
Write-Host "Opening Supabase SQL Editor in your browser..."
Start-Process $sqlEditorUrl

Write-Host ""
Write-Host "INSTRUCTIONS:"
Write-Host "1. Copy the SQL from the text editor that just opened"
Write-Host "2. Paste it into the Supabase SQL Editor that opened in your browser"
Write-Host "3. Click 'Run' to execute the SQL and fix the RLS issues"
Write-Host ""
Write-Host "After running the SQL, try registering again in your app." 