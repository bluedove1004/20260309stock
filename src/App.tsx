// App.tsx — Main application with tab navigation

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { StockEntry, ToastMessage } from './types';
import { STORAGE_KEYS } from './types';
import { useStockEntries } from './hooks/useStockEntries';
import { useGeminiChat } from './hooks/useGeminiChat';
import { computePortfolioSummary, entryKRWEquivalent } from './utils/portfolio';
import { ApiKeyGate } from './components/ApiKeyGate';
import { StockForm } from './components/StockForm';
import { SummaryCards } from './components/SummaryCards';
import { PortfolioTable } from './components/PortfolioTable';
import { SectorChart } from './components/SectorChart';
import { ChatPanel } from './components/ChatPanel';
import { Toast } from './components/Toast';

type Tab = 'portfolio' | 'input' | 'chat' | 'settings';

function loadApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) ?? '';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [editTarget, setEditTarget] = useState<StockEntry | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { entries, addEntry, updateEntry, deleteEntry } = useStockEntries();
  const { messages, isLoading, error, sendMessage, clearChat } = useGeminiChat(entries);

  const summary = computePortfolioSummary(entries);
  const totalKRWEquiv = entries.reduce((s, e) => s + entryKRWEquivalent(e), 0);

  // Toast helpers
  const pushToast = useCallback(
    (type: ToastMessage['type'], message: string) => {
      setToasts((prev) => [...prev, { id: uuidv4(), type, message }]);
    },
    []
  );
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Form handlers
  const handleFormSubmit = (data: Omit<StockEntry, 'id' | 'createdAt'>) => {
    if (editTarget) {
      updateEntry(editTarget.id, data);
      setEditTarget(null);
      pushToast('success', `${data.ticker} 거래 내역이 수정되었습니다.`);
    } else {
      addEntry(data);
      pushToast('success', `${data.ticker} 거래가 등록되었습니다.`);
    }
  };

  const handleEdit = (entry: StockEntry) => {
    setEditTarget(entry);
    setActiveTab('input');
  };

  const handleDelete = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    deleteEntry(id);
    pushToast('info', `${entry?.ticker ?? '항목'}이 삭제되었습니다.`);
  };

  const handleSendChat = (text: string) => {
    sendMessage(text, apiKey);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'portfolio', icon: '📊', label: '포트폴리오' },
    { id: 'input', icon: '➕', label: '거래 입력' },
    { id: 'chat', icon: '🤖', label: 'AI 상담' },
    { id: 'settings', icon: '⚙️', label: '설정' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="glass border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
              📈
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-tight">주식 가계부</h1>
              <p className="text-xs text-gray-500">Stock Portfolio Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-gray-600'}`}
              title={apiKey ? 'API Key 설정됨' : 'API Key 미설정'}
            />
            <span className="text-xs text-gray-500 hidden sm:block">
              {apiKey ? 'AI 연결됨' : 'AI 미연결'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-0">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.id === 'chat' && !apiKey}
                className={`
                  flex items-center gap-1.5 px-4 py-3 text-sm font-medium rounded-t-xl transition-all relative
                  ${activeTab === tab.id
                    ? 'text-indigo-300 bg-gray-900 border-t border-l border-r border-gray-700'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/40'
                  }
                  ${tab.id === 'chat' && !apiKey ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
                {tab.id === 'chat' && !apiKey && (
                  <span className="text-xs text-gray-600 hidden sm:block">(Key 필요)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 fade-in">
            <SummaryCards summary={summary} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PortfolioTable
                  entries={entries}
                  summary_totalKRWEquiv={totalKRWEquiv}
                  activeSector={activeSector}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSectorFilter={setActiveSector}
                />
              </div>
              {summary.sectors.length > 0 && (
                <div>
                  <SectorChart
                    sectors={summary.sectors}
                    activeSector={activeSector}
                    onSectorClick={setActiveSector}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="max-w-2xl mx-auto fade-in">
            <StockForm
              editTarget={editTarget}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditTarget(null)}
            />
            {entries.length > 0 && (
              <div className="mt-6 glass rounded-2xl p-4">
                <p className="text-xs text-gray-500 text-center">
                  등록된 거래 {entries.length}건 · 포트폴리오 탭에서 수정/삭제할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="fade-in">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              hasApiKey={!!apiKey}
              onSend={handleSendChat}
              onClear={clearChat}
            />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto fade-in">
            <div className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold gradient-text mb-1">⚙️ 설정</h2>
                <p className="text-xs text-gray-500">앱 환경설정</p>
              </div>

              <hr className="border-gray-800" />

              <ApiKeyGate
                onKeyChange={setApiKey}
                currentKey={apiKey}
                inline
              />

              <hr className="border-gray-800" />

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">데이터 관리</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 거래 내역: {entries.length}건 저장됨</p>
                  <p>• 저장 위치: 브라우저 localStorage</p>
                </div>
              </div>

              <hr className="border-gray-800" />

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">면책 고지</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  이 앱은 투자 정보를 편리하게 관리하기 위한 도구입니다.
                  AI 분석 결과를 포함한 모든 정보는 참고용이며,
                  투자 판단의 최종 책임은 사용자 본인에게 있습니다.
                  현재가 정보는 제공되지 않으며 실시간 시세와 다를 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
