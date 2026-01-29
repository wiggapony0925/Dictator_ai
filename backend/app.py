import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from services.pdf_handler import extract_sentences_with_coordinates
from services.tts_handler import convert_text_to_speech
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__, static_folder='static/dist', static_url_path='/')
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max limit

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_from_directory('static/audio', filename)

@app.route('/convert', methods=['POST'])
def convert():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # 1. Extract Text with Coordinates
            raw_segments = extract_sentences_with_coordinates(filepath)
            
            # 2. Add IDs to segments
            segments = [{"id": i, **seg} for i, seg in enumerate(raw_segments)]
            
            # Return JSON structure for the frontend
            return jsonify({
                "success": True, 
                "pdf_url": f"/uploads/{filename}",
                "segments": segments
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text')
    voice = data.get('voice', 'alloy')
    speed = float(data.get('speed', 1.0))
    model = data.get('model', 'tts-1')
    
    # Get API key from header (User must provide it in Settings)
    api_key = request.headers.get('X-OpenAI-Key')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not api_key:
        return jsonify({"error": "API Key missing"}), 401
        
    try:
        # Generate audio for this specific segment
        audio_filename = convert_text_to_speech(text, api_key, voice, speed, model)
        audio_url = f"/static/audio/{audio_filename}"
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@app.route('/healthz')
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
