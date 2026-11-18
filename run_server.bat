@echo off
title Local Web Server - Au Phuoc Tien CV
echo ========================================================
echo DANG KHOI CHAY WEB SERVER CHO LI LICH TRUC TUYEN...
echo Tac gia: Au Phuoc Tien (MSSV: 2674802010764 - Lop: 71K32CNTT03)
echo ========================================================
echo.
echo Trang web dang chay tai: http://localhost:8080
echo Nhap Ctrl+C de dung server.
echo.
python -m http.server 8080
pause
