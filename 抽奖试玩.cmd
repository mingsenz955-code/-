@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "dist\御龙高手-v0.16.10-win32-x64\御龙高手.exe" (
 start "" "dist\御龙高手-v0.16.10-win32-x64\御龙高手.exe" --lottery-demo
) else (
 call npm.cmd start -- --lottery-demo
)
