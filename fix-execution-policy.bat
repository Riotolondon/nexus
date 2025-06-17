@echo off
echo Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"

echo Setting PATH to include Node.js...
set PATH=%PATH%;C:\Program Files\nodejs\

echo.
echo Now you can run 'install.bat' to install dependencies.
pause 