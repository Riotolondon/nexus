Write-Host "=== Supabase Schema Migration ===" -ForegroundColor Green
Write-Host ""

# Check if schema file exists
if (Test-Path "supabase/schema.sql") {
    Write-Host "Schema file found: supabase/schema.sql" -ForegroundColor Green
    
    # Read the schema file
    $schemaContent = Get-Content "supabase/schema.sql" -Raw
    
    Write-Host ""
    Write-Host "To apply this schema to your Supabase database:" -ForegroundColor Yellow
    Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
    Write-Host "4. Click 'New query'" -ForegroundColor White
    Write-Host "5. Copy and paste the entire schema content" -ForegroundColor White
    Write-Host "6. Click 'Run' to execute the schema" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to copy schema to clipboard
    $copyToClipboard = Read-Host "Would you like to copy the schema to clipboard? (y/n)"
    
    if ($copyToClipboard -eq "y" -or $copyToClipboard -eq "Y") {
        try {
            $schemaContent | Set-Clipboard
            Write-Host "Schema copied to clipboard! You can now paste it into the Supabase SQL Editor." -ForegroundColor Green
        } catch {
            Write-Host "Could not copy to clipboard. Please manually copy the content from supabase/schema.sql" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Important tables that will be created:" -ForegroundColor Cyan
    Write-Host "- events (for events management)" -ForegroundColor White
    Write-Host "- community_posts (for announcements and posts)" -ForegroundColor White
    Write-Host "- post_interactions (for likes, bookmarks, shares)" -ForegroundColor White
    Write-Host "- post_comments (for comments system)" -ForegroundColor White
    Write-Host ""
    Write-Host "Important functions that will be created:" -ForegroundColor Cyan
    Write-Host "- get_home_feed() - Main function for loading home feed" -ForegroundColor White
    Write-Host "- toggle_post_interaction() - For like/bookmark/share actions" -ForegroundColor White
    Write-Host "- add_post_comment() - For adding comments" -ForegroundColor White
    Write-Host "- increment/decrement_event_attendees() - For event registration" -ForegroundColor White
    
} else {
    Write-Host "Schema file not found: supabase/schema.sql" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the project root directory." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "After applying the schema, your app should work correctly!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 