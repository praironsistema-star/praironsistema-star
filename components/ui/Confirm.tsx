'use client'
import { useState } from 'react'

type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void
}

let openConfirmFn: ((opts: ConfirmOptions) => Promise<boolean>) | null = null

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (openConfirmFn) return openConfirmFn(opts)
  return Promise.resolve(false)
}

export function ConfirmProvider() {
  const [state, setState] = useState<ConfirmState | null>(null)

  if (typeof window !== 'undefined') {
    openConfirmFn = (opts) => {
      return new Promise((resolve) => {
        setState({ ...opts, resolve })
      })
    }
  }

  function handleConfirm() {
    state?.resolve(true)
    setState(null)
  }

  function handleCancel() {
    state?.resolve(false)
    setState(null)
  }

  if (!state) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(26,26,24,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Figtree, system-ui, sans-serif',
      animation: 'confirm-bg .15s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px',
        width: '100%', maxWidth: '400px',
        border: '0.5px solid #e5e5e3',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        animation: 'confirm-in .2s ease',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', marginBottom: '16px',
          background: state.danger ? '#fef2f2' : '#e8f5ef',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>
          {state.danger ? '⚠️' : '?'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a18', marginBottom: '8px' }}>
          {state.title || (state.danger ? 'Confirmar eliminación' : 'Confirmar acción')}
        </div>
        <div style={{ fontSize: '13px', color: '#6b6b67', lineHeight: 1.6, marginBottom: '24px' }}>
          {state.message}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCancel} style={{
            flex: 1, height: '40px', border: '0.5px solid #e5e5e3', borderRadius: '8px',
            background: 'transparent', fontSize: '13px', color: '#6b6b67',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {state.cancelText || 'Cancelar'}
          </button>
          <button onClick={handleConfirm} style={{
            flex: 1, height: '40px', border: 'none', borderRadius: '8px',
            background: state.danger ? '#dc2626' : '#036446',
            fontSize: '13px', color: 'white', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {state.confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes confirm-bg{from{opacity:0}to{opacity:1}}
        @keyframes confirm-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  )
}
