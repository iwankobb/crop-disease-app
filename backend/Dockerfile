# Use a slim official python base image to minimize container footprint
FROM python:3.10-slim

# Set environment variable to prevent python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

WORKDIR /app

# Install system dependencies required for OpenCV, PyTorch, and YOLOv8
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python deep learning & web dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.2.0 torchvision==0.17.0 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files (including models, services, models weights)
COPY . /app/

# Expose server port (default 5000)
EXPOSE 5000

# Start Flask application using production-grade Gunicorn WSGI.
# Using 1 worker and 4 threads is optimized for CPU-based deep learning inference,
# preventing Out-Of-Memory (OOM) crashes on cloud clusters while keeping execution fast.
CMD gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 app:app
