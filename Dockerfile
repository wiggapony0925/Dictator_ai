# Stage 1: Build Frontend
FROM node:20 as build-step
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend & Serve
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (for PyMuPDF/others if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Backend Requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend

# Copy built frontend assets to backend static folder
# We configured Flask to look in 'static/dist'
COPY --from=build-step /app/frontend/dist ./backend/static/dist

# Initialize directories
RUN mkdir -p backend/uploads && mkdir -p backend/static/audio

# Expose Port
EXPOSE 5001

# Run Gunicorn
WORKDIR /app/backend
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
