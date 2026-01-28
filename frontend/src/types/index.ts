export interface Segment {
    id: number;
    text: string;
    page: number;
    bbox: [number, number, number, number]; // [x0, y0, x1, y1] from PyMuPDF
    rects: [number, number, number, number][]; // List of rects for multi-line support
}

export interface ConvertResponse {
    success: boolean;
    pdf_url: string;
    segments: Segment[];
    error?: string;
}

export interface SpeakResponse {
    audio_url?: string;
    error?: string;
}
