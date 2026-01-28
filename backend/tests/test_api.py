import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_convert_endpoint_no_file(client):
    """Test /convert returns 400 if no file is uploaded."""
    response = client.post('/convert')
    assert response.status_code == 400
    assert b"No file part" in response.data

@patch('app.extract_sentences_with_coordinates')
def test_convert_endpoint_success(mock_extract, client):
    """Test /convert returns segments on success."""
    
    # Mock extraction result
    mock_extract.return_value = [
        {"text": "Test Segment", "page": 1, "bbox": [0,0,0,0], "rects": []}
    ]
    
    # Easier approach: Mock the save call itself since we don't want to write to disk
    with patch('werkzeug.datastructures.FileStorage.save'):
        data = {'file': (open(__file__, 'rb'), 'test.pdf')} # Send self as dummy file
        response = client.post('/convert', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        assert len(json_data['segments']) == 1
        assert json_data['segments'][0]['text'] == "Test Segment"

@patch('app.convert_text_to_speech')
def test_speak_endpoint(mock_tts, client):
    """Test /speak returns audio url."""
    
    # Mock TTS service return value (filename)
    mock_tts.return_value = "audio_123.mp3"
    
    data = {
        "text": "Hello",
        "voice": "alloy",
        "speed": 1.0,
        "model": "tts-1"
    }
    
    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-dummy"}):
        # We also need to mock request.headers['X-OpenAI-Key']
        response = client.post('/speak', 
                               json=data,
                               headers={'X-OpenAI-Key': 'sk-test-key'})
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert 'audio_url' in json_data
        assert '/static/audio/audio_123.mp3' in json_data['audio_url']

def test_speak_endpoint_missing_input(client):
    """Test /speak checks for missing text."""
    response = client.post('/speak', json={}, headers={'X-OpenAI-Key': 'key'})
    assert response.status_code == 400
