# Dictator AI 🎙️📄

> **Turn any PDF into an interactive audio experience.**  
> *Real-time text syncing, professional AI narration, and native mobile design.*

![Dictator AI Logo](/public/logo.png)

## Overview

**Dictator AI** is a modern web application that bridges the gap between reading and listening. It analyzes PDF documents, segments them into natural paragraphs, and uses OpenAI's advanced TTS (Text-to-Speech) models to narrate them with human-like quality. 

Unlike standard screen readers, Dictator AI provides **spatial context**—highlighting the exact text block being read on the original PDF layout in real-time.

## ✨ Key Features

### 🎧 Studio-Quality Audio
*   **Neural Voice Engine**: Powered by OpenAI's `tts-1` & `tts-1-hd`.
*   **Smart Selection**: Automatically chooses `gpt-4o-mini-tts` for speed or HD models for quality.
*   **Live Controls**: Adjust **Speed** (0.5x - 3.0x) and **Voice** (Alloy, Echo, Shimmer...) instantly.

### 📱 Mobile-First Experience
*   **Responsive Design**: A buttery-smooth layout that adapts from desktop split-views to a modern **mobile bottom-sheet** interface.
*   **Touch Optimized**: Large tap targets, swipeable interactions, and `100dvh` (Dynamic Viewport Height) for a native app feel.
*   **Background Play**: Continue listening even when your screen is locked.

### 🧠 Intelligent PDF Processing
*   **Paragraph Segmentation**: Smart backend logic groups sentences into natural reading blocks.
*   **Precision Highlighting**: Real-time visual feedback shows you exactly where you are on the page.
*   **Interactive Layer**: Click any paragraph on the PDF to jump the audio instantly to that spot.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: TypeScript
*   **Styling**: SCSS (BEM Architecture) + [Radix UI Themes](https://www.radix-ui.com/)
*   **PDF Engine**: `react-pdf`
*   **State**: Custom Hooks

### Backend
*   **Server**: Flask (Python 3.11+)
*   **PDF Processing**: `PyMuPDF` (fitz)
*   **AI Integration**: OpenAI Python SDK
*   **Production Server**: Gunicorn

---

## 🚀 Quick Start

### Prerequisites
*   Node.js 20+
*   Python 3.11+
*   OpenAI API Key

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/dictator-ai.git
    cd dictator-ai
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Run the Flask Server
    export FLASK_APP=app.py
    flask run --port 5001
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Visit `http://localhost:5173`.

---

## 🐳 Docker Deployment (Recommended)

The application is containerized with a highly optimized **Multi-Stage Build**.

1.  **Build the Image**
    ```bash
    docker build -t dictator-ai .
    ```

2.  **Run the Container**
    ```bash
    docker run -p 8080:5001 -e OPENAI_API_KEY=your_key_here dictator-ai
    ```
    *Note: You can also skip the env var if you prefer to enter the key in the UI Settings.*

3.  **Access**
    Go to `http://localhost:8080`.

---

## 🎨 Architecture & Styles

The project follows a strict **SCSS BEM** methodology for clean, maintainable styles.

*   `frontend/src/styles/main.scss`: Entry point.
*   `frontend/src/styles/abstracts/_variables.scss`: Design tokens (Colors, Spacing).
*   `frontend/src/styles/abstracts/_mixins.scss`: Responsive helpers.

**Example:**
```scss
.mobile-layout {
    &__bottom-sheet {
        @include mobile {
            height: 250px;
        }
    }
}
```

## 📄 License
MIT License. Created by Jeffrey Fernandez.
