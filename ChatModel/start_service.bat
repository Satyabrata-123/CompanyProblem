@echo off
echo Starting Chat Model Service...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing/Updating requirements...
pip install -r requirements.txt --quiet

REM Start the service
echo.
echo ========================================
echo Chat Model Service Starting...
echo ========================================
echo Service URL: http://localhost:5000
echo Health Check: http://localhost:5000/health
echo.
echo Performance monitoring is ENABLED
echo All metrics will be printed to this terminal
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.
python chatModel.py

pause