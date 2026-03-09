// PortfolioTable — Sortable, filterable portfolio table

import React, { useState, useMemo } from 'react';
import type { StockEntry, SortField, SortDirection } from '../types';
import {
    formatCurrency,
    formatPercent,
    formatDate,
    truncate,
} from '../utils/formatters';
import { entryTotal, entryKRWEquivalent } from '../utils/portfolio';

interface PortfolioTableProps {
    entries: StockEntry[];
    summary_totalKRWEquiv: number;
    activeSector: string | null;
    onEdit: (entry: StockEntry) => void;
    onDelete: (id: string) => void;
    onSectorFilter: (sector: string | null) => void;
}

const SortIcon: React.FC<{ field: SortField; current: SortField; dir: SortDirection }> = ({
    field,
    current,
    dir,
}) => {
    if (field !== current) return <span className="text-gray-700 ml-1">⇅</span>;
    return <span className="text-indigo-400 ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
};

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
    entries,
    summary_totalKRWEquiv,
    activeSector,
    onEdit,
    onDelete,
    onSectorFilter,
}) => {
    const [sortField, setSortField] = useState<SortField>('buyDate');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const filtered = useMemo(() => {
        let result = entries;
        if (activeSector) result = result.filter((e) => e.sector === activeSector);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((e) => e.ticker.toLowerCase().includes(q));
        }
        return result;
    }, [entries, activeSector, search]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let va: string | number = 0;
            let vb: string | number = 0;
            switch (sortField) {
                case 'sector': va = a.sector; vb = b.sector; break;
                case 'ticker': va = a.ticker; vb = b.ticker; break;
                case 'buyDate': va = a.buyDate; vb = b.buyDate; break;
                case 'buyPrice': va = a.buyPrice; vb = b.buyPrice; break;
                case 'quantity': va = a.quantity; vb = b.quantity; break;
                case 'total': va = entryKRWEquivalent(a); vb = entryKRWEquivalent(b); break;
                case 'percentage':
                    va = entryKRWEquivalent(a);
                    vb = entryKRWEquivalent(b);
                    break;
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortField, sortDir]);

    const totalFiltered = filtered.reduce((s, e) => s + entryKRWEquivalent(e), 0);

    const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-indigo-300 select-none whitespace-nowrap transition-colors';

    if (entries.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center fade-in">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">포트폴리오가 비어있습니다</h3>
                <p className="text-gray-500 text-sm">
                    첫 번째 주식을 추가해보세요! ➕ 거래 입력 탭에서 시작하세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search + Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                    <input
                        id="portfolio-search"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="종목 검색..."
                        className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-600"
                    />
                </div>
                {activeSector && (
                    <button
                        onClick={() => onSectorFilter(null)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-all"
                    >
                        <span>{activeSector}</span>
                        <span className="text-xs">✕</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className={thCls} onClick={() => handleSort('sector')}>
                                    분야 <SortIcon field="sector" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('ticker')}>
                                    종목명 <SortIcon field="ticker" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('buyDate')}>
                                    매수일 <SortIcon field="buyDate" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('buyPrice')}>
                                    단가 <SortIcon field="buyPrice" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('quantity')}>
                                    수량 <SortIcon field="quantity" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('total')}>
                                    총 매수금액 <SortIcon field="total" current={sortField} dir={sortDir} />
                                </th>
                                <th className={thCls} onClick={() => handleSort('percentage')}>
                                    비중 <SortIcon field="percentage" current={sortField} dir={sortDir} />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">메모</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {sorted.map((entry) => {
                                const total = entryTotal(entry);
                                const krwEquiv = entryKRWEquivalent(entry);
                                const pct = summary_totalKRWEquiv > 0
                                    ? (krwEquiv / summary_totalKRWEquiv) * 100
                                    : 0;
                                return (
                                    <tr
                                        key={entry.id}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => onSectorFilter(activeSector === entry.sector ? null : entry.sector)}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-600/30 text-indigo-300 hover:bg-indigo-600/35 transition-all font-medium"
                                            >
                                                {entry.sector}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-white text-sm">
                                            {entry.ticker}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm tabular-nums">
                                            {formatDate(entry.buyDate)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-sm tabular-nums">
                                            {formatCurrency(entry.buyPrice, entry.currency)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-sm tabular-nums">
                                            {entry.quantity.toLocaleString()}주
                                        </td>
                                        <td className="px-4 py-3 text-white text-sm font-medium tabular-nums">
                                            {formatCurrency(total, entry.currency)}
                                        </td>
                                        <td className="px-4 py-3 text-sm tabular-nums">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-400">{formatPercent(pct)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-32">
                                            {entry.memo ? truncate(entry.memo, 18) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => onEdit(entry)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                                    title="수정"
                                                >
                                                    ✏️
                                                </button>
                                                {deleteConfirm === entry.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => { onDelete(entry.id); setDeleteConfirm(null); }}
                                                            className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-500/30 transition-all"
                                                        >
                                                            삭제
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 rounded-lg glass border border-gray-700 text-gray-400 text-xs hover:border-gray-500 transition-all"
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(entry.id)}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                        title="삭제"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* Total row */}
                        <tfoot>
                            <tr className="border-t-2 border-gray-700 bg-gray-900/50">
                                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-300">
                                    합계 ({sorted.length}종목)
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-white tabular-nums">
                                    ≈ ₩{Math.round(totalFiltered).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-indigo-300 tabular-nums">
                                    {summary_totalKRWEquiv > 0
                                        ? formatPercent((totalFiltered / summary_totalKRWEquiv) * 100)
                                        : '-'}
                                </td>
                                <td colSpan={2} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
