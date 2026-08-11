@echo off
chcp 65001 >nul
title Waterlight Gallery - 启动本地服务器...
echo.
echo ================ Waterlight 本地预览服务器 ================
echo.
echo   正在启动 PowerShell 稳定版服务器...
echo.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
if errorlevel 1 (
    echo.
    echo   如果双击打不开这个文件，请右键 start-server.ps1 -> 使用 PowerShell 运行
    echo.
    pause
)
