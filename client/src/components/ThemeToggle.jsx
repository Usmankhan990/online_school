import { useState, useEffect } from 'react';

export function getStoredTheme() {
  return localStorage.getItem('theme') || 'light';
}

export function setStoredTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}

export function toggleStoredTheme() {
  const current = getStoredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setStoredTheme(next);
  return next;
}

export default function ThemeToggle({ className = '', style = {} }) {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    const handler = (e) => {
      setTheme(e.detail?.theme || getStoredTheme());
    };
    window.addEventListener('theme-changed', handler);
    return () => window.removeEventListener('theme-changed', handler);
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggleStoredTheme()}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '9999px',
        border: '1.5px solid var(--border-light, #EBE4D5)',
        background: 'var(--bg-surface, #ffffff)',
        color: isDark ? '#FFCC4D' : 'var(--text-primary, #1C1917)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.06))',
        flexShrink: 0,
        ...style,
      }}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill="#FFCC4D" fillOpacity="0.2" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
