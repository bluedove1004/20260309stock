// useGeminiChat — Gemini API chat hook with conversation history

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, GEMINI_API_URL, MAX_CHAT_TURNS } from '../types';
import { StockEntry } from '../types';
import { buildSystemPrompt } from '../utils/portfolio';

interface GeminiContent {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates?: {
        content?: { parts?: { text?: string }[] };
    }[];
    error?: { message: string };
}

export function useGeminiChat(entries: StockEntry[]) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    const sendMessage = useCallback(
        async (userText: string, apiKey: string) => {
            if (!userText.trim() || !apiKey) return;

            const userMsg: ChatMessage = {
                id: uuidv4(),
                role: 'user',
                text: userText.trim(),
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);
            setError(null);

            try {
                // Build conversation history (limit to MAX_CHAT_TURNS)
                const allMessages = [...messages, userMsg];
                const recentMessages = allMessages.slice(-MAX_CHAT_TURNS);

                const contents: GeminiContent[] = recentMessages.map((m) => ({
                    role: m.role,
                    parts: [{ text: m.text }],
                }));

                const systemInstruction = {
                    parts: [{ text: buildSystemPrompt(entries) }],
                };

                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents, systemInstruction }),
                });

                const data: GeminiResponse = await response.json();

                if (!response.ok) {
                    const errMsg = data.error?.message ?? `API 오류 (${response.status})`;
                    throw new Error(errMsg);
                }

                const aiText =
                    data.candidates?.[0]?.content?.parts?.[0]?.text ??
                    '응답을 받지 못했습니다.';

                const aiMsg: ChatMessage = {
                    id: uuidv4(),
                    role: 'model',
                    text: aiText,
                    timestamp: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, aiMsg]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';

                let friendlyMessage = message;
                if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
                    friendlyMessage = 'API Key가 유효하지 않습니다. 설정에서 올바른 Key를 입력해주세요.';
                } else if (message.includes('fetch') || message.includes('network')) {
                    friendlyMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
                } else if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
                    friendlyMessage = 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
                }

                setError(friendlyMessage);
                setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
            } finally {
                setIsLoading(false);
            }
        },
        [messages, entries]
    );

    return { messages, isLoading, error, sendMessage, clearChat };
}
