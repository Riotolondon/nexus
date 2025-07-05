@echo off
echo ===================================================
echo Solus Nexus - Fix Supabase RLS Issues
echo ===================================================
echo.
echo This script will help fix Row Level Security (RLS) issues
echo in your Supabase database that prevent user registration.
echo.
echo Press any key to continue...
pause > nul

powershell -ExecutionPolicy Bypass -File "./quick-fix-rls.ps1"

echo.
echo ===================================================
echo After applying the fix in Supabase, try registering again.
echo If you still have issues, please refer to SUPABASE_SETUP.md
echo ===================================================
echo.
pause 