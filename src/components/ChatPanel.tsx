import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    hasApiKey: boolean;
    onSend: (text: string) => void;
    onClear: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    isLoading,
    error,
    hasApiKey,
    onSend,
    onClear,
}) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !hasApiKey || isLoading) return;
        onSend(text);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-96">
            {/* Header */}
            <div className="glass rounded-t-2xl px-5 py-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-base">
                        🤖
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white">AI 투자 상담</div>
                        <div className="text-xs text-gray-500">Gemini 2.5 Flash</div>
                    </div>
                </div>
                <button
                    onClick={onClear}
                    disabled={messages.length === 0}
                    className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
                >
                    대화 초기화
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-950/50">
                {!hasApiKey && (
                    <div className="text-center py-12 fade-in">
                        <div className="text-4xl mb-3">🔑</div>
                        <p className="text-gray-400 text-sm">
                            AI 상담을 이용하려면 설정에서 Gemini API Key를 입력해주세요.
                        </p>
                    </div>
                )}

                {hasApiKey && messages.length === 0 && !isLoading && (
                    <div className="text-center py-12 fade-in">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-gray-400 text-sm">
                            포트폴리오에 대해 궁금한 점을 물어보세요!
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {[
                                '내 포트폴리오 분석해줘',
                                '리스크 분산이 잘 되어 있나요?',
                                '추가 투자 전략 추천해줘',
                            ].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                                    className="px-3 py-1.5 rounded-xl glass border border-gray-700 text-gray-400 text-xs hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                    >
                        {msg.role === 'model' && (
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm mr-2.5 mt-1 flex-shrink-0">
                                🤖
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'glass border border-gray-700 text-gray-200 rounded-tl-sm'
                                }`}
                        >
                            {msg.role === 'user' ? (
                                <span className="whitespace-pre-wrap">{msg.text}</span>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap break-words">
                                    {msg.text}
                                </div>
                            )}
                            <div
                                className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-600'
                                    }`}
                            >
                                {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-2.5 mt-1 flex-shrink-0">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start fade-in">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm mr-2.5 mt-1">
                            🤖
                        </div>
                        <div className="glass border border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4">
                            <div className="dot-loading">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="flex justify-start fade-in">
                        <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-sm mr-2.5 mt-1">
                            ⚠️
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-300 max-w-[80%]">
                            {error}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="glass rounded-b-2xl border-t border-gray-800 px-4 py-3">
                <div className="flex items-end gap-3">
                    <textarea
                        ref={textareaRef}
                        id="chat-input"
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={!hasApiKey || isLoading}
                        placeholder={
                            hasApiKey ? 'Enter로 전송, Shift+Enter로 줄바꿈' : 'API Key를 먼저 설정해주세요'
                        }
                        rows={1}
                        className="flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder-gray-600 text-gray-100 py-1 max-h-36 overflow-y-auto disabled:opacity-40"
                    />
                    <button
                        id="chat-send"
                        onClick={handleSend}
                        disabled={!input.trim() || !hasApiKey || isLoading}
                        className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 mb-0.5"
                        title="전송"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-700 mt-1.5">
                    ⚠️ AI 답변은 참고용이며, 투자 판단의 최종 책임은 사용자 본인에게 있습니다.
                </p>
            </div>
        </div>
    );
};
