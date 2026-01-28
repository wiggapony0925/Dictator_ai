# Dictator AI 🎙️

An advanced "School Tool" that converts PDF textbooks into audio, featuring a split-screen reader, real-time highlighting, and a sleek floating player with instant scrubbing.

## Architecture
The project is split into two distinct parts:
- **`backend/`**: Python Flask API (Port 5001) handling PDF text extraction and TTS.
- **`frontend/`**: React + TypeScript + Vite app (Port 5173) for the user interface.

## Prerequisites
- Node.js (v18+) & npm
- Python 3.9+
- OpenAI API Key

## 🚀 Quick Start (Development)

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the API
export OPENAI_API_KEY=your_key_here
flask run --port 5001
```

### 2. Start the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to use the app.

## 🧪 Testing
The project includes a test suite for the backend API.

```bash
cd backend
python3 -m pytest tests/test_local.py
```

## 📦 Deployment (Production)

### Frontend Build
To create an optimized production build:
```bash
cd frontend
npm run build
```
The output will be in `frontend/dist`. You can deploy this folder to Netlify, Vercel, or serve it statically.

### Backend Deployment
Deploy the `backend/` folder to any Python hosting service (Heroku, Render, AWS). 
Ensure you set the `OPENAI_API_KEY` environment variable in your production environment.
