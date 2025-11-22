#!/bin/bash
cd backend
source venv/bin/activate
echo "Starting Fast Backend (No MongoDB required)..."
uvicorn server_fast:app --host 0.0.0.0 --port 8080
