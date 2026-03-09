// Portfolio aggregate calculation utilities

import { StockEntry, PortfolioSummary, SectorSummary } from '../types';

// Approximate KRW/USD conversion for display aggregation (user-set rate)
const USD_TO_KRW_RATE = 1350;

/**
 * Convert any entry's total value to KRW equivalent for aggregation.
 */
export function toKRWEquivalent(price: number, quantity: number, currency: 'KRW' | 'USD'): number {
    const total = price * quantity;
    return currency === 'USD' ? total * USD_TO_KRW_RATE : total;
}

/**
 * Compute total investment per entry.
 */
export function entryTotal(entry: StockEntry): number {
    return entry.buyPrice * entry.quantity;
}

/**
 * Compute the KRW-equivalent total for an entry (used for percentage calculations).
 */
export function entryKRWEquivalent(entry: StockEntry): number {
    return toKRWEquivalent(entry.buyPrice, entry.quantity, entry.currency);
}

/**
 * Aggregate entries into a full PortfolioSummary.
 */
export function computePortfolioSummary(entries: StockEntry[]): PortfolioSummary {
    if (entries.length === 0) {
        return {
            totalItems: 0,
            totalKRW: 0,
            totalUSD: 0,
            sectorCount: 0,
            topSector: '-',
            sectors: [],
        };
    }

    const totalKRWEquiv = entries.reduce((sum, e) => sum + entryKRWEquivalent(e), 0);

    // Sector grouping
    const sectorMap = new Map<string, { krwEquiv: number; count: number }>();
    for (const e of entries) {
        const existing = sectorMap.get(e.sector) ?? { krwEquiv: 0, count: 0 };
        sectorMap.set(e.sector, {
            krwEquiv: existing.krwEquiv + entryKRWEquivalent(e),
            count: existing.count + 1,
        });
    }

    const sectors: SectorSummary[] = Array.from(sectorMap.entries())
        .map(([sector, { krwEquiv, count }]) => ({
            sector,
            totalKRW: krwEquiv,
            totalUSD: 0, // display-only for chart
            count,
            percentage: totalKRWEquiv > 0 ? (krwEquiv / totalKRWEquiv) * 100 : 0,
        }))
        .sort((a, b) => b.totalKRW - a.totalKRW);

    const topSector = sectors[0]?.sector ?? '-';

    const totalKRW = entries
        .filter((e) => e.currency === 'KRW')
        .reduce((sum, e) => sum + entryTotal(e), 0);

    const totalUSD = entries
        .filter((e) => e.currency === 'USD')
        .reduce((sum, e) => sum + entryTotal(e), 0);

    return {
        totalItems: entries.length,
        totalKRW,
        totalUSD,
        sectorCount: sectorMap.size,
        topSector,
        sectors,
    };
}

/**
 * Build the system prompt text for the Gemini AI with portfolio context.
 */
export function buildSystemPrompt(entries: StockEntry[]): string {
    if (entries.length === 0) {
        return `당신은 투자 분석 및 상담 전문가 AI입니다.
현재 사용자의 포트폴리오가 비어있습니다.
사용자의 투자 질문에 답변해주세요.
답변은 한국어로, 친절하고 전문적인 어조로 제공하세요.
투자 판단의 최종 책임은 사용자 본인에게 있음을 항상 명심하세요.`;
    }

    const summary = computePortfolioSummary(entries);

    const tableRows = entries
        .map(
            (e) =>
                `| ${e.sector} | ${e.ticker} | ${e.buyDate} | ${e.currency === 'KRW' ? '₩' : '$'}${e.buyPrice.toLocaleString()} | ${e.quantity} | ${e.currency} | ${e.memo ?? ''} |`
        )
        .join('\n');

    const sectorRows = summary.sectors
        .map((s) => `| ${s.sector} | ${s.count}종목 | ${s.percentage.toFixed(1)}% |`)
        .join('\n');

    return `당신은 투자 분석 및 상담 전문가 AI입니다.
아래는 사용자의 현재 주식 포트폴리오입니다:

## 포트폴리오 요약
- 총 투자 종목 수: ${summary.totalItems}개
- 총 섹터 수: ${summary.sectorCount}개
- 가장 많이 투자한 분야: ${summary.topSector}

## 분야별 비중
| 분야 | 종목 수 | 비중 |
|------|---------|------|
${sectorRows}

## 전체 거래 내역
| 분야 | 종목 | 매수일 | 단가 | 수량 | 통화 | 메모 |
|------|------|--------|------|------|------|------|
${tableRows}

이 포트폴리오를 기반으로 사용자의 투자 질문에 답변해주세요.
답변은 한국어로, 친절하고 전문적인 어조로 제공하세요.
투자 판단의 최종 책임은 사용자 본인에게 있음을 항상 명심하세요.`;
}
