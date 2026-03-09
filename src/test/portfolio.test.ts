// Unit tests for portfolio aggregate functions

import { describe, it, expect } from 'vitest';
import {
    entryTotal,
    entryKRWEquivalent,
    computePortfolioSummary,
} from '../utils/portfolio';
import type { StockEntry, SectorSummary } from '../types';

const makeEntry = (overrides: Partial<StockEntry> = {}): StockEntry => ({
    id: '1',
    sector: 'IT',
    ticker: 'AAPL',
    buyDate: '2025-01-01',
    buyPrice: 100,
    currency: 'KRW',
    quantity: 10,
    createdAt: new Date().toISOString(),
    ...overrides,
});

describe('entryTotal', () => {
    it('multiplies price by quantity', () => {
        const e = makeEntry({ buyPrice: 75000, quantity: 5 });
        expect(entryTotal(e)).toBe(375000);
    });
});

describe('entryKRWEquivalent', () => {
    it('returns as-is for KRW', () => {
        const e = makeEntry({ buyPrice: 50000, quantity: 2, currency: 'KRW' });
        expect(entryKRWEquivalent(e)).toBe(100000);
    });
    it('converts USD to KRW at ~1350 rate', () => {
        const e = makeEntry({ buyPrice: 100, quantity: 1, currency: 'USD' });
        expect(entryKRWEquivalent(e)).toBe(135000);
    });
});

describe('computePortfolioSummary', () => {
    it('returns zero summary for empty entries', () => {
        const s = computePortfolioSummary([]);
        expect(s.totalItems).toBe(0);
        expect(s.topSector).toBe('-');
        expect(s.sectors).toHaveLength(0);
    });

    it('aggregates single entry correctly', () => {
        const e = makeEntry({ sector: 'IT', buyPrice: 100000, quantity: 3, currency: 'KRW' });
        const s = computePortfolioSummary([e]);
        expect(s.totalItems).toBe(1);
        expect(s.totalKRW).toBe(300000);
        expect(s.sectorCount).toBe(1);
        expect(s.topSector).toBe('IT');
        expect(s.sectors[0].percentage).toBeCloseTo(100, 1);
    });

    it('computes sector percentages for two entries', () => {
        const e1 = makeEntry({ sector: 'IT', buyPrice: 100000, quantity: 1, currency: 'KRW' });
        const e2 = makeEntry({
            id: '2',
            sector: '금융',
            buyPrice: 300000,
            quantity: 1,
            currency: 'KRW',
        });
        const s = computePortfolioSummary([e1, e2]);
        expect(s.sectorCount).toBe(2);
        expect(s.topSector).toBe('금융');
        const itSector = s.sectors.find((sec: SectorSummary) => sec.sector === 'IT');
        const financeSector = s.sectors.find((sec: SectorSummary) => sec.sector === '금융');
        expect(itSector?.percentage).toBeCloseTo(25, 0);
        expect(financeSector?.percentage).toBeCloseTo(75, 0);
    });
});

/*
E2E Scenario Comments:
1. User opens app → sees empty portfolio tab with empty state message
2. User clicks "거래 입력" tab → fills form with 삼성전자, IT, ₩75,000, qty 10
3. User submits → toast appears "삼성전자 거래가 등록되었습니다."
4. Switches to portfolio tab → sees the row in table and pie chart
5. User clicks sector badge → filters table to IT only
6. User clicks edit (✏️) → redirects to input tab in edit mode
7. User changes quantity → submits → success toast "수정되었습니다."
8. User clicks delete (🗑️) → confirm buttons appear → confirms → row removed
9. User goes to settings → enters Gemini API Key → status turns green
10. User clicks AI 상담 tab → sends "내 포트폴리오 분석해줘" → receives AI response
*/
