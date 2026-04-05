'use client'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
type Toast = { id: number; message: string; type: ToastType }

let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  if (addToastFn) addToastFn(message, type)
}
export const toastSuccess = (m: string) => toast(m, 'success')
export const toastError   = (m: string) => toast(m, 'error')
export const toastInfo    = (m: string) => toast(m, 'info')
export const toastWarning = (m: string) => toast(m, 'warning')

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }

    // Escucha el evento que lanza api.ts cuando el JWT expira
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.message && detail?.type) {
        addToastFn?.(detail.message, detail.type)
      }
    }
    window.addEventListener('prairon:toast', handler)
    return () => {
      addToastFn = null
      window.removeEventListener('prairon:toast', handler)
    }
  }, [])

  const colors: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
    success: { bg: '#e8f5ef', border: '#a7f3d0', icon: '✓', iconBg: '#036446' },
    error:   { bg: '#fef2f2', border: '#fecaca', icon: '✕', iconBg: '#dc2626' },
    info:    { bg: '#e6f1fb', border: '#bfdbfe', icon: 'i', iconBg: '#185fa5' },
    warning: { bg: '#fef3e2', border: '#fed7aa', icon: '!', iconBg: '#b45309' },
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: c.bg, border: `0.5px solid ${c.border}`,
            borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontFamily: 'Figtree, system-ui, sans-serif', fontSize: '13px', color: '#1a1a18',
            animation: 'toast-in .2s ease', maxWidth: '320px', minWidth: '220px',
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              background: c.iconBg, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '600',
            }}>{c.icon}</div>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <div onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ cursor: 'pointer', color: '#9b9b97', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>×</div>
          </div>
        )
      })}
      <style>{`@keyframes toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
