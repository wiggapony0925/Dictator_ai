import os
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename
from services.pdf_handler import extract_text_from_pdf
from services.tts_handler import convert_text_to_speech

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max limit

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Get API key from form or environment
    api_key = request.form.get('api_key') or os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return jsonify({"error": "OpenAI API Key is required (set in ENV or provide in form)"}), 400

    if file and file.filename.endswith('.pdf'):
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # 1. Extract Text
            text = extract_text_from_pdf(filepath)

            # 2. Convert to Speech
            audio_filename = convert_text_to_speech(text, api_key)
            
            # 3. Return URL
            audio_url = f"/static/audio/{audio_filename}"
            
            # Clean up uploaded PDF if desired (keeping it simple for now and leaving it)
            
            return jsonify({"success": True, "audio_url": audio_url})

        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
