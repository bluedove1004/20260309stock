// SummaryCards — Portfolio summary statistics cards

import React from 'react';
import { PortfolioSummary } from '../types';
import { formatKRW, formatUSD } from '../utils/formatters';

interface SummaryCardsProps {
    summary: PortfolioSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    const cards = [
        {
            icon: '📈',
            label: '총 투자 종목',
            value: `${summary.totalItems}종목`,
            color: 'from-indigo-500/20 to-indigo-600/10',
            border: 'border-indigo-500/30',
        },
        {
            icon: '💰',
            label: '총 투자 금액 (KRW)',
            value: formatKRW(summary.totalKRW),
            sub: summary.totalUSD > 0 ? `+ ${formatUSD(summary.totalUSD)}` : undefined,
            color: 'from-violet-500/20 to-violet-600/10',
            border: 'border-violet-500/30',
        },
        {
            icon: '🏷️',
            label: '투자 분야 수',
            value: `${summary.sectorCount}개 섹터`,
            color: 'from-fuchsia-500/20 to-fuchsia-600/10',
            border: 'border-fuchsia-500/30',
        },
        {
            icon: '🏆',
            label: '최다 투자 분야',
            value: summary.topSector,
            color: 'from-amber-500/20 to-amber-600/10',
            border: 'border-amber-500/30',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`glass rounded-2xl p-5 bg-gradient-to-br ${card.color} border ${card.border} transition-all hover:scale-[1.02]`}
                >
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <div className="text-xs text-gray-400 mb-1">{card.label}</div>
                    <div className="text-lg font-bold text-white truncate">{card.value}</div>
                    {card.sub && (
                        <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
                    )}
                </div>
            ))}
        </div>
    );
};
