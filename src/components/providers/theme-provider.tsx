'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** User-selected choice (may be 'system'). */
  theme: ThemeChoice;
  /** Concrete resolved theme that's actually applied. */
  resolvedTheme: ResolvedTheme;
  /** Persist a new choice. */
  setTheme: (next: ThemeChoice) => void;
  /** Toggle between light and dark (sets explicit choice). */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'tourista:theme';

function readSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored(): ThemeChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
    return null;
  } catch {
    return null;
  }
}

function applyToDocument(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Server-resolved appearance default — used when no localStorage value exists. */
  defaultAppearance?: 'light' | 'dark';
}

/**
 * ThemeProvider — client-side theme controller.
 *
 * Resolution order (per visit):
 *   1. `localStorage[tourista:theme]` (user override)
 *   2. `defaultAppearance` (admin setting passed in from server)
 *   3. System preference (prefers-color-scheme)
 *
 * Pairs with the FOUC-prevention script in `<head>` (see `theme-script`).
 */
export function ThemeProvider({ children, defaultAppearance }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    if (typeof window === 'undefined') return defaultAppearance ?? 'system';
    return readStored() ?? defaultAppearance ?? 'system';
  });

  const resolveTheme = useCallback(
    (choice: ThemeChoice): ResolvedTheme =>
      choice === 'system' ? readSystemTheme() : choice,
    []
  );

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  // Apply theme to document whenever the choice changes or the system theme changes.
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
  }, [theme, resolveTheme]);

  // Listen for system theme changes when in 'system' mode.
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = readSystemTheme();
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const current = prev === 'system' ? readSystemTheme() : prev;
      const next: ThemeChoice = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback — keep things rendering if used outside provider during SSR.
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => undefined,
      toggle: () => undefined,
    };
  }
  return ctx;
}

/**
 * Inline script string that resolves the theme BEFORE React hydrates,
 * preventing a flash of unstyled (wrong-theme) content. Inject inside
 * `<head>` via `<Script id="theme-init" strategy="beforeInteractive">`.
 */
export const themeInitScript = `
(function() {
  try {
    var key = '${STORAGE_KEY}';
    var stored = localStorage.getItem(key);
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved;
    if (stored === 'light' || stored === 'dark') {
      resolved = stored;
    } else if (stored === 'system' || !stored) {
      // Honor the data-default-theme attribute on <html> (set by server from agency settings)
      var fallback = document.documentElement.getAttribute('data-default-theme');
      if (fallback === 'light' || fallback === 'dark') {
        resolved = fallback;
      } else {
        resolved = systemDark ? 'dark' : 'light';
      }
    }
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
`;
