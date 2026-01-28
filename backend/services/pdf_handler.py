import fitz  # PyMuPDF
import re

def extract_sentences_with_coordinates(file_path):
    """
    Extracts sentences from a PDF with their bounding box coordinates and page numbers.
    
    Returns:
        list[dict]: A list of segments, e.g.:
        [
            {
                "text": "Hello world.",
                "page": 1, (1-indexed)
                "bbox": [x0, y0, x1, y1] (PDF coordinates)
            },
            ...
        ]
    """
    doc = fitz.open(file_path)
    segments = []
    
    # Regex for sentence splitting (simple heuristic)
    # Matches a period, exclamation, or question mark followed by whitespace or end of string.
    sentence_end_re = re.compile(r'[.!?](\s+|$)')

    for page_num, page in enumerate(doc, start=1):
        # Extract words: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
        words = page.get_text("words")
        
        current_sentence_words = []
        
        for w in words:
            word_text = w[4]
            current_sentence_words.append(w)
            
            # Check if this word ends a sentence
            # We check if the word text itself ends with punctuation 
            # OR if we just want to accumulate. 
            # Note: get_text("words") usually separates punctuation if it can, 
            # but sometimes it sticks e.g. "end."
            
            # Simple check: does the word end with . ! ?
            if re.search(r'[.!?]$', word_text):
                # End of sentence
                segments.append(create_segment(current_sentence_words, page_num))
                current_sentence_words = []
        
        # If words remain at end of page, either append to last or flush.
        # For this PDF to Audio case, flushing per page is usually safer to avoid 
        # reading across headers/footers weirdly, although it might break span-page sentences.
        if current_sentence_words:
            segments.append(create_segment(current_sentence_words, page_num))

    return segments

def create_segment(words, page_num):
    """Creates a segment dict from a list of word tuples."""
    if not words:
        return None
        
    # Join text
    text = " ".join(w[4] for w in words)
    
    # Calculate union bbox
    # x0 is min of all x0, y0 is min of all y0, etc.
    x0 = min(w[0] for w in words)
    y0 = min(w[1] for w in words)
    x1 = max(w[2] for w in words)
    y1 = max(w[3] for w in words)
    
    return {
        "text": text,
        "page": page_num,
        "bbox": [x0, y0, x1, y1]
    }
