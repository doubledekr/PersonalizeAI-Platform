#!/bin/bash
# PersonalizeAI Backend Startup Script for Azure Web Apps

echo "🚀 Starting PersonalizeAI Backend..."

# Set working directory
cd /home/site/wwwroot

# Install dependencies if needed
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export PYTHONPATH="/home/site/wwwroot"
export FLASK_ENV="production"
export WEBSITES_PORT="8000"

# Start the application
echo "🌐 Starting Flask application..."
python src/main.py

