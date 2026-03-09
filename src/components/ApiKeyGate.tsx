// ApiKeyGate — API Key setup modal/panel

import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../types';

interface ApiKeyGateProps {
    onKeyChange: (key: string) => void;
    currentKey: string;
    inline?: boolean;
}

export const ApiKeyGate: React.FC<ApiKeyGateProps> = ({
    onKeyChange,
    currentKey,
    inline = false,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
        onKeyChange(trimmed);
        setInputValue('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        onKeyChange('');
        setInputValue('');
    };

    const maskedKey = currentKey
        ? currentKey.slice(0, 8) + '••••••••••••••••••••' + currentKey.slice(-4)
        : '';

    if (inline) {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Gemini API Key</label>
                    {currentKey ? (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 glass rounded-xl px-4 py-2.5 font-mono text-sm text-emerald-400 border border-emerald-500/30">
                                {maskedKey}
                            </div>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all"
                            >
                                초기화
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    id="api-key-input"
                                    type={showKey ? 'text' : 'password'}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    placeholder="AIza..."
                                    className="w-full glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-600 font-mono pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                                >
                                    {showKey ? '숨김' : '표시'}
                                </button>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!inputValue.trim()}
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                            >
                                {saved ? '저장됨 ✓' : '저장'}
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-gray-600 mt-1.5">
                        API Key는 브라우저 localStorage에만 저장되며 외부로 전송되지 않습니다.
                    </p>
                </div>
            </div>
        );
    }

    // Full-screen modal variant for first visit
    return (
        <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                        🤖
                    </div>
                    <h2 className="text-2xl font-bold gradient-text mb-2">AI 상담 설정</h2>
                    <p className="text-gray-400 text-sm">
                        Gemini AI 투자 상담을 위해 API Key를 입력해주세요.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            id="api-key-modal-input"
                            type={showKey ? 'text' : 'password'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            placeholder="AIza..."
                            className="w-full glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-600 font-mono pr-16"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                        >
                            {showKey ? '숨김' : '표시'}
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!inputValue.trim()}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all glow-indigo"
                    >
                        저장하고 시작하기
                    </button>

                    <p className="text-xs text-gray-600 text-center">
                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                        >
                            Google AI Studio
                        </a>
                        에서 무료 API Key를 발급받을 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};
