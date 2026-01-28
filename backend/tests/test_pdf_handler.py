import pytest
from unittest.mock import MagicMock, patch
import sys
import os

# Add backend directory to sys.path to import services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.pdf_handler import extract_sentences_with_coordinates

def test_extract_sentences_structure(mocker):
    """Test that the extractor returns the correct structure (blocks/paragraphs)."""
    
    # Mock PyMuPDF (fitz)
    mock_doc = MagicMock()
    mock_page = MagicMock()
    
    # Mock page.get_text("dict") structure
    # Block 1: "Hello World"
    # Block 2: "Second Paragraph"
    mock_page.get_text.return_value = {
        "blocks": [
            {
                "type": 0, # Text
                "lines": [
                    {
                        "bbox": [10, 10, 100, 20],
                        "spans": [{"text": "Hello "}, {"text": "World"}]
                    }
                ]
            },
            {
                "type": 0, # Text
                "lines": [
                    {
                        "bbox": [10, 30, 100, 40],
                        "spans": [{"text": "Second "}, {"text": "Paragraph"}]
                    }
                ]
            }
        ]
    }
    
    mock_doc.__iter__.return_value = [mock_page]
    
    with patch('fitz.open', return_value=mock_doc):
        segments = extract_sentences_with_coordinates("dummy.pdf")
        
        assert len(segments) == 2
        assert segments[0]['text'] == "Hello World"
        assert segments[1]['text'] == "Second Paragraph"
        assert segments[0]['page'] == 1
        assert segments[0]['bbox'] == [10, 10, 100, 20]

def test_extract_sentences_empty(mocker):
    """Test handling of empty PDF pages."""
    mock_doc = MagicMock()
    mock_page = MagicMock()
    mock_page.get_text.return_value = {"blocks": []}
    mock_doc.__iter__.return_value = [mock_page]
    
    with patch('fitz.open', return_value=mock_doc):
        segments = extract_sentences_with_coordinates("dummy.pdf")
        assert len(segments) == 0
