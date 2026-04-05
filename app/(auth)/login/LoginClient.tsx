'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { login } from '@/lib/auth'

const NOH_MESSAGES = [
  'Bienvenido de vuelta. Tu finca te espera.',
  'Hoy es un buen día para revisar tus cultivos.',
  'Listo para gestionar tu operación?',
  'El campo no para — y tú tampoco.',
  'Tu hato y tus parcelas te necesitan.',
]

function NohSVG({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 72 88" style={{ display: 'block' }}>
      <ellipse cx="36" cy="20" rx="20" ry="20" fill="#f5c896"/>
      <rect x="14" y="4" width="44" height="18" rx="9" fill="#5a3e1b"/>
      <rect x="10" y="3" width="52" height="10" rx="5" fill="#7a5230"/>
      <rect x="6" y="8" width="12" height="6" rx="3" fill="#7a5230"/>
      <rect x="54" y="8" width="12" height="6" rx="3" fill="#7a5230"/>
      <ellipse cx="27" cy="20" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="45" cy="20" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="27" cy="20.5" rx="1.8" ry="2" fill="#2d1a06"/>
      <ellipse cx="45" cy="20.5" rx="1.8" ry="2" fill="#2d1a06"/>
      <path d="M30 28 Q36 32 42 28" stroke="#c0775a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="22" y="38" width="28" height="32" rx="6" fill="#2d6a2d"/>
      <rect x="26" y="42" width="20" height="14" rx="3" fill="#3a8a3a"/>
      <rect x="20" y="36" width="8" height="4" rx="2" fill="#f5c896"/>
      <rect x="44" y="36" width="8" height="4" rx="2" fill="#f5c896"/>
      <rect x="8" y="38" width="18" height="8" rx="4" fill="#f5c896"/>
      <circle cx="8" cy="42" r="5" fill="#f5c896"/>
      <rect x="50" y="38" width="18" height="8" rx="4" fill="#f5c896"/>
      <circle cx="68" cy="42" r="5" fill="#f5c896"/>
      <rect x="24" y="69" width="10" height="18" rx="4" fill="#5a3e1b"/>
      <rect x="38" y="69" width="10" height="18" rx="4" fill="#5a3e1b"/>
      <rect x="22" y="83" width="14" height="6" rx="3" fill="#3d2b0e"/>
      <rect x="36" y="83" width="14" height="6" rx="3" fill="#3d2b0e"/>
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Detecta si viene del registro para mostrar mensaje de bienvenida
  const registered = params?.get('registered') === '1'
  const [msgIdx] = useState(() => Math.floor(Math.random() * NOH_MESSAGES.length))
  const [floatY, setFloatY] = useState(0)
  const [typed, setTyped] = useState('')
  const fullMsg = NOH_MESSAGES[msgIdx]

  useEffect(() => {
    const t = setInterval(() => setFloatY(y => y === 0 ? -6 : 0), 1600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      setTyped(fullMsg.slice(0, i + 1))
      i++
      if (i >= fullMsg.length) clearInterval(t)
    }, 40)
    return () => clearInterval(t)
  }, [fullMsg])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const redirect = params?.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        @keyframes noh-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes noh-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes noh-blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
        .noh-eye { animation: noh-blink 4s ease-in-out infinite; transform-origin: center; }
        .login-card { animation: noh-fadein 0.4s ease; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration:'none', display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <div style={{ fontSize: '11px', color: '#9b9b97', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '2px' }}>PRAIRON</div>
            <div style={{ fontSize: '10px', color: '#0dac5e', fontWeight: '500', letterSpacing: '0.06em' }}>Agroindustrial OS</div>
          </a>
        </div>

        <div className="login-card" style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '20px', overflow: 'hidden' }}>

          <div style={{ background: 'linear-gradient(160deg, #e8f5ef 0%, #f9f9f7 100%)', padding: '32px 32px 24px', display: 'flex', gap: '20px', alignItems: 'flex-end', borderBottom: '0.5px solid #e5e5e3' }}>
            <div style={{ transform: `translateY(${floatY}px)`, transition: 'transform 1.6s ease-in-out', flexShrink: 0 }}>
              <Image src="/images/noh-idle.png" alt="NOAH" width={72} height={72} style={{objectFit:"contain"}} />
            </div>
            <div style={{ flex: 1, paddingBottom: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#036446', marginBottom: '6px' }}>NOAH</div>
              <div style={{ fontSize: '14px', color: '#1a1a18', lineHeight: 1.5, minHeight: '42px' }}>
                {typed}
                <span style={{ opacity: typed.length < fullMsg.length ? 1 : 0, transition: 'opacity 0.3s' }}>|</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px 32px 32px' }}>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>Inicia sesión</div>
            <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '24px' }}>Accede a tu operación agroindustrial</div>

            {registered && (
              <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#036446', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <div>
                  <div style={{ fontWeight: '500' }}>¡Cuenta creada exitosamente!</div>
                  <div style={{ fontSize: '12px', color: '#0f6e56', marginTop: '2px' }}>Inicia sesión con tu correo y contraseña.</div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>!</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.06em' }}>CORREO ELECTRÓNICO</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="tu@empresa.com" autoComplete="email"
                  style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9f9f7', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#036446'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e3'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.06em' }}>CONTRASEÑA</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9f9f7', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#036446'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e3'}
                />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
                {loading ? 'Ingresando...' : 'Ingresar a PRAIRON'}
              </button>
            </form>

              {/* Divisor */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'16px 0' }}>
                <div style={{ flex:1, height:'0.5px', background:'#e5e5e3' }} />
                <span style={{ fontSize:'11px', color:'#9b9b97', fontWeight:'500' }}>O continúa con</span>
                <div style={{ flex:1, height:'0.5px', background:'#e5e5e3' }} />
              </div>
              <a href="https://prairon-backend-1.onrender.com/auth/google"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', width:'100%', padding:'11px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'#fff', textDecoration:'none', fontSize:'14px', fontWeight:'500', color:'#1a1a18', cursor:'pointer', boxSizing:'border-box' }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
                </svg>
                Continuar con Google
              </a>
            <div style={{ textAlign: 'right', marginTop: '10px', marginBottom: '4px' }}>
              <a href="/forgot-password" style={{ fontSize: '12px', color: '#9b9b97', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: '#f9f9f7', borderRadius: '8px', border: '0.5px solid #e5e5e3' }}>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500' }}>DEMO</div>
              <div style={{ fontSize: '12px', color: '#6b6b67' }}>
                admin@prairon.com · Prairon2025
              </div>
              <button
                onClick={() => { setEmail('admin@prairon.com'); setPassword('Prairon2025') }}
                style={{ marginTop: '8px', fontSize: '11px', padding: '5px 12px', border: '0.5px solid #036446', borderRadius: '5px', background: 'transparent', color: '#036446', cursor: 'pointer', fontWeight: '500' }}>
                Usar credenciales demo
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="/register" style={{ fontSize: '12px', color: '#9b9b97', textDecoration: 'none' }}>
                ¿No tienes cuenta? <span style={{ color: '#036446', fontWeight: '500' }}>Regístrate</span>
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#9b9b97' }}>
          PRAIRON · Agroindustrial OS · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f9f9f7' }} />}>
      <LoginForm />
    </Suspense>
  )
}
