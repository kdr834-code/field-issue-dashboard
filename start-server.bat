@echo off
cd /d "%~dp0"

echo ============================================
echo   Starting Field Issue Dashboard server...
echo ============================================
echo.
echo If this window closes or shows an error below,
echo take a screenshot of everything on this screen.
echo.
echo ---- trying: python -m http.server 8080 ----
python -m http.server 8080

echo.
echo ---- that did not stay running, trying: py -m http.server 8080 ----
py -m http.server 8080

echo.
echo ============================================
echo   Could not start the server.
echo   Please screenshot this whole window and
echo   show it to Claude.
echo ============================================
echo.
pause
