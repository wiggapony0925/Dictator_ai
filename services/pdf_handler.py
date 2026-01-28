from pypdf import PdfReader
import re

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file.
    Args:
        file_path (str): Path to the PDF file.
    Returns:
        str: Extracted text.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Simple cleaning
        # join hyphenated words at line breaks
        text = re.sub(r'-\n', '', text)
        # replace multiple newlines with single newline
        text = re.sub(r'\n+', '\n', text)
        # remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        if not text:
            raise ValueError("No text could be extracted from this PDF.")
            
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        raise e
