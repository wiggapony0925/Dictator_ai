import { renderHook, act, waitFor } from '@testing-library/react';
import { useDictator } from '../useDictator';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('useDictator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useDictator());
        expect(result.current.segments).toEqual([]);
        expect(result.current.voice).toBe('alloy');
    });

    it('should save API key to local storage', () => {
        const { result } = renderHook(() => useDictator());

        act(() => {
            result.current.setApiKey('sk-test');
        });

        expect(localStorage.getItem('openai_api_key')).toBe('sk-test');
    });

    it('should process file on selection', async () => {
        const { result } = renderHook(() => useDictator());

        // Mock success response with controlled promise to verify loading state
        let resolvePromise: any;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        (axios.post as any).mockReturnValue(promise);

        const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
        const event = {
            target: { files: [file] }
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            result.current.handleFileChange(event);
        });

        // Check loading state (should be true because promise pending)
        expect(result.current.isLoading).toBe(true);

        // Resolve
        await act(async () => {
            resolvePromise({
                data: {
                    success: true,
                    segments: [{ text: 'Hello', page: 1, bbox: [] }],
                    pdf_url: '/dummy.pdf'
                }
            });
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.segments).toHaveLength(1);
        expect(result.current.segments[0].text).toBe('Hello');
    });

    it('should handle cancel when playing segment', async () => {
        const { result } = renderHook(() => useDictator());

        // 1. Load segments
        (axios.post as any).mockResolvedValueOnce({
            data: {
                success: true,
                segments: [{ text: 'Seg1', bbox: [] }, { text: 'Seg2', bbox: [] }],
                pdf_url: '/dummy.pdf'
            }
        });

        const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
        await act(async () => {
            result.current.handleFileChange({ target: { files: [file] } } as any);
        });

        await waitFor(() => expect(result.current.segments).toHaveLength(2));

        // 2. Play Segment 0
        (axios.post as any).mockResolvedValueOnce({ data: { audio_url: 'audio1.mp3' } });

        await act(async () => {
            result.current.playSegment(0);
        });

        expect(result.current.hasStartedReading).toBe(true);

        // 3. Play Segment 1 (should abort Previous)
        (axios.post as any).mockResolvedValueOnce({ data: { audio_url: 'audio2.mp3' } });
        await act(async () => {
            result.current.playSegment(1);
        });

        // Check that axios was called 3 times (1 convert, 2 speak)
        expect(axios.post).toHaveBeenCalledTimes(3);

        // The last call should have a signal
        const lastCallArgs = (axios.post as any).mock.calls[2];
        expect(lastCallArgs[2]).toHaveProperty('signal');
    });
});
