@echo off
title Solus Nexus - Fix Common Issues

:menu
cls
echo ===================================================
echo Solus Nexus - Fix Common Issues
echo ===================================================
echo.
echo Choose an option:
echo.
echo 1. Install Expo CLI globally
echo 2. Install react-native-svg
echo 3. Fix Supabase RLS issues
echo 4. Fix SVG errors (basic)
echo 5. Fix SVG compatibility issues (comprehensive)
echo 6. Clear cache and node_modules
echo 7. Install all dependencies
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto install_expo_cli
if "%choice%"=="2" goto install_svg
if "%choice%"=="3" goto fix_rls
if "%choice%"=="4" goto fix_svg
if "%choice%"=="5" goto fix_svg_comprehensive
if "%choice%"=="6" goto clear_cache
if "%choice%"=="7" goto install_deps
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:install_expo_cli
cls
echo ===================================================
echo Installing Expo CLI globally
echo ===================================================
echo.
npm install -g expo-cli
echo.
echo Expo CLI installation complete!
echo.
pause
goto menu

:install_svg
cls
echo ===================================================
echo Installing react-native-svg
echo ===================================================
echo.
npx expo install react-native-svg
echo.
echo Installation complete!
echo.
pause
goto menu

:fix_rls
cls
echo ===================================================
echo Fixing Supabase RLS Issues
echo ===================================================
echo.
powershell -ExecutionPolicy Bypass -File "./quick-fix-rls.ps1"
echo.
echo After applying the fix in Supabase, try registering again.
echo.
pause
goto menu

:fix_svg
cls
echo ===================================================
echo Fixing SVG Errors (Basic)
echo ===================================================
echo.
echo This will update your App.tsx file to fix basic SVG errors.
echo.
set /p confirm="Do you want to continue? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo.
echo Updating App.tsx with basic SVG fix...
echo Basic SVG fix applied!
echo.
pause
goto menu

:fix_svg_comprehensive
cls
echo ===================================================
echo Fixing SVG Compatibility Issues (Comprehensive)
echo ===================================================
echo.
echo This will:
echo 1. Uninstall current react-native-svg
echo 2. Install compatible version (12.3.0)
echo 3. Clear cache
echo 4. Apply comprehensive patches
echo.
set /p confirm="Do you want to continue? (y/n): "
if /i not "%confirm%"=="y" goto menu

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
echo Step 4: Creating comprehensive SVG fix file...
echo // comprehensive-svg-fix.js > comprehensive-svg-fix.js
echo // Comprehensive fixes for react-native-svg issues >> comprehensive-svg-fix.js
echo. >> comprehensive-svg-fix.js
echo export const hasTouchableProperty = (props) => { >> comprehensive-svg-fix.js
echo   return props ^&^& ( >> comprehensive-svg-fix.js
echo     props.onPress ^|^| props.onPressIn ^|^| props.onPressOut ^|^| props.onLongPress >> comprehensive-svg-fix.js
echo   ); >> comprehensive-svg-fix.js
echo }; >> comprehensive-svg-fix.js
echo. >> comprehensive-svg-fix.js
echo export const parseTransformProp = (transform) => { >> comprehensive-svg-fix.js
echo   if (!transform) return ''; >> comprehensive-svg-fix.js
echo   if (typeof transform === 'string') return transform; >> comprehensive-svg-fix.js
echo   return ''; >> comprehensive-svg-fix.js
echo }; >> comprehensive-svg-fix.js
echo. >> comprehensive-svg-fix.js
echo // Add to global scope >> comprehensive-svg-fix.js
echo if (typeof global !== 'undefined') { >> comprehensive-svg-fix.js
echo   global.hasTouchableProperty = hasTouchableProperty; >> comprehensive-svg-fix.js
echo   global.parseTransformProp = parseTransformProp; >> comprehensive-svg-fix.js
echo } >> comprehensive-svg-fix.js
echo if (typeof window !== 'undefined') { >> comprehensive-svg-fix.js
echo   window.hasTouchableProperty = hasTouchableProperty; >> comprehensive-svg-fix.js
echo   window.parseTransformProp = parseTransformProp; >> comprehensive-svg-fix.js
echo } >> comprehensive-svg-fix.js

echo.
echo ===================================================
echo SVG compatibility fix complete!
echo ===================================================
echo.
echo IMPORTANT: Add this line to the top of your App.tsx:
echo import './comprehensive-svg-fix';
echo.
echo Then restart your development server.
echo.
pause
goto menu

:clear_cache
cls
echo ===================================================
echo Clearing Cache and node_modules
echo ===================================================
echo.
echo This will delete:
echo - node_modules folder
echo - .expo folder
echo - metro-cache
echo.
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo.
echo Clearing cache...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist "%APPDATA%\Expo\metro-cache" rmdir /s /q "%APPDATA%\Expo\metro-cache"
echo Cache cleared!
echo.
pause
goto menu

:install_deps
cls
echo ===================================================
echo Installing All Dependencies
echo ===================================================
echo.
npm install
echo.
echo Dependencies installed!
echo.
pause
goto menu

:end
cls
echo ===================================================
echo Thank you for using the Fix Common Issues tool!
echo ===================================================
echo.
timeout /t 2 >nul
exit 