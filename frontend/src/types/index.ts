export interface Segment {
    id: number;
    text: string;
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
