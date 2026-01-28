import unittest
import os
import sys
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
        # Save dummy PDF to temp file
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

    @patch('app.convert_text_to_speech')
    @patch('app.extract_text_from_pdf')
    def test_convert_route(self, mock_extract, mock_tts):
        """Test the Flask route with mocked services"""
        mock_extract.return_value = "Mocked Text"
        mock_tts.return_value = "mocked_audio.mp3"
        
        data = {
            'file': (self.pdf_content, 'test.pdf'),
            'api_key': 'sk-fake-key'
        }
        
        response = self.app.post('/convert', data=data, content_type='multipart/form-data')
        
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertTrue(json_data['success'])
        self.assertIn("mocked_audio.mp3", json_data['audio_url'])

    def test_missing_api_key(self):
        """Test error when API key is missing"""
        data = {
            'file': (self.pdf_content, 'test.pdf')
        }
        # Ensure env var is not set for this test
        with patch.dict(os.environ, {}, clear=True):
            response = self.app.post('/convert', data=data, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 400)
            self.assertIn("API Key is required", response.get_json()['error'])

if __name__ == '__main__':
    unittest.main()
