// Toast — Stack of toast notification messages

import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const ICONS: Record<ToastMessage['type'], string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
};

const BG: Record<ToastMessage['type'], string> = {
    success: 'bg-emerald-500/20 border-emerald-500/40',
    error: 'bg-red-500/20 border-red-500/40',
    info: 'bg-indigo-500/20 border-indigo-500/40',
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
    toast,
    onRemove,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div
            className={`pointer-events-auto toast-enter glass border ${BG[toast.type]} rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl min-w-72 max-w-sm`}
        >
            <span className="text-lg">{ICONS[toast.type]}</span>
            <span className="text-sm text-gray-100 flex-1">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-white transition-colors ml-1"
                aria-label="닫기"
            >
                ✕
            </button>
        </div>
    );
};
