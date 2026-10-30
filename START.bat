@echo off
title TripGenius AI
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm were not found. Please run INSTALL.bat after installing Node.js LTS from https://nodejs.org/.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo First-time setup: installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Setup did not finish. Please run INSTALL.bat and try again.
    pause
    exit /b 1
  )
)
echo Starting TripGenius AI. Your browser will open shortly.
call npm run dev -- --host 127.0.0.1 --open
pause
