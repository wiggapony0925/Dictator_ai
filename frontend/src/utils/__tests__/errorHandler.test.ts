import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from '../errorHandler';
import axios from 'axios';

describe('handleApiError', () => {
    it('returns empty string if request is cancelled', () => {
        const error = { name: 'CanceledError', __CANCEL__: true }; // Rough approximation of axios cancel

        // Mock axios.isCancel to return true
        // We can't easily spy on the imported axios directly in this way without vi.mock behavior
        // But handleApiError imports axios. We can't change that behavior easily unit-wise without mocking the module.
        // Let's rely on standard object matching or mock the module.
    });

    // Actually, getting axios.isCancel to recognize the error object requires mocking the axios module.
});

// Mock axios
// We need to match the default export structure properly
vi.mock('axios', () => {
    return {
        default: {
            isCancel: vi.fn(),
            post: vi.fn(), // Mock post as well for safety
        }
    };
});

describe('handleApiError implementation', () => {
    it('returns empty string for cancelled requests', () => {
        (axios.isCancel as any).mockReturnValue(true);
        expect(handleApiError({})).toBe('');
    });

    it('returns correct message for 400', () => {
        (axios.isCancel as any).mockReturnValue(false);
        const error = { response: { status: 400, data: { error: 'Custom' } } };
        expect(handleApiError(error)).toBe('Custom');
    });

    it('returns default 401 message', () => {
        (axios.isCancel as any).mockReturnValue(false);
        const error = { response: { status: 401 } };
        expect(handleApiError(error)).toContain('Unauthorized');
    });

    it('returns network error when no response', () => {
        (axios.isCancel as any).mockReturnValue(false);
        const error = { request: {} };
        expect(handleApiError(error)).toContain('Network Error');
    });
});
