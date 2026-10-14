@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "dist\御龙高手-v0.15.0-win32-x64\御龙高手.exe" (
 start "" "dist\御龙高手-v0.15.0-win32-x64\御龙高手.exe"
) else (
 call npm.cmd start
)
