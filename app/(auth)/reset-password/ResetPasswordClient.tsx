'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// ResetPasswordClient — Paso 2 del flujo de recuperación
//
// El usuario llega desde el link del email con ?token=xxx
// Escribe su nueva contraseña y la confirmación
// Si el token es válido, la contraseña se actualiza y redirige al login
// ─────────────────────────────────────────────────────────────────────────────

export default function ResetPasswordClient() {
  const router      = useRouter()
  const params      = useSearchParams()
  const token       = params?.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  // Si no hay token en la URL, redirigimos a forgot-password
  useEffect(() => {
    if (!token) router.replace('/forgot-password')
  }, [token, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validación en el frontend antes de llamar al backend
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setDone(true)
      // Redirigimos al login después de 2.5 segundos
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(msg || 'El enlace es inválido o ya expiró. Solicita uno nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card { animation: fadein 0.4s ease; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#9b9b97', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '2px' }}>PRAIRON</div>
          <div style={{ fontSize: '10px', color: '#0dac5e', fontWeight: '500', letterSpacing: '0.06em' }}>Agroindustrial OS</div>
        </div>

        <div className="card" style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '20px', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(160deg, #e8f5ef 0%, #f9f9f7 100%)', padding: '28px 32px', borderBottom: '0.5px solid #e5e5e3' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '17px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>Nueva contraseña</div>
            <div style={{ fontSize: '13px', color: '#6b6b67' }}>Elige una contraseña segura para tu cuenta.</div>
          </div>

          <div style={{ padding: '28px 32px' }}>

            {/* Estado: contraseña cambiada exitosamente */}
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#036446', marginBottom: '6px' }}>
                    ¡Contraseña actualizada!
                  </div>
                  <div style={{ fontSize: '13px', color: '#0f6e56' }}>
                    Redirigiendo al inicio de sesión...
                  </div>
                </div>
              </div>
            ) : (
              /* Estado: formulario */
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px', lineHeight: 1.5 }}>
                    {error}
                    {error.includes('expiró') && (
                      <div style={{ marginTop: '6px' }}>
                        <a href="/forgot-password" style={{ color: '#dc2626', fontWeight: '500' }}>
                          Solicitar nuevo enlace →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.06em' }}>
                    NUEVA CONTRASEÑA
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9f9f7', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#036446'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e3'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.06em' }}>
                    CONFIRMAR CONTRASEÑA
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9f9f7', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#036446'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e3'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="/login" style={{ fontSize: '12px', color: '#9b9b97', textDecoration: 'none' }}>
                ← Volver a iniciar sesión
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#9b9b97' }}>
          PRAIRON · Agroindustrial OS · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
