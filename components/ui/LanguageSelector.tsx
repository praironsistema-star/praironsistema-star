'use client';
import { useState } from 'react';
import { useI18n, type Locale } from '@/lib/i18n';
import api from '@/lib/api';

const LANGUAGES = [
  { code: 'es' as Locale, label: 'Español', flag: '🇨🇴' },
  { code: 'en' as Locale, label: 'English', flag: '🇺🇸' },
  { code: 'pt' as Locale, label: 'Português', flag: '🇧��' },
];

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  async function handleChange(code: Locale) {
    setLocale(code);
    setOpen(false);
    try { await api.patch('/users/locale', { preferredLocale: code }); } catch(_) {}
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)' }}>
        <span>{currentLang.flag}</span>
        <span>{currentLang.code.toUpperCase()}</span>
        <span style={{ fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 6, zIndex: 100, minWidth: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => handleChange(lang.code)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 6, background: lang.code === locale ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-primary)', fontWeight: lang.code === locale ? 600 : 400 }}>
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === locale && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
