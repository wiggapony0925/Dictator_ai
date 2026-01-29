import { useState, useRef, useEffect, useCallback } from 'react';
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
    const latestSegmentIndexRef = useRef<number>(-1);

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
        } catch (err: unknown) {
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
            clearCache();

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
    const getModel = useCallback(() => {
        if (modelStrategy === 'quality') return 'tts-1-hd';
        if (modelStrategy === 'standard') return 'tts-1';
        if (modelStrategy === 'mini') return 'gpt-4o-mini-tts';

        // Auto: "Super big pdf" -> Best model (tts-1-hd), "One page" -> Cheap/Fast (gpt-4o-mini-tts)
        // Heuristic: > 30 segments = HD, else Mini.
        return segments.length > 30 ? 'tts-1-hd' : 'gpt-4o-mini-tts';
    }, [modelStrategy, segments]);

    // --- Smart Caching & Prefetching Logic ---
    const audioCache = useRef<Map<string, string>>(new Map()); // Key -> AudioURL
    const activeRequests = useRef<Map<string, Promise<string>>>(new Map()); // Key -> Promise<AudioURL>
    const requestControllers = useRef<Map<string, AbortController>>(new Map()); // Key -> AbortController

    // Generate strict cache key based on segment and settings
    // Generate strict cache key based on segment and settings
    // NOTE: We do NOT include speed in the key anymore. We request 1.0x from backend.
    const getCacheKey = useCallback((index: number, v: string, m: string) => {
        return `${index}-${v}-${m}`;
    }, []);

    // Clear all caches (used on file change or reset)
    const clearCache = useCallback(() => {
        // Abort all pending
        requestControllers.current.forEach(ctrl => ctrl.abort());
        requestControllers.current.clear();

        // Revoke URLs to free memory
        audioCache.current.forEach(url => URL.revokeObjectURL(url));
        audioCache.current.clear();
        activeRequests.current.clear();
    }, []);

    // Fetch Audio (Cached or Network)
    const fetchAudio = useCallback(async (index: number): Promise<string> => {
        const text = segments[index].text;
        const model = getModel();
        // Use generic key (no speed)
        const key = getCacheKey(index, voice, model);

        // 1. Check Memory Cache
        if (audioCache.current.has(key)) {
            return audioCache.current.get(key)!;
        }

        // 2. Check Pending Requests (Deduplicate)
        if (activeRequests.current.has(key)) {
            return activeRequests.current.get(key)!;
        }

        // 3. Network Request
        const controller = new AbortController();
        requestControllers.current.set(key, controller);

        const promise = (async () => {
            try {
                // Request speed 1.0 ALWAYS, handle real speed client-side
                const res = await axios.post('/speak',
                    { text, voice, speed: 1.0, model },
                    {
                        headers: { 'X-OpenAI-Key': apiKey },
                        signal: controller.signal
                    }
                );

                const url = res.data.audio_url;

                // Cache Success
                audioCache.current.set(key, url);
                return url;
            } finally {
                // Cleanup Pending State
                activeRequests.current.delete(key);
                requestControllers.current.delete(key);
            }
        })();

        activeRequests.current.set(key, promise);
        return promise;
    }, [segments, voice, getModel, apiKey, getCacheKey]);

    // Cleanup cache on unmount
    useEffect(() => {
        return () => clearCache();
    }, [clearCache]);


    // Play a specific segment
    const playSegment = useCallback(async (index: number) => {
        if (index < 0 || index >= segments.length) return;

        // STOP PREVIOUS AUDIO INSTANTLY
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        setHasStartedReading(true);
        latestSegmentIndexRef.current = index; // Update intended target
        setCurrentSegmentIndex(index);
        setIsPlaying(true);

        try {
            // Fetch Current (Fast if cached/prefetched)
            const audioUrl = await fetchAudio(index);

            // STATE CHECK: Ensure user hasn't skipped/paused while loading
            // If the user clicked another segment while we were fetching this one, ABORT playback.
            if (index !== latestSegmentIndexRef.current) return;

            // Also check if user decided to pause/reset while loading
            if (!hasStartedReading && latestSegmentIndexRef.current === -1) return;

            audioRef.current.src = audioUrl;

            // Error Handler
            const errorHandler = () => {
                console.error("Audio Load Error");
                setError("Audio Error: Failed to load.");
                setIsPlaying(false);
            };
            audioRef.current.addEventListener('error', errorHandler, { once: true });

            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err: unknown) => {
                    audioRef.current.removeEventListener('error', errorHandler);
                    if (err instanceof Error && err.name !== 'AbortError') {
                        // Only report if we actually expected to be playing this segment
                        // And verify we are STILL supposed to be playing it
                        if (index === latestSegmentIndexRef.current) {
                            console.error("Playback failed:", err);
                        }
                    }
                });
            }

            // *** PREFETCH NEXT SEGMENTS ***
            // Prefetch next 2 segments to ensure buffer against network latency
            if (index + 1 < segments.length) fetchAudio(index + 1).catch(() => { });
            if (index + 2 < segments.length) fetchAudio(index + 2).catch(() => { });

        } catch (err: unknown) {
            if (axios.isCancel(err)) {
                // Ignore
            } else {
                console.error("Audio fetch error:", err);
                setError(handleApiError(err));
                setIsPlaying(false);
            }
        }
    }, [segments, fetchAudio, hasStartedReading]);


    // Toggle Play/Pause
    const togglePlay = () => {
        if (isPlaying) {
            // Just pause. The fetch, if pending, will complete and cache silently.
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

    // Instant Voice/Model Update
    useEffect(() => {
        if (isPlaying && currentSegmentIndex !== -1) {
            // Restart current segment immediately with new voice/model
            playSegment(currentSegmentIndex);
        }
    }, [voice, modelStrategy, isPlaying, currentSegmentIndex, playSegment]);

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
    }, [currentSegmentIndex, segments, apiKey, file, playSegment, speed]); // Re-bind when segment changes

    // Reset State (Remove PDF)
    const resetState = () => {
        // Stop Audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }

        // Abort any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setFile(null);
        setSegments([]);
        setPdfUrl('');
        setCurrentSegmentIndex(-1);
        setIsPlaying(false);
        setHasStartedReading(false);
        setError(null);
        setIsLoading(false);

        clearCache();

        // Reset file input if exists (cleaner way would be ref, but this works given current structure)
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return {
        apiKey, setApiKey,
        file, handleFileChange,
        handleConvert,
        resetState,
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

