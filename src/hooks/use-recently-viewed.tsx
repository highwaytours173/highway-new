'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Lightweight client-side "recently viewed" tracker.
 *
 * Persists an ordered list of tour ids in localStorage. The most-recently
 * recorded id is first; duplicates collapse (the existing entry moves to
 * the front). Capped at `MAX_ENTRIES` to keep storage tiny.
 *
 * NOT synced across devices — this is a pure UX hint, not a data
 * dependency. The cart/wishlist providers handle their own persistence.
 */
const STORAGE_KEY = 'tourista:recently-viewed:v1';
const MAX_ENTRIES = 12;

function readStored(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function writeStored(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ENTRIES)));
  } catch {
    // ignore quota / disabled storage
  }
}

interface UseRecentlyViewedResult {
  /** Ordered list of tour ids, most recent first. */
  ids: string[];
  /** Add (or move to front) a tour id. */
  record: (id: string) => void;
  /** Clear the entire list. */
  clear: () => void;
  /** Has the hook hydrated from localStorage yet? Use this to guard render. */
  hydrated: boolean;
}

export function useRecentlyViewed(): UseRecentlyViewedResult {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readStored());
    setHydrated(true);
  }, []);

  const record = useCallback((id: string) => {
    if (!id) return;
    setIds((prev) => {
      const next = [id, ...prev.filter((existing) => existing !== id)].slice(0, MAX_ENTRIES);
      writeStored(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    writeStored([]);
  }, []);

  return { ids, record, clear, hydrated };
}
