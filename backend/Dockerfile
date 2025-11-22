FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install enhanced dependencies
RUN pip install --no-cache-dir redis celery numpy pandas scikit-learn

# Copy application
COPY . .

# Expose port
EXPOSE 8080

# Run application
CMD ["python", "server.py"]
