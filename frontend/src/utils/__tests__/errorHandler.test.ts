import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from '../errorHandler';
import axios from 'axios';



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
