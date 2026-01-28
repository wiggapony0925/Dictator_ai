# Dictator AI - Interactive PDF to Audio Studio

Dictator AI is a professional-grade web application that transforms PDF documents into interactive, high-quality audio sessions. It features real-time text synchronization, smart AI model optimization, and a production-ready UI built with React 19 and Radix UI.

## 🚀 Key Features

### 🎧 Interactive Audio Studio
-   **OpenAI TTS Integration**: Supports `tts-1`, `tts-1-hd`, and the ultra-fast `gpt-4o-mini-tts`.
-   **Smart Optimization**: Automatically selects the best model based on file size to balance cost and quality.
-   **Studio Controls**: full control over **Voice** (Alloy, Echo, Nova...) and **Speed** (0.25x - 4.0x).

### 📄 PDF Intelligence
-   **Real-Time Sync**: As the audio reads, the corresponding text on the PDF is highlighted in real-time.
-   **Native Rendering**: Uses `react-pdf` to render actual PDF pages, not just text extraction.
-   **Spatial Awareness**: Backend uses `PyMuPDF` to extract precise bounding box coordinates for every sentence.

### 📱 Modern Engineering
-   **Mobile-First Design**: Responsive layout that stacks perfectly on mobile devices.
-   **Background Audio**: Supports the Media Session API, allowing playback to continue when the screen is locked.
-   **Clean Architecture**:
    -   **Frontend**: React + TypeScript + Vite.
    -   **Styling**: Modular SCSS (7-1 Pattern) + BEM Naming Convention + Radix Themes.
    -   **Backend**: Flask + Python 3.10+.

## 🛠️ Architecture

### Frontend (`/frontend`)
-   **Framework**: React 19, Vite, TypeScript.
-   **UI Library**: Radix UI Primitives & Radix Themes.
-   **Styling**: SCSS Modules (`styles/abstracts`, `styles/components`, `styles/layout`) following BEM.
-   **State**: Custom `useDictator` hook managing audio, file, and settings state.

### Backend (`/backend`)
-   **Framework**: Flask.
-   **PDF Engine**: `PyMuPDF` (fitz) for text and coordinate extraction.
-   **AI Engine**: OpenAI API (TTS).

## ⚡ Quick Start

### Prerequisites
-   Node.js 18+
-   Python 3.10+
-   OpenAI API Key

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your API Key
export OPENAI_API_KEY=sk-...

# Run Server (Port 5001)
flask run --port 5001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

## 📱 Mobile Usage
1.  Ensure your computer and phone are on the same Wi-Fi.
2.  Find your computer's local IP (e.g., `192.168.1.50`).
3.  Open `http://192.168.1.50:5173` on your phone.
4.  Upload a PDF and lock your screen to listen on the go!

## 🤝 Contributing
Styles are located in `frontend/src/styles/`. Please follow the BEM naming convention:
-   Block: `.app-navbar`
-   Element: `.app-navbar__content`
-   Modifier: `.app-navbar--active`
