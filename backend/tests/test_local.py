import unittest
import os
import sys
import json
from unittest.mock import patch, MagicMock
from io import BytesIO
from reportlab.pdfgen import canvas

# Add parent directory to path to import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from services.pdf_handler import extract_text_from_pdf

class TestDictatorAI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
        # Create a dummy PDF for testing
        self.pdf_content = self.create_dummy_pdf()

    def create_dummy_pdf(self):
        """Creates a simple PDF in memory"""
        buffer = BytesIO()
        c = canvas.Canvas(buffer)
        c.drawString(100, 750, "Hello World from Dictator AI.")
        c.save()
        buffer.seek(0)
        return buffer

    def test_pdf_extraction_logic(self):
        """Test the logic in pdf_handler directly"""
        temp_pdf = "test_dummy.pdf"
        try:
            with open(temp_pdf, "wb") as f:
                f.write(self.pdf_content.read())
            
            text = extract_text_from_pdf(temp_pdf)
            self.assertIn("Hello World", text)
        finally:
            self.pdf_content.seek(0)
            if os.path.exists(temp_pdf):
                os.remove(temp_pdf)

    @patch('app.extract_text_from_pdf')
    def test_convert_route(self, mock_extract):
        """Test the /convert route returns segments"""
        mock_extract.return_value = "Sentence one. Sentence two."
        
        data = {
            'file': (self.pdf_content, 'test.pdf')
        }
        
        response = self.app.post('/convert', data=data, content_type='multipart/form-data')
        
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertTrue(json_data['success'])
        self.assertIn('pdf_url', json_data)
        self.assertIn('segments', json_data)
        self.assertEqual(len(json_data['segments']), 2)
        self.assertEqual(json_data['segments'][0]['text'], "Sentence one.")

    @patch('app.convert_text_to_speech')
    def test_speak_route(self, mock_tts):
        """Test the /speak route returns audio url"""
        mock_tts.return_value = "test_audio.mp3"
        
        data = {
            'text': 'Hello world'
        }
        
        # Mock headers
        headers = {'X-OpenAI-Key': 'sk-test-key'}
        
        response = self.app.post('/speak', 
                               data=json.dumps(data), 
                               content_type='application/json',
                               headers=headers)
        
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['audio_url'], "/static/audio/test_audio.mp3")

    def test_speak_missing_api_key(self):
        """Test /speak error when API key is missing"""
        data = {
            'text': 'Hello world'
        }
        # Ensure env var is not set and no header is sent
        with patch.dict(os.environ, {}, clear=True):
            response = self.app.post('/speak', 
                                   data=json.dumps(data), 
                                   content_type='application/json')
            
            self.assertEqual(response.status_code, 401)
            self.assertIn("API Key missing", response.get_json()['error'])

if __name__ == '__main__':
    unittest.main()
