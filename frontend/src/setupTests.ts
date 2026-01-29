import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'mock-url'),
});

// Mock ResizeObserver
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock Audio
class AudioMock {
    src: string;
    playbackRate: number;
    currentTime: number;
    paused: boolean;
    load: () => void;
    play: () => Promise<void>;
    pause: () => void;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void;

    constructor() {
        this.src = '';
        this.playbackRate = 1;
        this.currentTime = 0;
        this.paused = true;
        this.load = vi.fn();
        this.play = vi.fn().mockResolvedValue(undefined);
        this.pause = vi.fn();
        this.addEventListener = vi.fn();
        this.removeEventListener = vi.fn();
    }
}

vi.stubGlobal('Audio', AudioMock);
