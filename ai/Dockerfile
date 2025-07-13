# Use Python 3.11 slim image
FROM python:3.11-slim-bullseye

# Upgrade pip and system packages to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && pip install --upgrade pip

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create static directory for images
RUN mkdir -p static

# Set environment variables
ENV FLASK_ENV=production
ENV FLASK_APP=app.py
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

# Run the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
