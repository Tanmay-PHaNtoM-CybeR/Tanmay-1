@echo off
title TripGenius AI - Install
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js and npm were not found.
  echo Please install the free LTS version from https://nodejs.org/, then run this file again.
  echo.
  pause
  exit /b 1
)
echo Installing TripGenius AI dependencies. This may take a few minutes the first time...
call npm install
if errorlevel 1 (
  echo.
  echo Installation did not finish. Check that your internet connection is active and try again.
  pause
  exit /b 1
)
echo.
echo Installation complete. You can now double-click START.bat.
pause
