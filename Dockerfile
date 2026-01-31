# --- Stage 1: Build Frontend ---
FROM node:20-alpine as frontend_build
WORKDIR /app/frontend

# Install dependencies (cached if package.json unchanged)
COPY frontend/package*.json ./
RUN npm ci

# Build the React App
COPY frontend/ .
RUN npm run build

# --- Stage 2: Production Backend ---
FROM python:3.11-slim
WORKDIR /app


# Install system dependencies for PyMuPDF
# (build-essential/gcc might be needed depending on the wheel availability)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python Dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend
WORKDIR /app/backend

# Copy Built Frontend Assets from Stage 1
# Ensure Flask is configured to look in 'static/dist' or 'static' depending on your app.py
# If app.py serves from "./static/dist", copy to there:
COPY --from=frontend_build /app/frontend/dist ./static/dist

# Create necessary directories
RUN mkdir -p uploads static/audio

# Expose Port
EXPOSE 5001

# Run Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
