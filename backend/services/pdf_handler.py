import fitz  # PyMuPDF


def extract_sentences_with_coordinates(file_path):
    """
    Extracts text segments (paragraphs/blocks) from a PDF.
    
    Returns:
        list[dict]: A list of segments, e.g.:
        [
            {
                "text": "Paragraph content...",
                "page": 1, (1-indexed)
                "bbox": [x0, y0, x1, y1],
                "rects": [[x0, y0, x1, y1], ...] # Line bboxes
            },
            ...
        ]
    """
    doc = fitz.open(file_path)
    segments = []

    for page_num, page in enumerate(doc, start=1):
        # "dict" format gives us the structure: block -> lines -> spans
        blocks = page.get_text("dict")["blocks"]
        
        for block in blocks:
            if block["type"] == 0:  # Text block (0 = text, 1 = image)
                segment_text_parts = []
                segment_rects = []
                
                # Iterate lines in block to build text and get line rects
                for line in block["lines"]:
                    # Add line bbox (rect) for highlighting
                    segment_rects.append(line["bbox"])
                    
                    # Build text from spans
                    line_text = "".join([span["text"] for span in line["spans"]])
                    segment_text_parts.append(line_text)
                
                # Join lines with space to form paragraph text
                segment_text = " ".join(segment_text_parts).strip()
                
                if segment_text:
                     # Calculate union bbox for compatibility scrolling
                    if segment_rects:
                        x0 = min(r[0] for r in segment_rects)
                        y0 = min(r[1] for r in segment_rects)
                        x1 = max(r[2] for r in segment_rects)
                        y1 = max(r[3] for r in segment_rects)
                        bbox = [x0, y0, x1, y1]
                    else:
                        bbox = [0,0,0,0]

                    segments.append({
                        "text": segment_text,
                        "page": page_num,
                        "bbox": bbox, 
                        "rects": segment_rects 
                    })
                    
    return segments


