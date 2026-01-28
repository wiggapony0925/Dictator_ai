# Dictator AI 🎙️

A simple yet effective tool that reads your PDF files out loud using OpenAI's high-quality Text-to-Speech (TTS) API.

## Features
- 📄  **Drag & Drop Interface**: Easily upload your PDFs.
- 🗣️  **Premium AI Voice**: Uses OpenAI's `tts-1` model for natural-sounding audio.
- 🔒  **Secure**: Your API key is used only for the conversion and not stored permanently.
- 🎧  **Instant Playback**: Listen immediately or download the MP3.

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- An OpenAI API Key

### 1. Get an OpenAI API Key
To use this application, you need an API key from OpenAI.
1. Go to [platform.openai.com](https://platform.openai.com/signup) and sign up or log in.
2. Navigate to the **API keys** section in the Dashboard.
3. Click **"Create new secret key"**.
4. Give it a name (e.g., "Dictator AI") and click **Create**.
5. **Copy the key immediately** (starts with `sk-...`). You won't be able to see it again!
   > *Note: OpenAI is a paid service. You may need to add a small amount of credit (e.g., $5) to your account to use the API.*

### 2. Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

### 3. Run the Application
Start the server with:
```bash
python app.py
```

### 4. Use the App
1. Open your browser and go to: `http://localhost:5000`
2. **Enter your API Key** in the designated field.
   * *Tip: You can also set it as an environment variable `export OPENAI_API_KEY=your-key` before running the app to skip this step.*
3. **Upload your PDF**.
4. Click **Convert** and wait for the magic! ✨

## 🧹 Housekeeping
- **Audio Files**: Generated audio files are saved in `static/audio/`. You can manually clear this folder if it gets too full.
- **Uploads**: Uploaded PDFs are stored in `uploads/` temporarily.

## License
[MIT](LICENSE)
