import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import type { Segment, ConvertResponse } from '../types';
import { handleApiError } from '../utils/errorHandler';

export const useDictator = () => {
    const [apiKey, setApiKey] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [pdfUrl, setPdfUrl] = useState('');
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [hasStartedReading, setHasStartedReading] = useState(false);

    // Settings State
    const [voice, setVoice] = useState('alloy');
    const [speed, setSpeed] = useState(1.0);
    const [modelStrategy, setModelStrategy] = useState<'auto' | 'quality' | 'standard' | 'mini'>('auto');

    const audioRef = useRef<HTMLAudioElement>(new Audio());
    const abortControllerRef = useRef<AbortController | null>(null);

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


    // Convert Document Logic (Reusable)
    const processFile = async (fileToProcess: File) => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', fileToProcess);

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
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle file selection & Auto-Read
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
            setHasStartedReading(false); // Reset button state
            setError(null);

            // Auto-Read Trigger
            processFile(selectedFile);
        }
    };

    // Manual Trigger (keep for reliability/retry if needed)
    const handleConvert = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            setHasStartedReading(false); // Reset if re-converting manually
            processFile(file);
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

        // CANCEL PREVIOUS REQUEST
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // STOP PREVIOUS AUDIO INSTANTLY
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // CREATE NEW CONTROLLER
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setHasStartedReading(true);
        setCurrentSegmentIndex(index);
        setIsPlaying(true);

        const text = segments[index].text;
        const model = getModel();

        try {
            const res = await axios.post('/speak',
                { text, voice, speed, model },
                {
                    headers: { 'X-OpenAI-Key': apiKey },
                    signal: controller.signal
                }
            );

            const audioUrl = res.data.audio_url;
            audioRef.current.src = audioUrl;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Playback failed:", err);
                        if (currentSegmentIndex === index) setIsPlaying(false);
                    }
                });
            }
        } catch (err: any) {
            if (axios.isCancel(err)) {
                console.log('Request cancelled for segment:', index);
            } else {
                console.error("Audio error:", err);
                setError(handleApiError(err));
                setIsPlaying(false);
            }
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

    // Instant Speed Update
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }, [speed]);

    // Instant Voice Update (Debounced)
    useEffect(() => {
        if (isPlaying && currentSegmentIndex !== -1) {
            // Restart current segment with new voice
            // Small timeout to debounce rapid changes
            const timer = setTimeout(() => {
                playSegment(currentSegmentIndex);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [voice]);

    // Audio Event Listeners (Ended & Media Session)
    useEffect(() => {
        const audio = audioRef.current;

        // Ensure speed is applied on load
        audio.playbackRate = speed;

        const handleEnded = () => {
            if (currentSegmentIndex < segments.length - 1) {
                playSegment(currentSegmentIndex + 1);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('ended', handleEnded);
        // Re-apply speed when audio starts playing (sometimes resets)
        audio.addEventListener('play', () => { audio.playbackRate = speed; });

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
        hasStartedReading,
        isLoading,
        error, setError,
        playSegment, togglePlay,
        // Settings exports
        voice, setVoice,
        speed, setSpeed,
        modelStrategy, setModelStrategy
    };
};
