@echo off
echo Starting Mortality Risk Prediction System

::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Start Backend
::::::::::::::::::::::::::::::::::::::::::::::::::::::
start "Backend API" cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && python app.py"

::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Start Frontend
::::::::::::::::::::::::::::::::::::::::::::::::::::::
start "Frontend UI" cmd /k "cd frontend && npm install && npm run dev"

echo Both services are starting up.
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:5173
pause
