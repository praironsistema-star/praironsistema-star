'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

function PraironLogo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const c = white ? '#ffffff' : '#1a5c3a'
  const a = white ? '#7ed4a0' : '#2d9e5f'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" fill={c} opacity="0.15"/>
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M14 20C14 16.686 16.686 14 20 14C23.314 14 26 16.686 26 20" stroke={a} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2.5" fill={c}/>
      <path d="M20 22.5V28" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const NOAH_MESSAGES = [
  {
    sector: 'Ganadero · Hacienda El Progreso, Córdoba',
    icon: '🐄',
    kpis: [{ label: 'Animales', value: '1,847', color: '#4ade80' }, { label: 'Leche/día', value: '1,240L', color: '#60a5fa' }, { label: 'Score ODS', value: '74/100', color: '#fbbf24' }],
    noah: 'Temperatura alta (34°C). Revisa bebederos del lote norte — 2 bovinos con signos de estrés calórico.',
  },
  {
    sector: 'Caficultor · Finca La Esperanza, Huila',
    icon: '☕',
    kpis: [{ label: 'Área', value: '45 ha', color: '#4ade80' }, { label: 'Taza', value: '84 pts', color: '#60a5fa' }, { label: 'Score ODS', value: '79/100', color: '#fbbf24' }],
    noah: 'Floración secundaria en Lote 2. Momento ideal para abono foliar. Precio NY: 2.84 USD/lb.',
  },
  {
    sector: 'Avicultor · Granja San Luis, Cundinamarca',
    icon: '🐔',
    kpis: [{ label: 'Aves', value: '24,800', color: '#4ade80' }, { label: 'FCR', value: '1.78', color: '#60a5fa' }, { label: 'Score ODS', value: '68/100', color: '#fbbf24' }],
    noah: 'Lote 3 muestra correlación entre cambio de proveedor y aumento de mortalidad. Análisis bromatológico urgente.',
  },
  {
    sector: 'Palmicultor · Agropalma Norte, Cesar',
    icon: '🌴',
    kpis: [{ label: 'Área', value: '320 ha', color: '#4ade80' }, { label: 'FFB/ha', value: '18.4', color: '#60a5fa' }, { label: 'Score ODS', value: '81/100', color: '#fbbf24' }],
    noah: 'Sector B-4 con déficit hídrico leve. Programa riego de apoyo en 72 horas para maximizar rendimiento.',
  },
]

const FEATURES = [
  { icon: '🧠', label: 'NOAH IA — asesor 24/7' },
  { icon: '🌾', label: '16 sectores agroindustriales' },
  { icon: '📴', label: 'Funciona sin internet' },
  { icon: '🔐', label: 'Datos 100% privados' },
  { icon: '📊', label: '48 módulos integrados' },
  { icon: '🌎', label: 'ES · EN · PT' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const [noahText, setNoahText] = useState('')
  const [noahIdx, setNoahIdx] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotate cards
  useEffect(() => {
    const id = setInterval(() => {
      setActiveCard(c => (c + 1) % NOAH_MESSAGES.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Typing effect for NOAH
  useEffect(() => {
    setNoahText('')
    setNoahIdx(0)
    const msg = NOAH_MESSAGES[activeCard].noah
    if (typingRef.current) clearInterval(typingRef.current)
    let i = 0
    typingRef.current = setInterval(() => {
      setNoahText(msg.slice(0, i + 1))
      i++
      if (i >= msg.length && typingRef.current) clearInterval(typingRef.current)
    }, 22)
    return () => { if (typingRef.current) clearInterval(typingRef.current) }
  }, [activeCard])

  // Scroll for nav
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const card = NOAH_MESSAGES[activeCard]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .sora{font-family:'Sora',sans-serif}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes slideRight{from{transform:translateX(-8px);opacity:0}to{transform:none;opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .glow{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(34,197,94,.2);flex-shrink:0}
        .cursor{display:inline-block;width:2px;height:11px;background:#4ade80;margin-left:1px;animation:blink 1s step-end infinite;vertical-align:middle}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #0f2d1a inset!important;-webkit-text-fill-color:#fff!important;transition:background-color 5000s ease-in-out}
        .input-field{width:100%;background:rgba(255,255,255,.06);border:0.5px solid rgba(255,255,255,.12);border-radius:10px;padding:13px 16px;font-size:14px;color:#fff;outline:none;transition:all .2s;font-family:'DM Sans',sans-serif}
        .input-field::placeholder{color:rgba(255,255,255,.28)}
        .input-field:focus{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.06);box-shadow:0 0 0 3px rgba(34,197,94,.08)}
        .btn-main{width:100%;background:#22c55e;color:#052e16;padding:14px;border-radius:10px;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-main:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 10px 28px rgba(34,197,94,.3)}
        .btn-main:active{transform:translateY(0)}
        .btn-main:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .divider{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.22);font-size:12px;margin:4px 0}
        .divider::before,.divider::after{content:'';flex:1;height:0.5px;background:rgba(255,255,255,.1)}
        .btn-oauth{width:100%;background:rgba(255,255,255,.05);border:0.5px solid rgba(255,255,255,.12);border-radius:10px;padding:12px;font-size:13px;color:rgba(255,255,255,.75);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-oauth:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2)}
        .feature-pill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:0.5px solid rgba(255,255,255,.08);border-radius:20px;padding:6px 12px;font-size:12px;color:rgba(255,255,255,.65);animation:slideRight .4s ease both}
        @media(max-width:768px){.left-panel{display:none!important}.right-panel{width:100%!important}}
        .nav-link{color:rgba(255,255,255,.65);text-decoration:none;font-size:13px;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .2s}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,.08)}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrollY > 10 ? 'rgba(13,31,20,.95)' : 'transparent',
        backdropFilter: scrollY > 10 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 10 ? '0.5px solid rgba(255,255,255,.07)' : 'none',
        transition: 'all .3s',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <PraironLogo size={26} white />
          <span className="sora" style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>PRAIRON</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link href="/" className="nav-link">← Inicio</Link>
          <Link href="/register" className="nav-link">Crear cuenta</Link>
          <Link href="/precios" className="nav-link" style={{ color: '#4ade80' }}>Ver planes</Link>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'flex', height: '100vh', background: '#080f0b' }}>

        {/* LEFT PANEL — animated preview */}
        <div className="left-panel" style={{
          width: '55%', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg,#0d2818 0%,#0a1f13 50%,#051810 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 48px 40px',
        }}>
          {/* bg glow */}
          <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(34,197,94,.06) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(26,92,58,.08) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Headline */}
          <div style={{ animation: 'fadeInUp .7s ease both', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,.1)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginBottom: '18px', border: '0.5px solid rgba(34,197,94,.22)' }}>
              <span className="glow" />Plataforma agroindustrial activa
            </div>
            <h1 className="sora" style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.05, letterSpacing: '-1.5px', color: '#fff', marginBottom: '12px' }}>
              El agro colombiano<br />ya trabaja con IA.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6, maxWidth: '380px' }}>
              NOAH conoce tu finca, tu clima y tu historial. Cada decisión, respaldada por datos.
            </p>
          </div>

          {/* LIVE DASHBOARD CARD */}
          <div style={{ animation: 'fadeInUp .9s ease both', marginBottom: '24px' }}>
            <div key={activeCard} style={{
              background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.1)',
              borderRadius: '16px', overflow: 'hidden', animation: 'cardIn .4s ease both',
            }}>
              {/* card top bar */}
              <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)' }}>app.prairon.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="glow" />
                  <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: '600' }}>NOAH activo</span>
                </div>
              </div>

              {/* greeting */}
              <div style={{ padding: '14px 16px 0', borderBottom: '0.5px solid rgba(255,255,255,.05)' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Buenos días, Carlos {card.icon}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.38)', marginTop: '2px' }}>{card.sector}</div>
                </div>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
                  {card.kpis.map(k => (
                    <div key={k.label} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid rgba(255,255,255,.07)', borderRadius: '9px', padding: '9px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: k.color, letterSpacing: '-0.5px' }}>{k.value}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.38)', marginTop: '2px' }}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOAH message with typing */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>N</div>
                  <div style={{ background: 'rgba(34,197,94,.07)', border: '0.5px solid rgba(34,197,94,.18)', borderRadius: '10px', padding: '9px 11px', flex: 1 }}>
                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#4ade80', marginBottom: '4px', letterSpacing: '.04em' }}>NOAH IA</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.75)', lineHeight: 1.55, minHeight: '32px' }}>
                      {noahText}<span className="cursor" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* card dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              {NOAH_MESSAGES.map((_, i) => (
                <div key={i} onClick={() => setActiveCard(i)} style={{
                  width: i === activeCard ? '20px' : '6px', height: '6px', borderRadius: '3px',
                  background: i === activeCard ? '#22c55e' : 'rgba(255,255,255,.18)',
                  transition: 'all .3s', cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {FEATURES.map((f, i) => (
              <div key={f.label} className="feature-pill" style={{ animationDelay: `${i * 0.07}s` }}>
                <span style={{ fontSize: '13px' }}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — login form */}
        <div className="right-panel" style={{
          width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 56px 40px', background: '#0a150e', overflowY: 'auto',
          borderLeft: '0.5px solid rgba(255,255,255,.06)',
        }}>
          <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto', animation: 'fadeInUp .8s ease both' }}>

            {/* Logo + title */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '24px' }}>
                <PraironLogo size={32} white />
                <span className="sora" style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>PRAIRON</span>
              </div>
              <h2 className="sora" style={{ fontSize: '26px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '8px' }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>
                Tu finca te espera. Ingresa para continuar.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,.5)', marginBottom: '7px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Correo electrónico</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="carlos@haciendaelprogreso.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,.5)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Contraseña</label>
                  <Link href="/forgot-password" style={{ fontSize: '12px', color: '#4ade80', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: '13px', padding: '4px' }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                className="btn-main"
                type="submit"
                disabled={loading}
                style={{ marginTop: '6px' }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(5,46,22,.3)', borderTop: '2px solid #052e16', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                    Ingresando...
                  </>
                ) : 'Ingresar a mi cuenta →'}
              </button>
            </form>

            {/* Divider + OAuth */}
            <div style={{ margin: '20px 0' }}>
              <div className="divider">o continúa con</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn-oauth">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Ingresar con Google
              </button>
            </div>

            {/* Register link */}
            <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,.38)' }}>
              ¿No tienes cuenta?{' '}
              <Link href="/register" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: '600' }}>
                Empieza gratis — 14 días
              </Link>
            </p>

            {/* Privacy note */}
            <div style={{ marginTop: '24px', padding: '10px 12px', background: 'rgba(255,255,255,.03)', border: '0.5px solid rgba(255,255,255,.06)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)', lineHeight: 1.5 }}>
                🔐 Conexión cifrada AES-256 · Tus datos son tuyos · GDPR + Habeas Data Colombia
              </div>
            </div>
          </div>

          {/* footer */}
          <div style={{ marginTop: 'auto', paddingTop: '24px', maxWidth: '360px', width: '100%', margin: '32px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {[['Privacidad', '/privacidad'], ['Términos', '/terminos'], ['Seguridad', '/seguridad'], ['Soporte', '/soporte']].map(([l, h]) => (
                <Link key={l} href={h} style={{ fontSize: '11px', color: 'rgba(255,255,255,.22)', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,.15)', marginTop: '10px' }}>© 2026 PRAIRON · Hecho en LATAM</p>
          </div>
        </div>
      </div>
    </>
  )
}
