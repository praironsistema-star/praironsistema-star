'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Los 3 idiomas del sistema
const LOCALES = [
  { code: 'es', label: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', name: 'Português', flag: '🇧🇷' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const [current, setCurrent] = useState('es')
  const [open, setOpen] = useState(false)

  // Al cargar, leer el idioma actual desde la cookie
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1]
    if (cookie && ['es', 'en', 'pt'].includes(cookie)) {
      setCurrent(cookie)
    }
  }, [])

  function changeLocale(code: string) {
    // 1. Guardar en cookie (1 año)
    document.cookie = `locale=${code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
    setCurrent(code)
    setOpen(false)

    // 2. Guardar en base de datos si el usuario está logueado
    const token = localStorage.getItem('prairon_token')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/locale`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ locale: code }),
      }).catch(() => {
        // Si falla el servidor, la cookie igual funciona
        console.warn('No se pudo guardar locale en el servidor')
      })
    }

    // 3. Recargar la página para aplicar el nuevo idioma
    router.refresh()
  }

  const currentLocale = LOCALES.find(l => l.code === current) || LOCALES[0]

  return (
    <div style={{ position: 'relative', padding: '4px 8px' }}>

      {/* Botón principal — muestra idioma actual */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '7px 8px',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '12.5px',
          color: 'var(--text-secondary, #6b6b67)',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary, #f5f5f3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: '13px', lineHeight: 1 }}>{currentLocale.flag}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>Idioma</span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          color: '#036446',
          background: '#f0fdf4',
          padding: '1px 6px',
          borderRadius: '4px',
        }}>
          {currentLocale.label}
        </span>
        <span style={{
          fontSize: '10px',
          color: 'var(--text-tertiary, #9b9b97)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }}>▼</span>
      </button>

      {/* Dropdown con los 3 idiomas */}
      {open && (
        <>
          {/* Overlay invisible para cerrar al hacer clic afuera */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '8px',
            right: '8px',
            background: 'var(--sidebar-bg, #fff)',
            border: '0.5px solid var(--border-color, #e5e5e3)',
            borderRadius: '8px',
            padding: '4px',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '4px',
          }}>
            {LOCALES.map(locale => (
              <button
                key={locale.code}
                onClick={() => changeLocale(locale.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: current === locale.code ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  color: current === locale.code ? '#036446' : 'var(--text-secondary, #6b6b67)',
                  fontWeight: current === locale.code ? '500' : '400',
                  transition: 'background 0.1s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (current !== locale.code)
                    e.currentTarget.style.background = 'var(--bg-secondary, #f5f5f3)'
                }}
                onMouseLeave={e => {
                  if (current !== locale.code)
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: '14px' }}>{locale.flag}</span>
                <span style={{ flex: 1 }}>{locale.name}</span>
                {current === locale.code && (
                  <span style={{ fontSize: '11px', color: '#036446' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
