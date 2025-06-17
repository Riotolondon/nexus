@echo off
echo Starting Solus Nexus application...
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs\
"C:\Program Files\nodejs\npx.cmd" expo start
pause 