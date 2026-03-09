// Central type definitions for the Stock Portfolio App

export type Currency = 'KRW' | 'USD';

export interface StockEntry {
    id: string;
    sector: string;
    ticker: string;
    buyDate: string;       // ISO 날짜 (YYYY-MM-DD)
    buyPrice: number;
    currency: Currency;
    quantity: number;
    memo?: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: string;
}

export interface SectorSummary {
    sector: string;
    totalKRW: number;
    totalUSD: number;
    count: number;
    percentage: number;
}

export interface PortfolioSummary {
    totalItems: number;
    totalKRW: number;
    totalUSD: number;
    sectorCount: number;
    topSector: string;
    sectors: SectorSummary[];
}

export type SortField =
    | 'sector'
    | 'ticker'
    | 'buyDate'
    | 'buyPrice'
    | 'quantity'
    | 'total'
    | 'percentage';

export type SortDirection = 'asc' | 'desc';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export const SECTORS = [
    'IT',
    '금융',
    '헬스케어',
    '에너지',
    '소비재',
    '산업재',
    '통신',
    '부동산',
    '소재',
    '유틸리티',
    '기타',
] as const;

export const STORAGE_KEYS = {
    ENTRIES: 'stockbook_entries',
    API_KEY: 'stockbook_apikey',
} as const;

export const GEMINI_MODEL = 'gemini-1.5-flash';
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;
export const MAX_CHAT_TURNS = 20;
