@echo off
echo ===================================================
echo Fixing React Native SVG Compatibility Issues
echo ===================================================
echo.
echo This script will:
echo 1. Uninstall the current react-native-svg
echo 2. Install a compatible version
echo 3. Clear cache
echo 4. Apply patches
echo.
set /p confirm="Do you want to continue? (y/n): "
if /i not "%confirm%"=="y" exit /b

echo.
echo Step 1: Uninstalling current react-native-svg...
npm uninstall react-native-svg

echo.
echo Step 2: Installing compatible version...
npm install react-native-svg@12.3.0

echo.
echo Step 3: Clearing cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo.
echo Step 4: Applying comprehensive SVG fix...
echo import './comprehensive-svg-fix'; > svg-import.txt

echo.
echo ===================================================
echo SVG compatibility fix complete!
echo ===================================================
echo.
echo Next steps:
echo 1. Add this line to the top of your App.tsx:
echo    import './comprehensive-svg-fix';
echo.
echo 2. Restart your development server
echo.
echo 3. If you still have issues, try clearing all cache:
echo    npm start -- --reset-cache
echo.
pause 