// SectorChart — Recharts PieChart for sector distribution

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { SectorSummary } from '../types';
import { formatPercent } from '../utils/formatters';

const COLORS = [
    '#818cf8',
    '#a78bfa',
    '#c084fc',
    '#e879f9',
    '#f472b6',
    '#fb923c',
    '#fbbf24',
    '#34d399',
    '#22d3ee',
    '#60a5fa',
    '#a3e635',
];

interface SectorChartProps {
    sectors: SectorSummary[];
    activeSector: string | null;
    onSectorClick: (sector: string | null) => void;
}

interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
}

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
}: CustomLabelProps) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {name} {formatPercent(percent * 100)}
        </text>
    );
};

export const SectorChart: React.FC<SectorChartProps> = ({
    sectors,
    activeSector,
    onSectorClick,
}) => {
    if (sectors.length === 0) return null;

    const data = sectors.map((s) => ({
        name: s.sector,
        value: s.totalKRW,
        percentage: s.percentage,
    }));

    return (
        <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">분야별 투자 비중</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        labelLine={false}
                        label={renderCustomLabel as unknown as boolean}
                        dataKey="value"
                        onClick={(entry) => {
                            const clicked = entry?.name as string;
                            onSectorClick(activeSector === clicked ? null : clicked);
                        }}
                        cursor="pointer"
                        strokeWidth={2}
                        stroke="rgba(0,0,0,0.3)"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                opacity={
                                    activeSector === null || activeSector === entry.name ? 1 : 0.35
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(17,24,39,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#f9fafb',
                            fontSize: '13px',
                        }}
                        formatter={(value: number, name: string) => [
                            `${formatPercent(
                                data.find((d) => d.name === name)?.percentage ?? 0
                            )}`,
                            name,
                        ]}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            {activeSector && (
                <div className="mt-3 text-center">
                    <button
                        onClick={() => onSectorClick(null)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                        필터 해제 ({activeSector})
                    </button>
                </div>
            )}
        </div>
    );
};
