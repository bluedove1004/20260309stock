// Unit tests for formatting utilities

import { describe, it, expect } from 'vitest';
import {
    formatKRW,
    formatUSD,
    formatCurrency,
    formatPercent,
    formatDate,
    isValidDate,
    isPositiveNumber,
    isPositiveInteger,
    truncate,
} from '../utils/formatters';

describe('formatKRW', () => {
    it('formats zero', () => {
        expect(formatKRW(0)).toBe('₩0');
    });
    it('formats a whole number with thousands separator', () => {
        expect(formatKRW(1250000)).toBe('₩1,250,000');
    });
    it('rounds fractional amounts', () => {
        expect(formatKRW(1000.7)).toBe('₩1,001');
    });
});

describe('formatUSD', () => {
    it('formats USD with 2 decimal places', () => {
        expect(formatUSD(182.5)).toBe('$182.50');
    });
    it('formats large USD with commas', () => {
        expect(formatUSD(10000)).toBe('$10,000.00');
    });
});

describe('formatCurrency', () => {
    it('delegates to formatKRW', () => {
        expect(formatCurrency(500000, 'KRW')).toBe('₩500,000');
    });
    it('delegates to formatUSD', () => {
        expect(formatCurrency(100, 'USD')).toBe('$100.00');
    });
});

describe('formatPercent', () => {
    it('formats percentage with 1 decimal', () => {
        expect(formatPercent(33.333)).toBe('33.3%');
    });
    it('formats 100%', () => {
        expect(formatPercent(100)).toBe('100.0%');
    });
});

describe('formatDate', () => {
    it('extracts YYYY-MM-DD from ISO string', () => {
        expect(formatDate('2025-01-15T09:00:00Z')).toBe('2025-01-15');
    });
    it('returns - for empty string', () => {
        expect(formatDate('')).toBe('-');
    });
});

describe('isValidDate', () => {
    it('returns true for valid date', () => {
        expect(isValidDate('2025-03-09')).toBe(true);
    });
    it('returns false for invalid format', () => {
        expect(isValidDate('09/03/2025')).toBe(false);
    });
    it('returns false for empty string', () => {
        expect(isValidDate('')).toBe(false);
    });
});

describe('isPositiveNumber', () => {
    it('returns true for positive float', () => {
        expect(isPositiveNumber(0.01)).toBe(true);
    });
    it('returns false for zero', () => {
        expect(isPositiveNumber(0)).toBe(false);
    });
    it('returns false for negative', () => {
        expect(isPositiveNumber(-5)).toBe(false);
    });
    it('returns false for NaN', () => {
        expect(isPositiveNumber(NaN)).toBe(false);
    });
});

describe('isPositiveInteger', () => {
    it('returns true for 1', () => {
        expect(isPositiveInteger(1)).toBe(true);
    });
    it('returns false for float', () => {
        expect(isPositiveInteger(1.5)).toBe(false);
    });
    it('returns false for 0', () => {
        expect(isPositiveInteger(0)).toBe(false);
    });
});

describe('truncate', () => {
    it('does not truncate short strings', () => {
        expect(truncate('Hello', 20)).toBe('Hello');
    });
    it('truncates long strings', () => {
        const result = truncate('abcdefghijklmnopqrstuvwxyz', 10);
        expect(result).toBe('abcdefghij…');
    });
    it('returns empty for empty string', () => {
        expect(truncate('')).toBe('');
    });
});
