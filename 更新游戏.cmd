@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update-game.ps1" -GameDirectory "%~dp0." -Launch
if errorlevel 1 pause
