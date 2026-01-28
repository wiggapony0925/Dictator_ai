from pypdf import PdfReader
import re

def clean_text(text):
    """
    Cleans extracted text for better TTS experience.
    """
    # Join hyphenated words (e.g. "com-\nputer")
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    # Replace newlines with spaces to avoid breaking sentences mid-flow
    text = text.replace('\n', ' ')
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_into_sentences(text):
    """
    Splits text into sentences using simple regex heuristics.
    """
    # Split on . ! ? followed by a space and an uppercase letter, or end of string.
    # This is a naive implementation but works for "simple yet effective".
    # We look for punctuation, followed by whitespace, followed by a capital letter.
    
    # We use a positive lookbehind for the punctuation and lookahead for the capital
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    
    return [s.strip() for s in sentences if s.strip()]

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file.
    Args:
        file_path (str): Path to the PDF file.
    Returns:
        str: Extracted clean text.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        if not text:
            raise ValueError("No text could be extracted from this PDF.")
            
        return clean_text(text)
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        raise e
