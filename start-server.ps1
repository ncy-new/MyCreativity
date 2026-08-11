# Waterlight Gallery - 本地静态服务器启动脚本 (PowerShell 稳定版)
# 运行方法：右键 -> 使用 PowerShell 运行  或  在当前目录打开终端后执行 .\start-server.ps1
# 功能：
#   1. 自动杀掉之前占用 8000 端口的旧进程
#   2. 在后台独立进程中启动 Python HTTP 服务器
#   3. 自动打开浏览器预览

$ErrorActionPreference = "SilentlyContinue"
$Port = 8000
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "================ Waterlight 本地预览服务器 ==============" -ForegroundColor Cyan
Write-Host ""

# Step 1: 清理旧进程
Write-Host "[1/3] 清理端口 ${Port} 上的旧进程..." -ForegroundColor Yellow
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $pids = $existing | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "      已杀掉进程 PID: ${pid}" -ForegroundColor Gray
        } catch {}
    }
    Start-Sleep -Milliseconds 500
} else {
    Write-Host "      端口 ${Port} 空闲，无需清理" -ForegroundColor Gray
}

# Step 2: 启动新服务器（后台独立进程，不会因为关终端被杀）
Write-Host "[2/3] 启动 Python HTTP 服务器 (端口 ${Port})..." -ForegroundColor Yellow
$pythonCmd = @"
import os, sys
os.chdir(r'$ProjectDir')
sys.path.insert(0, r'$ProjectDir')
from http.server import test
test(HandlerClass=__import__('http.server').SimpleHTTPRequestHandler, port=$Port, bind='127.0.0.1')
"@

$encodedCmd = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($pythonCmd))
$proc = Start-Process -FilePath "python" -ArgumentList "-NoProfile","-NonInteractive","-EncodedCommand",$encodedCmd `
    -PassThru -WindowStyle Hidden -WorkingDirectory $ProjectDir

# 等待服务器起来 (最多等 5 秒)
for ($i=0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $t = New-Object System.Net.Sockets.TcpClient
        $t.Connect("127.0.0.1", $Port)
        $t.Close()
        break
    } catch {}
}

# Step 3: 验证 & 打开浏览器
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:${Port}/" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Host "[3/3] 服务器启动成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "  📂 项目目录:  $ProjectDir" -ForegroundColor Cyan
        Write-Host "  🌐 预览地址:  http://127.0.0.1:${Port}/" -ForegroundColor Cyan
        Write-Host "  🚦 进程 PID:   $($proc.Id)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  要停止服务器，请按任意键或关闭本窗口" -ForegroundColor Gray
        Write-Host ""
        try { Start-Process "http://127.0.0.1:${Port}/" } catch {}
    } else {
        Write-Host "      ⚠ 服务器返回异常状态码: $($resp.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "      ❌ 启动失败，请检查 Python 是否安装正确，端口 ${Port} 是否被防火墙阻止" -ForegroundColor Red
    Write-Host "      错误信息: $_" -ForegroundColor DarkRed
}

Write-Host "按任意键退出本窗口（服务器会继续在后台运行）..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
