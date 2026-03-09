// useStockEntries — CRUD hook with localStorage persistence

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StockEntry, STORAGE_KEYS } from '../types';

function loadFromStorage(): StockEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
        return raw ? (JSON.parse(raw) as StockEntry[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(entries: StockEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function useStockEntries() {
    const [entries, setEntries] = useState<StockEntry[]>(loadFromStorage);

    // Persist to localStorage on every change
    useEffect(() => {
        saveToStorage(entries);
    }, [entries]);

    const addEntry = useCallback((data: Omit<StockEntry, 'id' | 'createdAt'>) => {
        const newEntry: StockEntry = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
    }, []);

    const updateEntry = useCallback(
        (id: string, data: Omit<StockEntry, 'id' | 'createdAt'>) => {
            setEntries((prev) =>
                prev.map((e) =>
                    e.id === id ? { ...e, ...data } : e
                )
            );
        },
        []
    );

    const deleteEntry = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    return { entries, addEntry, updateEntry, deleteEntry };
}
