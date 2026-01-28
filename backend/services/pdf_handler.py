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
            
            # Simple check: does the word end with . ! ?
            if re.search(r'[.!?]$', word_text):
                # End of sentence
                segments.append(create_segment(current_sentence_words, page_num))
                current_sentence_words = []
        
        if current_sentence_words:
            segments.append(create_segment(current_sentence_words, page_num))

    return segments

def create_segment(words, page_num):
    """Creates a segment dict from a list of word tuples."""
    if not words:
        return None
        
    # Join text
    text = " ".join(w[4] for w in words)
    
    # Calculate rects (one per line or just all words?)
    # A simple approach for accurate highlighting is to return ALL word rects,
    # or optimizing by merging adjacent rects on the same line.
    
    # Let's merge rects that are on the same line (roughly same y0/y1) and close in x.
    # Words format: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
    
    # Group by line_no (index 6) if available, or just use y-coordinates.
    # PyMuPDF "words" includes line_no at index 6.
    
    lines = {}
    for w in words:
        line_key = (w[5], w[6]) # block_no, line_no
        if line_key not in lines:
            lines[line_key] = []
        lines[line_key].append(w)
        
    rects = []
    for line_words in lines.values():
        # Create a union rect for this line
        x0 = min(w[0] for w in line_words)
        y0 = min(w[1] for w in line_words)
        x1 = max(w[2] for w in line_words)
        y1 = max(w[3] for w in line_words)
        rects.append([x0, y0, x1, y1])

    # Legacy union bbox (optional, for scrolling to view)
    if rects:
        union_x0 = min(r[0] for r in rects)
        union_y0 = min(r[1] for r in rects)
        union_x1 = max(r[2] for r in rects)
        union_y1 = max(r[3] for r in rects)
        bbox = [union_x0, union_y0, union_x1, union_y1]
    else:
        bbox = [0,0,0,0]
    
    return {
        "text": text,
        "page": page_num,
        "bbox": bbox, # Keep for backward compatibility/scrolling
        "rects": rects # New field for precise highlighting
    }
