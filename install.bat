@echo off
echo Installing dependencies with legacy peer deps option...
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
echo.
echo If installation was successful, run 'start.bat' to start the application.
pause 