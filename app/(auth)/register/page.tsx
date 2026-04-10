'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const SECTORS = [
  { id: 'ganaderia', label: 'Ganadería', emoji: '🐄' },
  { id: 'caficultura', label: 'Caficultura', emoji: '☕' },
  { id: 'avicultura', label: 'Avicultura', emoji: '🐔' },
  { id: 'palma', label: 'Palma de aceite', emoji: '🌴' },
  { id: 'cacao', label: 'Cacao', emoji: '🍫' },
  { id: 'horticultura', label: 'Horticultura', emoji: '🥬' },
  { id: 'acuicultura', label: 'Acuicultura', emoji: '🐟' },
  { id: 'arroz', label: 'Arroz', emoji: '🌾' },
  { id: 'fruticultura', label: 'Fruticultura', emoji: '🍓' },
  { id: 'otro', label: 'Otro sector', emoji: '🌱' },
]

const BENEFITS = [
  { icon: '🤖', title: 'NOAH incluido', desc: 'IA agrícola con alertas y recomendaciones desde el día 1' },
  { icon: '📊', title: 'Dashboard completo', desc: 'KPIs, lotes, cultivos y reportes en tiempo real' },
  { icon: '🔒', title: 'Tus datos, tus reglas', desc: 'Cumplimiento GDPR y Habeas Data (Ley 1581 Colombia)' },
  { icon: '⚡', title: '14 días gratis', desc: 'Sin tarjeta de crédito. Sin permanencia. Sin trucos.' },
]

const NOAH_MESSAGES = [
  { sector: 'Ganadería 🐄', msg: 'Lote Norte · 48 bovinos · Próxima vacunación en 3 días · Peso promedio subió 2.3kg esta semana.' },
  { sector: 'Caficultura ☕', msg: 'Finca La Esperanza · Roya detectada en bloque 3 · Humedad 87% · Aplicar fungicida antes del jueves.' },
  { sector: 'Avicultura 🐔', msg: 'Galpón 2 · Conversión alimenticia 1.82 · Mortalidad 0.4% · Temperatura óptima mantenida 24h.' },
  { sector: 'Palma 🌴', msg: 'Lote 7 · Déficit hídrico moderado · Programar riego 48h · Proyección cosecha: 4.2 ton/ha.' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: datos básicos, 2: sector y finca
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noahIdx, setNoahIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    farmName: '', sector: '', country: 'Colombia', hectares: '',
  })
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // NOAH typing effect
  useEffect(() => {
    const msg = NOAH_MESSAGES[noahIdx].msg
    let i = 0
    setTyped('')
    setIsTyping(true)

    const type = () => {
      if (i <= msg.length) {
        setTyped(msg.slice(0, i))
        i++
        typingRef.current = setTimeout(type, 22)
      } else {
        setIsTyping(false)
        typingRef.current = setTimeout(() => {
          setNoahIdx(prev => (prev + 1) % NOAH_MESSAGES.length)
        }, 3500)
      }
    }
    typingRef.current = setTimeout(type, 300)
    return () => { if (typingRef.current) clearTimeout(typingRef.current) }
  }, [noahIdx])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a1a0f; --bg2: #0d1f14; --bg3: #112218; --bg4: #0f1e14;
          --green: #22c55e; --green-dim: #16a34a; --green-glow: rgba(34,197,94,0.13);
          --green-border: rgba(34,197,94,0.28); --green-text: #4ade80;
          --text: #f0fdf4; --text2: rgba(240,253,244,0.6); --text3: rgba(240,253,244,0.3);
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --font: 'DM Sans', system-ui, sans-serif; --mono: 'DM Mono', monospace;
        }
        html, body { height: 100%; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; }

        .layout { display: flex; min-height: 100vh; }

        /* LEFT PANEL */
        .left {
          width: 52%; background: var(--bg2); display: flex; flex-direction: column;
          padding: 36px 48px; position: relative; overflow: hidden;
        }
        .left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 600px 500px at 20% 80%, rgba(34,197,94,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px);
        }

        .left-nav { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 2; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark {
          width: 32px; height: 32px; background: var(--green); border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-size: 13px; color: #0a1a0f; font-weight: 500;
        }
        .logo-text { font-size: 16px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; }
        .logo-text span { color: var(--green); }
        .back-link { font-size: 13px; color: var(--text3); text-decoration: none; transition: color .2s; }
        .back-link:hover { color: var(--text2); }

        .left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 2; padding: 40px 0; }

        .left-headline { font-size: 28px; font-weight: 600; letter-spacing: -0.8px; line-height: 1.15; margin-bottom: 8px; }
        .left-headline em { font-style: normal; color: var(--green); }
        .left-sub { font-size: 14px; color: var(--text2); line-height: 1.6; margin-bottom: 32px; }

        /* BENEFITS */
        .benefits { display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
        .benefit-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
        .benefit-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .benefit-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
        .benefit-desc { font-size: 12.5px; color: var(--text2); line-height: 1.5; }

        /* NOAH CARD */
        .noah-card {
          background: rgba(34,197,94,0.05); border: 1px solid var(--green-border);
          border-radius: 14px; padding: 18px 20px;
        }
        .noah-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .noah-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .noah-label { font-size: 11px; font-family: var(--mono); color: var(--green); letter-spacing: .06em; text-transform: uppercase; }
        .noah-sector { font-size: 11px; font-family: var(--mono); color: var(--text3); margin-left: auto; }
        .noah-text { font-size: 13px; color: var(--text2); line-height: 1.6; min-height: 42px; }
        .cursor { display: inline-block; width: 2px; height: 13px; background: var(--green); margin-left: 2px; vertical-align: middle; animation: blink .8s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .noah-dots { display: flex; gap: 6px; margin-top: 12px; }
        .noah-dot-nav { width: 5px; height: 5px; border-radius: 50%; background: var(--text3); transition: background .3s, transform .3s; cursor: pointer; }
        .noah-dot-nav.active { background: var(--green); transform: scale(1.4); }

        /* RIGHT PANEL */
        .right {
          width: 48%; background: var(--bg); display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 40px 52px;
          border-left: 1px solid var(--border);
        }
        .right-inner { width: 100%; max-width: 400px; }

        .right-header { text-align: center; margin-bottom: 32px; }
        .right-title { font-size: 22px; font-weight: 600; letter-spacing: -0.5px; color: var(--text); }
        .right-sub { font-size: 14px; color: var(--text2); margin-top: 6px; line-height: 1.5; }

        /* STEPS */
        .steps-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .step-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-family: var(--mono); }
        .step-circle {
          width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid var(--border2);
          display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text3);
          transition: all .3s;
        }
        .step-circle.done { background: var(--green); border-color: var(--green); color: #0a1a0f; font-size: 10px; }
        .step-circle.active { border-color: var(--green); color: var(--green); }
        .step-label { color: var(--text3); transition: color .3s; }
        .step-label.active { color: var(--text2); }
        .step-sep { flex: 1; height: 1px; background: var(--border2); }

        /* FORM */
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 6px; font-family: var(--mono); letter-spacing: .03em; }
        .field input, .field select {
          width: 100%; background: var(--bg3, #112218); border: 1px solid var(--border2);
          border-radius: 10px; padding: 12px 14px; font-size: 14px; color: var(--text);
          font-family: var(--font); outline: none; transition: border-color .2s, box-shadow .2s;
          -webkit-appearance: none; appearance: none;
        }
        .field input:focus, .field select:focus {
          border-color: var(--green-border); box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
        }
        .field input::placeholder { color: var(--text3); }
        .field .pass-wrap { position: relative; }
        .field .pass-wrap input { padding-right: 42px; }
        .toggle-pass {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text3);
          padding: 0; transition: color .2s;
        }
        .toggle-pass:hover { color: var(--text2); }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* SECTOR GRID */
        .sector-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
        .sector-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 12px;
          border-radius: 10px; border: 1px solid var(--border2); background: var(--bg3, #112218);
          cursor: pointer; font-size: 13px; color: var(--text2); font-family: var(--font);
          transition: all .15s; text-align: left;
        }
        .sector-btn:hover { border-color: var(--green-border); color: var(--text); background: rgba(34,197,94,0.05); }
        .sector-btn.selected { border-color: var(--green); background: var(--green-glow); color: var(--text); }
        .sector-emoji { font-size: 16px; }

        /* CHECKBOX */
        .check-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
        .check-row input[type=checkbox] { margin-top: 3px; accent-color: var(--green); width: 15px; height: 15px; flex-shrink: 0; cursor: pointer; }
        .check-row label { font-size: 12.5px; color: var(--text2); line-height: 1.5; cursor: pointer; }
        .check-row a { color: var(--green); text-decoration: none; }

        /* BTN */
        .btn-submit {
          width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--green); color: #0a1a0f; font-size: 15px; font-weight: 500;
          font-family: var(--font); transition: background .2s, opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { background: #16a34a; }
        .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(10,26,15,0.3);
          border-top-color: #0a1a0f; border-radius: 50%; animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-back {
          width: 100%; padding: 11px; border-radius: 10px; border: 1px solid var(--border2);
          background: none; color: var(--text2); font-size: 14px; font-family: var(--font);
          cursor: pointer; margin-top: 10px; transition: background .2s;
        }
        .btn-back:hover { background: rgba(255,255,255,0.04); }

        .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .divider span { font-size: 12px; color: var(--text3); font-family: var(--mono); }

        .btn-google {
          width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border2);
          background: rgba(255,255,255,0.04); color: var(--text); font-size: 14px; font-family: var(--font);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background .2s;
        }
        .btn-google:hover { background: rgba(255,255,255,0.08); }

        .right-footer { text-align: center; margin-top: 22px; font-size: 13px; color: var(--text3); }
        .right-footer a { color: var(--green); text-decoration: none; }

        /* PLAN TAG */
        .plan-tag {
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px;
          background: rgba(34,197,94,0.1); border: 1px solid var(--green-border);
          border-radius: 100px; padding: 5px 12px; font-size: 12px; font-family: var(--mono); color: var(--green);
        }

        /* RESPONSIVE */
        @media (max-width: 820px) {
          .layout { flex-direction: column; }
          .left { width: 100%; padding: 28px 24px; min-height: auto; }
          .right { width: 100%; padding: 32px 24px; border-left: none; border-top: 1px solid var(--border); }
          .benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .noah-card { display: none; }
        }
        @media (max-width: 480px) {
          .benefits { grid-template-columns: 1fr; }
          .right { padding: 28px 20px; }
          .sector-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="layout">
        {/* ── LEFT PANEL ── */}
        <div className="left">
          <div className="left-grid" />

          <nav className="left-nav">
            <Link href="/" className="logo">
              <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
              <span className="logo-text">PRAI<span>RON</span></span>
            </Link>
            <Link href="/" className="back-link">← Volver al inicio</Link>
          </nav>

          <div className="left-body">
            <h1 className="left-headline">
              Empieza gratis.<br />
              <em>Escala cuando quieras.</em>
            </h1>
            <p className="left-sub">
              14 días con acceso completo — sin tarjeta de crédito.<br />
              Más de 500 productores ya confían en PRAIRON.
            </p>

            <div className="benefits">
              {BENEFITS.map((b, i) => (
                <div key={i} className="benefit-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="benefit-icon">{b.icon}</span>
                  <div>
                    <div className="benefit-title">{b.title}</div>
                    <div className="benefit-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* NOAH preview */}
            <div className="noah-card">
              <div className="noah-header">
                <span className="noah-dot" />
                <span className="noah-label">NOAH · IA activa</span>
                <span className="noah-sector">{NOAH_MESSAGES[noahIdx].sector}</span>
              </div>
              <p className="noah-text">
                {typed}
                {isTyping && <span className="cursor" />}
              </p>
              <div className="noah-dots">
                {NOAH_MESSAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`noah-dot-nav${i === noahIdx ? ' active' : ''}`}
                    onClick={() => setNoahIdx(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right">
          <div className="right-inner">

            <div className="plan-tag">
              <span>✦</span>
              <span>Plan Gratis · 14 días de acceso completo</span>
            </div>

            <div className="right-header">
              <h2 className="right-title">
                {step === 1 ? 'Crea tu cuenta' : 'Cuéntanos de tu operación'}
              </h2>
              <p className="right-sub">
                {step === 1
                  ? 'Empieza en menos de 2 minutos'
                  : 'NOAH se configurará para tu sector desde el día 1'}
              </p>
            </div>

            {/* STEPS */}
            <div className="steps-bar">
              <div className="step-item">
                <div className={`step-circle${step > 1 ? ' done' : ' active'}`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`step-label${step === 1 ? ' active' : ''}`}>Cuenta</span>
              </div>
              <div className="step-sep" />
              <div className="step-item">
                <div className={`step-circle${step === 2 ? ' active' : ''}`}>2</div>
                <span className={`step-label${step === 2 ? ' active' : ''}`}>Tu finca</span>
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <button className="btn-google" type="button">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continuar con Google
                </button>

                <div className="divider"><span>o con email</span></div>

                <form onSubmit={handleStep1}>
                  <div className="field">
                    <label>NOMBRE COMPLETO</label>
                    <input
                      name="name" type="text" placeholder="Carlos Rodríguez"
                      value={form.name} onChange={handleChange} autoComplete="name" required
                    />
                  </div>
                  <div className="field">
                    <label>CORREO ELECTRÓNICO</label>
                    <input
                      name="email" type="email" placeholder="carlos@finca.com"
                      value={form.email} onChange={handleChange} autoComplete="email" required
                    />
                  </div>
                  <div className="field">
                    <label>CONTRASEÑA</label>
                    <div className="pass-wrap">
                      <input
                        name="password" type={showPass ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={form.password} onChange={handleChange}
                        autoComplete="new-password" required minLength={8}
                      />
                      <button
                        type="button" className="toggle-pass"
                        onClick={() => setShowPass(!showPass)}
                        aria-label="Mostrar contraseña"
                      >
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" className="btn-submit"
                    disabled={!form.name || !form.email || form.password.length < 8}
                  >
                    Continuar →
                  </button>
                </form>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>NOMBRE DE TU FINCA / EMPRESA</label>
                  <input
                    name="farmName" type="text" placeholder="Finca La Esperanza"
                    value={form.farmName} onChange={handleChange} required
                  />
                </div>

                <div className="field">
                  <label>SECTOR PRODUCTIVO PRINCIPAL</label>
                  <div className="sector-grid">
                    {SECTORS.map(s => (
                      <button
                        key={s.id} type="button"
                        className={`sector-btn${form.sector === s.id ? ' selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, sector: s.id }))}
                      >
                        <span className="sector-emoji">{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-row">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>PAÍS</label>
                    <select name="country" value={form.country} onChange={handleChange}>
                      <option>Colombia</option>
                      <option>México</option>
                      <option>Perú</option>
                      <option>Ecuador</option>
                      <option>Brasil</option>
                      <option>Argentina</option>
                      <option>Chile</option>
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>HECTÁREAS (aprox.)</label>
                    <input
                      name="hectares" type="number" placeholder="150"
                      value={form.hectares} onChange={handleChange} min="1"
                    />
                  </div>
                </div>

                <div style={{ height: 16 }} />

                <div className="check-row">
                  <input
                    type="checkbox" id="agree"
                    checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="agree">
                    Acepto los <Link href="/terminos">Términos de uso</Link> y la{' '}
                    <Link href="/privacidad">Política de privacidad</Link> de PRAIRON.
                    Cumplimos GDPR y Habeas Data (Ley 1581).
                  </label>
                </div>

                <button
                  type="submit" className="btn-submit"
                  disabled={loading || !form.farmName || !form.sector || !agreed}
                >
                  {loading ? (
                    <><div className="spinner" /> Creando tu cuenta…</>
                  ) : (
                    'Crear cuenta gratis →'
                  )}
                </button>

                <button type="button" className="btn-back" onClick={() => setStep(1)}>
                  ← Volver
                </button>
              </form>
            )}

            <div className="right-footer">
              ¿Ya tienes cuenta? <Link href="/login">Ingresar →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
