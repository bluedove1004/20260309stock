// StockForm — Add and edit stock entry form

import React, { useState, useEffect } from 'react';
import { StockEntry, SECTORS, Currency } from '../types';
import { isValidDate, isPositiveNumber, isPositiveInteger } from '../utils/formatters';

interface StockFormProps {
    editTarget: StockEntry | null;
    onSubmit: (data: Omit<StockEntry, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

const defaultForm = {
    sector: SECTORS[0],
    ticker: '',
    buyDate: new Date().toISOString().slice(0, 10),
    buyPrice: '',
    currency: 'KRW' as Currency,
    quantity: '',
    memo: '',
};

export const StockForm: React.FC<StockFormProps> = ({
    editTarget,
    onSubmit,
    onCancel,
}) => {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editTarget) {
            setForm({
                sector: editTarget.sector,
                ticker: editTarget.ticker,
                buyDate: editTarget.buyDate,
                buyPrice: String(editTarget.buyPrice),
                currency: editTarget.currency,
                quantity: String(editTarget.quantity),
                memo: editTarget.memo ?? '',
            });
        } else {
            setForm(defaultForm);
        }
        setErrors({});
    }, [editTarget]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.sector.trim()) newErrors.sector = '분야를 선택하세요.';
        if (!form.ticker.trim()) newErrors.ticker = '종목명을 입력하세요.';
        if (!isValidDate(form.buyDate)) newErrors.buyDate = '유효한 날짜를 입력하세요.';
        const price = parseFloat(form.buyPrice);
        if (!isPositiveNumber(price)) newErrors.buyPrice = '양수 단가를 입력하세요.';
        const qty = parseInt(form.quantity, 10);
        if (!isPositiveInteger(qty)) newErrors.quantity = '양의 정수를 입력하세요.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            sector: form.sector.trim(),
            ticker: form.ticker.trim(),
            buyDate: form.buyDate,
            buyPrice: parseFloat(form.buyPrice),
            currency: form.currency,
            quantity: parseInt(form.quantity, 10),
            memo: form.memo.trim() || undefined,
        });
        if (!editTarget) setForm(defaultForm);
    };

    const field = (key: string) => ({
        value: form[key as keyof typeof form] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value })),
    });

    const inputCls = (err?: string) =>
        `w-full glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-600 transition-all ${err ? 'border-red-500/60 ring-1 ring-red-500/30' : ''
        }`;

    return (
        <div className="glass rounded-2xl p-6 fade-in">
            <h2 className="text-lg font-bold gradient-text mb-5">
                {editTarget ? '✏️ 거래 수정' : '➕ 새 거래 입력'}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sector */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">분야 *</label>
                        <select
                            id="form-sector"
                            {...field('sector')}
                            className={inputCls(errors.sector) + ' cursor-pointer bg-gray-900'}
                        >
                            {SECTORS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                            <option value="직접입력">직접입력</option>
                        </select>
                        {errors.sector && <p className="text-xs text-red-400 mt-1">{errors.sector}</p>}
                    </div>

                    {/* Ticker */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">종목명/코드 *</label>
                        <input
                            id="form-ticker"
                            type="text"
                            {...field('ticker')}
                            placeholder="예: 삼성전자, AAPL"
                            className={inputCls(errors.ticker)}
                        />
                        {errors.ticker && <p className="text-xs text-red-400 mt-1">{errors.ticker}</p>}
                    </div>

                    {/* Buy Date */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">매수일 *</label>
                        <input
                            id="form-buy-date"
                            type="date"
                            {...field('buyDate')}
                            className={inputCls(errors.buyDate) + ' [color-scheme:dark]'}
                        />
                        {errors.buyDate && <p className="text-xs text-red-400 mt-1">{errors.buyDate}</p>}
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">통화</label>
                        <div className="flex gap-2">
                            {(['KRW', 'USD'] as Currency[]).map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, currency: c }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.currency === c
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'glass border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    {c === 'KRW' ? '₩ KRW' : '$ USD'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buy Price */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                            매수 단가 ({form.currency === 'KRW' ? '₩' : '$'}) *
                        </label>
                        <input
                            id="form-buy-price"
                            type="number"
                            {...field('buyPrice')}
                            min="0.01"
                            step="0.01"
                            placeholder={form.currency === 'KRW' ? '예: 75000' : '예: 182.5'}
                            className={inputCls(errors.buyPrice)}
                        />
                        {errors.buyPrice && <p className="text-xs text-red-400 mt-1">{errors.buyPrice}</p>}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">수량 *</label>
                        <input
                            id="form-quantity"
                            type="number"
                            {...field('quantity')}
                            min="1"
                            step="1"
                            placeholder="예: 10"
                            className={inputCls(errors.quantity)}
                        />
                        {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
                    </div>

                    {/* Memo */}
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">메모 (선택)</label>
                        <textarea
                            id="form-memo"
                            {...field('memo')}
                            rows={2}
                            placeholder="투자 이유, 목표 등 자유롭게 메모..."
                            className={inputCls() + ' resize-none'}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        id="form-submit"
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all glow-indigo text-sm"
                    >
                        {editTarget ? '수정 완료' : '등록하기'}
                    </button>
                    {editTarget && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl glass border border-gray-700 hover:border-gray-500 text-gray-300 font-medium transition-all text-sm"
                        >
                            취소
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
