import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import type { Segment, ConvertResponse } from '../types';

export const useDictator = () => {
    const [apiKey, setApiKey] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [pdfUrl, setPdfUrl] = useState('');
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(new Audio());

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    // Convert PDF
    const handleConvert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post<ConvertResponse>('/convert', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setSegments(res.data.segments);
                setPdfUrl(res.data.pdf_url);
                setCurrentSegmentIndex(-1);
            } else {
                setError(res.data.error || 'Conversion unknown error');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Play a specific segment
    const playSegment = async (index: number) => {
        if (index < 0 || index >= segments.length) return;

        setCurrentSegmentIndex(index);
        setIsPlaying(true);

        const text = segments[index].text;

        try {
            const res = await axios.post('/speak',
                { text },
                { headers: { 'X-OpenAI-Key': apiKey } }
            );

            const audioUrl = res.data.audio_url;
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        } catch (err: any) {
            console.error("Audio error:", err);
            setError(err.response?.data?.error || "Failed to play audio");
            setIsPlaying(false);
        }
    };

    // Toggle Play/Pause
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (currentSegmentIndex === -1 && segments.length > 0) {
                playSegment(0);
            } else if (audioRef.current.src && audioRef.current.currentTime > 0 && !audioRef.current.ended) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                playSegment(currentSegmentIndex);
            }
        }
    };

    // Audio Event Listeners
    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => {
            if (currentSegmentIndex < segments.length - 1) {
                playSegment(currentSegmentIndex + 1);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSegmentIndex, segments, apiKey]);

    return {
        apiKey,
        setApiKey,
        file,
        handleFileChange,
        handleConvert,
        segments,
        pdfUrl,
        currentSegmentIndex,
        isPlaying,
        isLoading,
        error,
        setError,
        playSegment,
        togglePlay
    };
};
