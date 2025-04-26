# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8888 \
    FLASK_ENV=production \
    WORKERS=4 \
    TIMEOUT=120 \
    FLASK_APP=server.py \
    OPENAI_API_KEY=${OPENAI_API_KEY}

# Expose the port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8888}/health || exit 1

# Run Gunicorn with Uvicorn workers
CMD ["gunicorn", "server:flask_app", \
    "--bind", "0.0.0.0:8888", \
    "--workers", "4", \
    "--worker-class", "uvicorn.workers.UvicornWorker", \
    "--timeout", "120", \
    "--forwarded-allow-ips", "*"]
