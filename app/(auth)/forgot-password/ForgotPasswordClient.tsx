'use client'
import { useState } from 'react'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// ForgotPasswordClient — Paso 1 del flujo de recuperación
//
// El usuario escribe su email y recibe un correo con el link para resetear.
// Por seguridad el mensaje es el mismo si el email existe o no.
// ─────────────────────────────────────────────────────────────────────────────

export default function ForgotPasswordClient() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true) // Mostramos confirmación sin importar si el email existe
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔑</div>
            <div style={{ fontSize: '17px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>Recuperar contraseña</div>
            <div style={{ fontSize: '13px', color: '#6b6b67', lineHeight: 1.5 }}>
              Te enviaremos un enlace para crear una nueva contraseña.
            </div>
          </div>

          <div style={{ padding: '28px 32px' }}>

            {/* Estado: email enviado */}
            {sent ? (
              <div>
                <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📬</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#036446', marginBottom: '6px' }}>
                    Revisa tu correo
                  </div>
                  <div style={{ fontSize: '13px', color: '#0f6e56', lineHeight: 1.6 }}>
                    Si <strong>{email}</strong> está registrado, recibirás un enlace en los próximos minutos.
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#9b9b97', textAlign: 'center', marginBottom: '16px', lineHeight: 1.6 }}>
                  ¿No llegó? Revisa tu carpeta de spam o{' '}
                  <button onClick={() => setSent(false)}
                    style={{ color: '#036446', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', padding: 0 }}>
                    intenta de nuevo
                  </button>
                </div>
              </div>
            ) : (
              /* Estado: formulario */
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.06em' }}>
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="tu@empresa.com"
                    autoComplete="email"
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9f9f7', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#036446'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e3'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            )}

            {/* Link volver */}
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
