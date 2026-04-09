'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Sectores', href: '/#sectores' },
  { label: 'NOAH', href: '/#noah' },
  { label: 'Demo', href: '/demo' },
  { label: 'Precios', href: '/precios' },
]

const DEMO_FEATURES = [
  { icon: '🤖', label: 'NOAH en acción', desc: 'Ve cómo la IA analiza tu finca y genera recomendaciones en tiempo real' },
  { icon: '📊', label: 'Dashboard multifinca', desc: 'KPIs, lotes, alertas y reportes desde una sola pantalla' },
  { icon: '🗺️', label: 'Mapa de lotes', desc: 'Visualización geoespacial de tu operación con indicadores por zona' },
  { icon: '📋', label: 'Módulos por sector', desc: 'Ganadería, caficultura, palma, avicultura y 12 sectores más' },
]

const SECTORS = [
  'Ganadería 🐄', 'Caficultura ☕', 'Palma de aceite 🌴', 'Avicultura 🐔',
  'Cacao 🍫', 'Acuicultura 🐟', 'Horticultura 🥬', 'Otro sector 🌱',
]

const COMPANY_SIZES = ['1 finca (< 50 ha)', '2-5 fincas (50-500 ha)', '6-20 fincas', '20+ fincas / Cooperativa']

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

// Simulated dashboard preview data
const DASHBOARD_METRICS = [
  { label: 'Cabezas de ganado', value: '248', delta: '+12', up: true, unit: '' },
  { label: 'Peso promedio', value: '487', delta: '+2.3kg', up: true, unit: 'kg' },
  { label: 'Conversión alimento', value: '6.8', delta: '-0.2', up: false, unit: 'kg/kg' },
  { label: 'Alertas activas', value: '3', delta: '-1', up: true, unit: '' },
]

const NOAH_INSIGHTS = [
  '⚠️  Vacunación aftosa pendiente — Lote Norte · 48 bovinos · Vence en 3 días',
  '✅  Peso promedio Lote Sur superó meta mensual — 487kg promedio registrado',
  '💧  Déficit hídrico moderado detectado — Programar riego Potrero 3 esta semana',
  '📈  Proyección Q2: rendimiento +18% vs mismo período año anterior',
]

export default function DemoPage() {
  const [scrolled, setScrolled] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeInsight, setActiveInsight] = useState(0)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    sector: '', size: '', time: '', message: '',
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveInsight(i => (i + 1) % NOAH_INSIGHTS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setSent(true)
  }

  const canSubmit = form.name && form.email && form.sector && form.time

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a1a0f; --bg2: #0d1f14; --bg3: #112218; --bg4: #0f1e14;
          --green: #22c55e; --green-dim: #16a34a; --green-glow: rgba(34,197,94,0.12);
          --green-border: rgba(34,197,94,0.25); --green-text: #4ade80;
          --text: #f0fdf4; --text2: rgba(240,253,244,0.62); --text3: rgba(240,253,244,0.3);
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --font: 'DM Sans', system-ui, sans-serif; --mono: 'DM Mono', monospace;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 max(24px, calc((100vw - 1200px)/2));
          transition: background .3s, border-color .3s, backdrop-filter .3s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled { background: rgba(10,26,15,0.88); backdrop-filter: blur(16px); border-color: var(--border); }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-mark {
          width: 34px; height: 34px; background: var(--green); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-size: 14px; color: #0a1a0f; font-weight: 500;
        }
        .nav-logo-text { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; }
        .nav-logo-text em { font-style: normal; color: var(--green); }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-links a { font-size: 14px; color: var(--text2); text-decoration: none; padding: 6px 14px; border-radius: 8px; transition: color .2s, background .2s; }
        .nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.05); }
        .nav-links a.active { color: var(--green); }
        .nav-cta { font-size: 14px !important; font-weight: 500 !important; color: #0a1a0f !important; background: var(--green) !important; padding: 8px 18px !important; border-radius: 8px !important; }
        .nav-cta:hover { background: #16a34a !important; }

        /* HERO */
        .hero {
          padding: 120px max(24px, calc((100vw - 1200px)/2)) 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
          background: radial-gradient(ellipse 800px 500px at 0% 50%, rgba(34,197,94,0.07) 0%, transparent 65%);
          position: relative; overflow: hidden; min-height: 90vh;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px);
        }

        .hero-left { position: relative; z-index: 2; }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 28px;
          border: 1px solid var(--green-border); border-radius: 100px;
          padding: 6px 14px; font-size: 12px; font-family: var(--mono); color: var(--green);
          background: var(--green-glow); animation: fadeUp .6s ease both;
        }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .hero h1 { font-size: clamp(34px, 4.5vw, 56px); font-weight: 600; letter-spacing: -1.5px; line-height: 1.08; animation: fadeUp .7s .1s ease both; }
        .hero h1 em { font-style: normal; color: var(--green); }
        .hero-sub { font-size: 16px; color: var(--text2); line-height: 1.65; margin-top: 18px; max-width: 440px; animation: fadeUp .7s .2s ease both; }

        .hero-features { display: flex; flex-direction: column; gap: 12px; margin-top: 36px; animation: fadeUp .7s .3s ease both; }
        .hero-feature { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
        .hf-icon { font-size: 20px; flex-shrink: 0; }
        .hf-label { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
        .hf-desc { font-size: 12.5px; color: var(--text2); line-height: 1.5; }

        /* DASHBOARD PREVIEW */
        .preview-wrap { position: relative; z-index: 2; animation: fadeUp .7s .2s ease both; }
        .preview-card {
          background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px;
          overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08);
        }
        .preview-bar {
          background: var(--bg3); border-bottom: 1px solid var(--border); padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .preview-dots { display: flex; gap: 6px; }
        .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
        .preview-url { flex: 1; background: rgba(255,255,255,0.04); border-radius: 6px; padding: 5px 12px; font-size: 11px; font-family: var(--mono); color: var(--text3); text-align: center; }
        .preview-body { padding: 20px; }

        /* Metrics row */
        .metrics-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
        .metric-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
        .metric-label { font-size: 10px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
        .metric-value { font-size: 22px; font-weight: 600; color: var(--text); letter-spacing: -0.5px; line-height: 1; }
        .metric-delta { font-size: 11px; margin-top: 4px; }
        .metric-delta.up { color: var(--green); }
        .metric-delta.dn { color: #f87171; }

        /* Chart placeholder */
        .chart-wrap { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 16px; height: 120px; display: flex; align-items: flex-end; gap: 6px; overflow: hidden; }
        .chart-bar { flex: 1; border-radius: 4px 4px 0 0; background: linear-gradient(to top, var(--green), rgba(34,197,94,0.3)); transition: height .5s ease; }

        /* NOAH insight */
        .noah-preview {
          background: rgba(34,197,94,0.06); border: 1px solid var(--green-border); border-radius: 10px; padding: 12px 14px;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .noah-avatar { width: 28px; height: 28px; border-radius: 6px; background: var(--green); display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 11px; color: #0a1a0f; font-weight: 500; flex-shrink: 0; }
        .noah-insight-text { font-size: 12.5px; color: var(--text2); line-height: 1.5; }
        .noah-insight-text span { font-family: var(--mono); color: var(--green); font-size: 11px; }

        /* SOCIAL */
        .social-bar {
          padding: 40px max(24px, calc((100vw - 1200px)/2));
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 48px; justify-content: center; flex-wrap: wrap;
        }
        .social-stat { text-align: center; }
        .social-num { font-size: 28px; font-weight: 600; color: var(--green); letter-spacing: -1px; }
        .social-lbl { font-size: 12px; color: var(--text3); margin-top: 2px; font-family: var(--mono); }

        /* FORM SECTION */
        .form-section {
          padding: 80px max(24px, calc((100vw - 1200px)/2));
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start;
        }
        .form-left-title { font-size: 32px; font-weight: 600; letter-spacing: -0.8px; margin-bottom: 14px; }
        .form-left-title em { font-style: normal; color: var(--green); }
        .form-left-sub { font-size: 15px; color: var(--text2); line-height: 1.65; margin-bottom: 32px; }

        .agenda-steps { display: flex; flex-direction: column; gap: 16px; }
        .agenda-step { display: flex; gap: 16px; align-items: flex-start; }
        .agenda-step-num {
          width: 32px; height: 32px; border-radius: 50%; background: var(--green-glow);
          border: 1px solid var(--green-border); display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-family: var(--mono); color: var(--green); flex-shrink: 0;
        }
        .agenda-step-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
        .agenda-step-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }

        /* FORM CARD */
        .form-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; padding: 36px; }
        .form-card-title { font-size: 18px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 4px; }
        .form-card-sub { font-size: 13px; color: var(--text2); margin-bottom: 28px; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 7px; }
        .field input, .field select, .field textarea {
          width: 100%; background: var(--bg3); border: 1px solid var(--border2);
          border-radius: 10px; padding: 12px 14px; font-size: 14px; color: var(--text);
          font-family: var(--font); outline: none; transition: border-color .2s, box-shadow .2s;
          -webkit-appearance: none;
        }
        .field input:focus, .field select:focus, .field textarea:focus {
          border-color: var(--green-border); box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
        }
        .field input::placeholder, .field textarea::placeholder { color: var(--text3); }
        .field textarea { resize: vertical; min-height: 80px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* TIME SLOTS */
        .time-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .time-btn {
          padding: 9px 8px; border-radius: 8px; border: 1px solid var(--border2);
          background: var(--bg3); color: var(--text2); font-size: 13px; font-family: var(--mono);
          cursor: pointer; transition: all .15s; text-align: center;
        }
        .time-btn:hover { border-color: var(--green-border); color: var(--text); }
        .time-btn.selected { border-color: var(--green); background: var(--green-glow); color: var(--green); }

        /* SECTOR PILLS */
        .sector-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .sector-pill {
          padding: 7px 12px; border-radius: 100px; border: 1px solid var(--border2);
          background: var(--bg3); color: var(--text2); font-size: 12.5px; cursor: pointer;
          transition: all .15s;
        }
        .sector-pill:hover { border-color: var(--green-border); color: var(--text); }
        .sector-pill.selected { border-color: var(--green); background: var(--green-glow); color: var(--green); }

        /* BTN */
        .btn-submit {
          width: 100%; padding: 14px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--green); color: #0a1a0f; font-size: 15px; font-weight: 500;
          font-family: var(--font); margin-top: 8px; transition: background .2s, opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { background: #16a34a; }
        .btn-submit:disabled { opacity: .55; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(10,26,15,0.25); border-top-color: #0a1a0f; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* SUCCESS */
        .success-card {
          text-align: center; padding: 48px 32px;
          animation: fadeIn .5s ease;
        }
        .success-icon { font-size: 52px; margin-bottom: 20px; }
        .success-title { font-size: 22px; font-weight: 600; margin-bottom: 10px; }
        .success-sub { font-size: 15px; color: var(--text2); line-height: 1.6; margin-bottom: 28px; }
        .success-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--green); color: #0a1a0f; font-weight: 500; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; }

        /* TRUST */
        .trust-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
        .trust-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text3); }

        /* FOOTER */
        footer { border-top: 1px solid var(--border); padding: 28px max(24px, calc((100vw - 1200px)/2)); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        footer p { font-size: 13px; color: var(--text3); }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; gap: 48px; min-height: auto; }
          .preview-wrap { display: none; }
          .form-section { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 600px) {
          .metrics-row { grid-template-columns: 1fr 1fr; }
          .time-grid { grid-template-columns: repeat(3,1fr); }
          .nav-links { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-mark">P</div>
          <span className="nav-logo-text">PRAI<em>RON</em></span>
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={l.href === '/demo' ? 'active' : ''}>{l.label}</Link>
          ))}
          <Link href="/login" className="nav-cta">Ingresar →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-tag">
            <span className="hero-dot" />
            <span>Demo en vivo · 30 minutos · Sin costo</span>
          </div>
          <h1>Ve PRAIRON<br /><em>en tu sector,</em><br />con tus datos.</h1>
          <p className="hero-sub">
            Un especialista te muestra cómo NOAH analiza tu operación, qué módulos aplican a tu sector y cómo empezar en menos de una semana.
          </p>
          <div className="hero-features">
            {DEMO_FEATURES.map((f, i) => (
              <div key={i} className="hero-feature">
                <span className="hf-icon">{f.icon}</span>
                <div>
                  <div className="hf-label">{f.label}</div>
                  <div className="hf-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE DASHBOARD PREVIEW */}
        <div className="preview-wrap">
          <div className="preview-card">
            <div className="preview-bar">
              <div className="preview-dots">
                <div className="preview-dot" style={{ background: '#ff5f57' }} />
                <div className="preview-dot" style={{ background: '#febc2e' }} />
                <div className="preview-dot" style={{ background: '#28c840' }} />
              </div>
              <div className="preview-url">app.prairon.com/dashboard</div>
            </div>
            <div className="preview-body">
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Finca La Esperanza · Ganadería · Córdoba
              </div>

              <div className="metrics-row">
                {DASHBOARD_METRICS.map((m, i) => (
                  <div key={i} className="metric-card">
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}<span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: '2px' }}>{m.unit}</span></div>
                    <div className={`metric-delta ${m.up ? 'up' : 'dn'}`}>{m.up ? '↑' : '↓'} {m.delta}</div>
                  </div>
                ))}
              </div>

              <div className="chart-wrap">
                {[55, 70, 60, 80, 65, 90, 75, 95, 70, 88, 72, 100].map((h, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${h}%`, opacity: 0.6 + i * 0.03 }} />
                ))}
              </div>

              <div className="noah-preview">
                <div className="noah-avatar">N</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--green)' }}>NOAH</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>IA activa</span>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  </div>
                  <div className="noah-insight-text" style={{ minHeight: '36px' }}>
                    {NOAH_INSIGHTS[activeInsight]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div style={{
            position: 'absolute', bottom: '-16px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg3)', border: '1px solid var(--green-border)', borderRadius: '100px',
            padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--green)', whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            Demo en vivo disponible hoy
          </div>
        </div>
      </section>

      {/* SOCIAL */}
      <div className="social-bar">
        {[
          { num: '500+', lbl: 'Productores activos' },
          { num: '16', lbl: 'Sectores productivos' },
          { num: '4.9★', lbl: 'Calificación promedio' },
          { num: '< 7 días', lbl: 'Tiempo de implementación' },
        ].map((s, i) => (
          <div key={i} className="social-stat">
            <div className="social-num">{s.num}</div>
            <div className="social-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* FORM SECTION */}
      <section className="form-section">
        <div>
          <h2 className="form-left-title">Agenda tu demo<br /><em>personalizada</em></h2>
          <p className="form-left-sub">
            No es una demo genérica. Configuramos el sistema con tu sector, tu región y tus KPIs antes de la llamada para que veas exactamente lo que PRAIRON puede hacer por tu operación.
          </p>

          <div className="agenda-steps">
            {[
              { n: '01', title: 'Agendas en menos de 2 minutos', desc: 'Selecciona el horario que te funciona. Confirmación inmediata por email.' },
              { n: '02', title: 'Preparamos tu demo', desc: 'Configuramos el sistema con tu sector y datos representativos de tu región antes de la llamada.' },
              { n: '03', title: 'Demo en vivo 1:1 (30 min)', desc: 'Un especialista te guía por NOAH, los módulos de tu sector y responde todas tus preguntas.' },
              { n: '04', title: 'Empieza en 7 días o menos', desc: 'Si decides continuar, te acompañamos en el onboarding y la carga inicial de datos.' },
            ].map((s, i) => (
              <div key={i} className="agenda-step">
                <div className="agenda-step-num">{s.n}</div>
                <div>
                  <div className="agenda-step-title">{s.title}</div>
                  <div className="agenda-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM CARD */}
        <div className="form-card">
          {sent ? (
            <div className="success-card">
              <div className="success-icon">✅</div>
              <div className="success-title">¡Demo agendada!</div>
              <p className="success-sub">
                Recibirás una confirmación en <strong>{form.email}</strong> con el link de la videollamada y los detalles.<br /><br />
                Mientras tanto, puedes explorar el sistema con 14 días gratis.
              </p>
              <Link href="/register" className="success-cta">Empezar gratis ahora →</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-card-title">Reserva tu lugar</div>
              <div className="form-card-sub">Demo gratuita · 30 min · Videollamada</div>

              <div className="field-row">
                <div className="field">
                  <label>Nombre completo *</label>
                  <input name="name" type="text" placeholder="Carlos Rodríguez" value={form.name} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="carlos@finca.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>WhatsApp / Teléfono</label>
                  <input name="phone" type="tel" placeholder="+57 300 123 4567" value={form.phone} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Empresa / Finca</label>
                  <input name="company" type="text" placeholder="Finca La Esperanza" value={form.company} onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label>Tu sector productivo *</label>
                <div className="sector-pills">
                  {SECTORS.map(s => (
                    <button
                      key={s} type="button"
                      className={`sector-pill${form.sector === s ? ' selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, sector: s }))}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Tamaño de operación</label>
                <select name="size" value={form.size} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Horario preferido (hora Colombia) *</label>
                <div className="time-grid">
                  {TIMES.map(t => (
                    <button
                      key={t} type="button"
                      className={`time-btn${form.time === t ? ' selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, time: t }))}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>¿Qué quieres ver en la demo? (opcional)</label>
                <textarea name="message" placeholder="Ej: Cómo NOAH detecta enfermedades en mi cultivo de café, cómo funciona el módulo financiero, etc." value={form.message} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-submit" disabled={!canSubmit || loading}>
                {loading
                  ? <><div className="spinner" /> Agendando…</>
                  : 'Agendar demo gratis →'}
              </button>

              <div className="trust-row">
                {['🔒 Sin compromiso de compra', '📅 Cancela cuando quieras', '🇨🇴 Equipo en LATAM'].map((t, i) => (
                  <div key={i} className="trust-item">{t}</div>
                ))}
              </div>
            </form>
          )}
        </div>
      </section>

      <footer>
        <p>© 2026 PRAIRON · Todos los derechos reservados · Hecho en LATAM</p>
        <p>ES · EN · PT · Colombia · México · Perú · Brasil · Ecuador</p>
      </footer>
    </>
  )
}
