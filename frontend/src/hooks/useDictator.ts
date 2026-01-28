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

    // Settings State
    const [voice, setVoice] = useState('alloy');
    const [speed, setSpeed] = useState(1.0);
    const [modelStrategy, setModelStrategy] = useState<'auto' | 'quality' | 'standard' | 'mini'>('auto');

    const audioRef = useRef<HTMLAudioElement>(new Audio());

    // Load Settings from LocalStorage
    useEffect(() => {
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) setApiKey(storedKey);

        const storedVoice = localStorage.getItem('dictator_voice');
        if (storedVoice) setVoice(storedVoice);

        const storedSpeed = localStorage.getItem('dictator_speed');
        if (storedSpeed) setSpeed(parseFloat(storedSpeed));
    }, []);

    // Save Settings when changed
    useEffect(() => {
        if (apiKey) localStorage.setItem('openai_api_key', apiKey);
    }, [apiKey]);

    useEffect(() => {
        localStorage.setItem('dictator_voice', voice);
    }, [voice]);

    useEffect(() => {
        localStorage.setItem('dictator_speed', speed.toString());
    }, [speed]);


    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Immediate Preview
            const objectUrl = URL.createObjectURL(selectedFile);
            setPdfUrl(objectUrl);

            // Reset state
            setSegments([]);
            setCurrentSegmentIndex(-1);
            setError(null);
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
                // We keep the local object URL preview, or use the one from backend if needed.
                // But backend URL maps to /uploads which might be cleaner.
                // However, objectURL is instant. Let's switch to server URL if returned to ensure consistency?
                // Actually, let's keep objectURL for speed, unless backend processed it differently.
                // But backend returns "pdf_url": f"/uploads/{filename}".
                // Let's stick with objectURL for "instant" feel, or update it silently.
                setPdfUrl(res.data.pdf_url); // Switch to served URL to ensure we are viewing what backend has
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

    // Logic to determine model based on strategy and file size/segment count
    const getModel = () => {
        if (modelStrategy === 'quality') return 'tts-1-hd';
        if (modelStrategy === 'standard') return 'tts-1';
        if (modelStrategy === 'mini') return 'gpt-4o-mini-tts';

        // Auto: "Super big pdf" -> Best model (tts-1-hd), "One page" -> Cheap/Fast (gpt-4o-mini-tts)
        // Heuristic: > 30 segments = HD, else Mini.
        return segments.length > 30 ? 'tts-1-hd' : 'gpt-4o-mini-tts';
    };

    // Play a specific segment
    const playSegment = async (index: number) => {
        if (index < 0 || index >= segments.length) return;

        setCurrentSegmentIndex(index);
        setIsPlaying(true);

        const text = segments[index].text;
        const model = getModel();

        try {
            const res = await axios.post('/speak',
                { text, voice, speed, model },
                { headers: { 'X-OpenAI-Key': apiKey } }
            );

            const audioUrl = res.data.audio_url;
            audioRef.current.src = audioUrl;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error("Playback failed:", err);
                    setIsPlaying(false);
                });
            }
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

    // Audio Event Listeners (Ended & Media Session)
    useEffect(() => {
        const audio = audioRef.current;

        // Update playback rate dynamically if audio is playing but source didn't change (HTML5 feature)
        // Note: OpenAI speed is baked in, so this is just client-side fine tuning if needed, 
        // but usually we rely on the baked file. 
        // Let's rely on OpenAI baked speed for quality, as `audio.playbackRate` alters pitch sometimes.

        const handleEnded = () => {
            if (currentSegmentIndex < segments.length - 1) {
                playSegment(currentSegmentIndex + 1);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('ended', handleEnded);

        // --- Media Session API Integration ---
        if ('mediaSession' in navigator && currentSegmentIndex !== -1 && segments.length > 0) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Segment ${currentSegmentIndex + 1} of ${segments.length}`,
                artist: 'Dictator AI',
                album: file ? file.name : 'Document Reader',
            });

            navigator.mediaSession.setActionHandler('play', () => { if (audio.paused) { audio.play(); setIsPlaying(true); } });
            navigator.mediaSession.setActionHandler('pause', () => { if (!audio.paused) { audio.pause(); setIsPlaying(false); } });
            navigator.mediaSession.setActionHandler('previoustrack', () => { if (currentSegmentIndex > 0) playSegment(currentSegmentIndex - 1); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { if (currentSegmentIndex < segments.length - 1) playSegment(currentSegmentIndex + 1); });
        }

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSegmentIndex, segments, apiKey, file]); // Re-bind when segment changes

    return {
        apiKey, setApiKey,
        file, handleFileChange,
        handleConvert,
        segments, pdfUrl,
        currentSegmentIndex,
        isPlaying,
        isLoading,
        error, setError,
        playSegment, togglePlay,
        // Settings exports
        voice, setVoice,
        speed, setSpeed,
        modelStrategy, setModelStrategy
    };
};
