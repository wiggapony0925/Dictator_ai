import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from services.pdf_handler import extract_text_from_pdf, split_into_sentences
from services.tts_handler import convert_text_to_speech
import os

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max limit

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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

            # 1. Extract Text
            full_text = extract_text_from_pdf(filepath)
            
            # 2. Split into sentences
            sentences = split_into_sentences(full_text)
            
            # 3. Create segments structure
            segments = [{"id": i, "text": s} for i, s in enumerate(sentences)]
            
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
    
    # Get API key from header or environment (Frontend should send it if user entered it)
    api_key = request.headers.get('X-OpenAI-Key') or os.environ.get('OPENAI_API_KEY')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not api_key:
        return jsonify({"error": "API Key missing"}), 401
        
    try:
        # Generate audio for this specific segment
        audio_filename = convert_text_to_speech(text, api_key)
        audio_url = f"/static/audio/{audio_filename}"
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

