@echo off
echo Starting Compilify Lexical Analyzer...
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8000
echo.
echo Server starting at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver
pause