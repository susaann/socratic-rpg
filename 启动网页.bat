@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动本地服务器...
echo.
start "" http://localhost:8764
python server.py 8764
pause
