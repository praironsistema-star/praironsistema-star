'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useI18n } from '@/lib/i18n'

type Result = { id: string; label: string; sub: string; href: string; icon: string }

export default function GlobalSearch() {
  const router = useRouter()
  const { t } = useI18n()
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [sel,     setSel]     = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<any>(null)

  // Abrir con ⌘K o Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus al abrir
  useEffect(() => {
    if (open) {
      setQuery(''); setResults([]); setSel(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Buscar con debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`)
        setResults(res.data || [])
        setSel(0)
      } catch {
        // Si no hay endpoint de search, mostramos links rápidos
        setResults([])
      } finally { setLoading(false) }
    }, 300)
  }, [query])

  // Navegación con teclado
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[sel]) { router.push(results[sel].href); setOpen(false) }
  }

  // Links rápidos cuando no hay búsqueda
  const quickLinks: Result[] = [
    { id: 'q1', label: t('nav.dashboard'),  sub: t('nav.dashboard'),   href: '/dashboard',   icon: '📊' },
    { id: 'q2', label: t('nav.farms'),      sub: t('nav.farms'),        href: '/farms',       icon: '🗺️' },
    { id: 'q3', label: t('nav.animals'),    sub: t('nav.animals'),      href: '/animals',     icon: '🐄' },
    { id: 'q4', label: t('nav.tasks'),      sub: t('nav.tasks'),        href: '/tasks',       icon: '✅' },
    { id: 'q5', label: t('nav.inventory'),  sub: t('nav.inventory'),    href: '/inventory',   icon: '📦' },
    { id: 'q6', label: t('nav.alerts'),     sub: t('nav.alerts'),       href: '/alerts',      icon: '🔔' },
    { id: 'q7', label: t('nav.reports'),    sub: t('nav.reports'),      href: '/reports',     icon: '📄' },
    { id: 'q8', label: t('nav.settings'),   sub: t('nav.settings'),     href: '/settings',    icon: '⚙️' },
  ]

  const shown = query.trim() ? results : quickLinks

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9997,
        background: 'rgba(26,26,24,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '80px', fontFamily: 'Figtree, system-ui, sans-serif',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px', margin: '0 20px',
          background: '#fff', borderRadius: '14px',
          border: '0.5px solid #e5e5e3',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '0.5px solid #f0f0ee' }}>
          <span style={{ fontSize: '16px', color: '#9b9b97' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            {...{placeholder: t("common.search_placeholder")}}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#1a1a18', background: 'transparent', fontFamily: 'inherit' }}
          />
          {loading && <span style={{ fontSize: '11px', color: '#9b9b97' }}>{t('common.searching')}</span>}
          <kbd style={{ fontSize: '10px', padding: '2px 6px', background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '4px', color: '#9b9b97' }}>ESC</kbd>
        </div>

        {/* Resultados */}
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {!query.trim() && (
            <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: '600', color: '#9b9b97', letterSpacing: '.06em' }}>
              ACCESOS RÁPIDOS
            </div>
          )}
          {query.trim() && results.length === 0 && !loading && (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9b9b97' }}>
              {t('common.no_results')} "{query}"
            </div>
          )}
          {shown.map((r, i) => (
            <div
              key={r.id}
              onClick={() => { router.push(r.href); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px', cursor: 'pointer',
                background: i === sel ? '#e8f5ef' : 'transparent',
                borderLeft: i === sel ? '2px solid #036446' : '2px solid transparent',
                transition: 'all .1s',
              }}
              onMouseEnter={() => setSel(i)}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{r.label}</div>
                <div style={{ fontSize: '11px', color: '#9b9b97', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
              </div>
              <span style={{ fontSize: '11px', color: '#9b9b97' }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '0.5px solid #f0f0ee', display: 'flex', gap: '12px', fontSize: '10px', color: '#9b9b97' }}>
          <span>↑↓ navegar</span>
          <span>↵ {t('common.open')}</span>
          <span>ESC {t('common.close_esc')}</span>
          <span style={{ marginLeft: 'auto' }}>{t('common.open_cmd')}</span>
        </div>
      </div>
    </div>
  )
}
