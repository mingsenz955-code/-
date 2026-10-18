@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "启动游戏.exe" (
 start "" "启动游戏.exe"
) else if exist "dist\御龙高手-v0.16.72-win32-x64\御龙高手.exe" (
 start "" "dist\御龙高手-v0.16.72-win32-x64\御龙高手.exe"
) else (
 call npm.cmd start
)
