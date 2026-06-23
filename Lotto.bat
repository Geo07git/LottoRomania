@echo off
cd /d %~dp0

powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c npm run dev' -WindowStyle Hidden"

timeout /t 2 >nul
start http://localhost:3000