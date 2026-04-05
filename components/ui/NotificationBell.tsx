'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNotifications } from '@/lib/notifications'

const SEVERITY_COLORS = {
  info:    { bg: '#e8f5ef', color: '#036446', dot: '#0dac5e' },
  success: { bg: '#e8f5ef', color: '#036446', dot: '#036446' },
  warning: { bg: '#fef3e2', color: '#b45309', dot: '#f59e0b' },
  error:   { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
}

const TYPE_ICONS = {
  alert:  '◬',
  task:   '◻',
  ods:    '◉',
  system: '◎',
}

export default function NotificationBell() {
  const { notifications, connected, unreadCount, markAllRead, clearAll } = useNotifications()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead() }}
        style={{
          position: 'relative',
          width: '32px', height: '32px',
          borderRadius: '6px',
          border: '0.5px solid #e5e5e3',
          background: open ? '#e8f5ef' : '#ffffff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', color: open ? '#036446' : '#6b6b67',
        }}
        {...{title: t("common.notifications")}}
      >
        ◔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#036446', color: 'white',
            fontSize: '9px', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Indicador de conexión */}
      <span style={{
        position: 'absolute', bottom: '-2px', right: '-2px',
        width: '7px', height: '7px', borderRadius: '50%',
        background: connected ? '#0dac5e' : '#e5e5e3',
        border: '1.5px solid white',
      }} {...{title: connected ? t('common.live') : t('common.disconnected')}} />

      {/* Panel de notificaciones */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div style={{
            position: 'absolute', top: '40px', right: 0,
            width: '320px', maxHeight: '400px',
            background: '#ffffff',
            border: '0.5px solid #e5e5e3',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 50,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 14px',
              borderBottom: '0.5px solid #e5e5e3',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>
                Notificaciones
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px', color: connected ? '#036446' : '#9b9b97',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: connected ? '#0dac5e' : '#e5e5e3', display: 'inline-block' }} />
                  {connected ? t('common.live') : t('common.disconnected')}
                </span>
                {notifications.length > 0 && (
                  <button onClick={clearAll} style={{
                    fontSize: '11px', color: '#9b9b97', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '0',
                  }}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px', color: '#e5e5e3' }}>◔</div>
                  <div style={{ fontSize: '12px', color: '#9b9b97' }}>{t('common.no_notifications')}</div>
                  {connected && (
                    <div style={{ fontSize: '11px', color: '#0dac5e', marginTop: '4px' }}>
                      Escuchando en tiempo real...
                    </div>
                  )}
                </div>
              ) : (
                notifications.map((n) => {
                  const colors = SEVERITY_COLORS[n.severity] || SEVERITY_COLORS.info
                  return (
                    <div key={n.id} style={{
                      padding: '10px 14px',
                      borderBottom: '0.5px solid #f0f0ee',
                      background: n.read ? 'transparent' : '#fafaf8',
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: colors.bg, color: colors.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', flexShrink: 0,
                      }}>
                        {TYPE_ICONS[n.type] || '◎'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b6b67', lineHeight: '1.4' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9b9b97', marginTop: '3px' }}>
                          {new Date(n.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.dot, flexShrink: 0, marginTop: '4px' }} />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
