// Utility functions for formatting currency, dates, and numbers

import { Currency } from '../types';

/**
 * Format a number as Korean Won (₩) with thousands separators.
 */
export function formatKRW(amount: number): string {
    return `₩${Math.round(amount).toLocaleString('ko-KR')}`;
}

/**
 * Format a number as US Dollar ($) with 2 decimal places.
 */
export function formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a price/amount by currency type.
 */
export function formatCurrency(amount: number, currency: Currency): string {
    return currency === 'KRW' ? formatKRW(amount) : formatUSD(amount);
}

/**
 * Format a percentage value to 1 decimal place.
 */
export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

/**
 * Format an ISO date string to YYYY-MM-DD.
 */
export function formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return dateStr.slice(0, 10);
}

/**
 * Format a timestamp to a human-readable local date-time string.
 */
export function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Truncate a string to maxLen characters.
 */
export function truncate(str: string, maxLen = 20): string {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Validate that a string is a valid YYYY-MM-DD date.
 */
export function isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/**
 * Validate a positive number.
 */
export function isPositiveNumber(val: number): boolean {
    return typeof val === 'number' && !isNaN(val) && val > 0;
}

/**
 * Validate a positive integer.
 */
export function isPositiveInteger(val: number): boolean {
    return isPositiveNumber(val) && Number.isInteger(val);
}
