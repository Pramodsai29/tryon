@echo off
echo Starting MAISON...
echo.

:: Load local .env if present
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" set "%%A=%%B"
    )
)

:: Check for API key
if "%GEMINI_API_KEY%"=="" (
    echo ERROR: GEMINI_API_KEY is not set!
    echo.
    echo Please set it by running:
    echo   set GEMINI_API_KEY=your_key_here
    echo.
    echo Get your key from Google AI Studio or Google Cloud.
    pause
    exit /b 1
)

echo Starting Python chatbot backend on port 5000...
start "MAISON Backend" cmd /k "pip install -r requirements.txt -q && python server.py"

timeout /t 3 >nul

echo Starting React frontend on port 8080...
start "MAISON Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers starting!
echo    Frontend: http://localhost:8080
echo    Backend:  http://localhost:5000
echo.
pause
