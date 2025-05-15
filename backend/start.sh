#!/bin/bash

echo "Running Alembic migrations..."
if alembic upgrade head; then
    echo "Alembic migration succeeded."
else
    echo "Alembic migration failed. Exiting."
    exit 1
fi

echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
# Note: The above command assumes that your FastAPI app is defined in a file named main.py