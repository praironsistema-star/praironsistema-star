'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Sectores', href: '/#sectores' },
  { label: 'NOAH', href: '/#noah' },
  { label: 'Demo', href: '/demo' },
  { label: 'Precios', href: '/precios' },
]

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    tagline: 'Para empezar con inteligencia',
    price: { monthly: 49000, annual: 39000 },
    currency: 'COP',
    period: 'finca / mes',
    highlight: false,
    badge: null,
    cta: 'Empezar gratis 14 días',
    ctaHref: '/register?plan=basico',
    color: '#4ade80',
    features: [
      { text: '1 finca registrada', included: true },
      { text: 'Hasta 3 usuarios', included: true },
      { text: '1 sector productivo', included: true },
      { text: 'NOAH básico — alertas y recomendaciones', included: true },
      { text: 'Dashboard de indicadores clave', included: true },
      { text: 'Registro de lotes y cultivos', included: true },
      { text: 'Reportes mensuales en PDF', included: true },
      { text: 'Soporte por email (72h)', included: true },
      { text: 'Múltiples sectores', included: false },
      { text: 'API access', included: false },
      { text: 'Integración ERP / contabilidad', included: false },
      { text: 'SLA garantizado', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'El estándar para operaciones serias',
    price: { monthly: 149000, annual: 119000 },
    currency: 'COP',
    period: 'finca / mes',
    highlight: true,
    badge: 'Más elegido',
    cta: 'Comenzar ahora',
    ctaHref: '/register?plan=pro',
    color: '#22c55e',
    features: [
      { text: 'Hasta 5 fincas', included: true },
      { text: 'Usuarios ilimitados', included: true },
      { text: 'Todos los sectores productivos (16)', included: true },
      { text: 'NOAH Pro — predicciones y análisis IA avanzado', included: true },
      { text: 'Dashboard multifinca en tiempo real', included: true },
      { text: 'Módulo financiero completo', included: true },
      { text: 'Trazabilidad y cosecha', included: true },
      { text: 'Reportes ilimitados + exportación Excel', included: true },
      { text: 'Soporte prioritario (24h)', included: true },
      { text: 'API access (1,000 req/día)', included: true },
      { text: 'Integración ERP / contabilidad', included: false },
      { text: 'SLA garantizado 99.9%', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grupos empresariales y cooperativas',
    price: { monthly: null, annual: null },
    currency: 'COP',
    period: '',
    highlight: false,
    badge: 'A medida',
    cta: 'Hablar con ventas',
    ctaHref: '/demo?plan=enterprise',
    color: '#86efac',
    features: [
      { text: 'Fincas ilimitadas + multi-tenant', included: true },
      { text: 'Usuarios y roles personalizados', included: true },
      { text: 'Todos los sectores + módulos custom', included: true },
      { text: 'NOAH Enterprise — modelos IA propios', included: true },
      { text: 'Dashboard corporativo con BI', included: true },
      { text: 'Módulo financiero + contabilidad integrada', included: true },
      { text: 'Cadena de suministro y exportaciones', included: true },
      { text: 'Reportes regulatorios (ICA, INVIMA, etc.)', included: true },
      { text: 'Soporte dedicado + gerente de cuenta', included: true },
      { text: 'API ilimitada + webhooks', included: true },
      { text: 'Integración ERP / contabilidad (SAP, Siigo)', included: true },
      { text: 'SLA garantizado 99.9% + on-premise disponible', included: true },
    ],
  },
]

const FAQS = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Puedes escalar o bajar de plan cuando quieras. Los cambios aplican al siguiente ciclo de facturación. Si subes de plan, la diferencia se prorratea automáticamente.',
  },
  {
    q: '¿Qué pasa al terminar los 14 días gratis?',
    a: 'Te avisamos 3 días antes. Si no ingresas un método de pago, tu cuenta pasa a modo lectura — tus datos están seguros, no se eliminan. Puedes reactivar cuando quieras.',
  },
  {
    q: '¿Los precios incluyen IVA?',
    a: 'Los precios mostrados no incluyen IVA. Colombia aplica 19% de IVA en servicios de software. En el checkout verás el desglose completo antes de confirmar.',
  },
  {
    q: '¿NOAH funciona con todos los planes?',
    a: 'Sí, pero con diferentes capacidades. Básico incluye alertas y recomendaciones estándar. Pro agrega predicciones predictivas y análisis avanzado. Enterprise incluye modelos IA entrenados con los datos de tu operación.',
  },
  {
    q: '¿Puedo tener múltiples fincas en un solo plan?',
    a: 'En Básico puedes registrar 1 finca. Pro soporta hasta 5 fincas con un solo dashboard unificado. Enterprise soporta fincas ilimitadas con estructura multi-empresa.',
  },
  {
    q: '¿Cómo funciona el plan Enterprise?',
    a: 'Es un contrato personalizado según el tamaño y necesidades de tu operación. Incluye implementación asistida, capacitación, integración con tus sistemas actuales y SLA garantizado. Agenda una llamada con nuestro equipo de ventas.',
  },
]

const SECTORS_SAMPLE = ['Ganadería 🐄', 'Caficultura ☕', 'Palma de aceite 🌴', 'Avicultura 🐔', 'Cacao 🍫', 'Arroz 🌾', 'Acuicultura 🐟', 'Horticultura 🥬']

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

export default function PreciosPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a1a0f;
          --bg2: #0d1f14;
          --bg3: #112218;
          --green: #22c55e;
          --green-dim: #16a34a;
          --green-glow: rgba(34,197,94,0.15);
          --green-border: rgba(34,197,94,0.25);
          --text: #f0fdf4;
          --text2: rgba(240,253,244,0.65);
          --text3: rgba(240,253,244,0.35);
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --font: 'DM Sans', system-ui, sans-serif;
          --mono: 'DM Mono', monospace;
        }

        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 max(24px, calc((100vw - 1200px)/2));
          height: 64px; display: flex; align-items: center; justify-content: space-between;
          transition: background .3s, border-color .3s, backdrop-filter .3s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(10,26,15,0.85);
          backdrop-filter: blur(16px);
          border-color: var(--border);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-mark {
          width: 34px; height: 34px; background: var(--green); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-weight: 500; font-size: 14px; color: #0a1a0f;
          letter-spacing: -0.5px;
        }
        .nav-logo-text { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; }
        .nav-logo-text span { color: var(--green); }
        .nav-links { display: flex; align-items: center; gap: 6px; }
        .nav-links a {
          font-size: 14px; color: var(--text2); text-decoration: none;
          padding: 6px 14px; border-radius: 8px; transition: color .2s, background .2s;
        }
        .nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.05); }
        .nav-links a.active { color: var(--green); }
        .nav-cta {
          font-size: 14px; font-weight: 500; color: #0a1a0f !important;
          background: var(--green) !important; padding: 8px 18px !important; border-radius: 8px !important;
        }
        .nav-cta:hover { background: #16a34a !important; }
        .nav-hamburger { display: none; background: none; border: none; cursor: pointer; color: var(--text2); }

        /* HERO */
        .hero {
          min-height: 54vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 60px;
          background: radial-gradient(ellipse 900px 500px at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px);
          pointer-events: none;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid var(--green-border); border-radius: 100px;
          padding: 6px 14px; font-size: 12px; font-family: var(--mono); color: var(--green);
          background: var(--green-glow); margin-bottom: 28px;
          animation: fadeUp .6s ease both;
        }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .hero h1 {
          font-size: clamp(36px, 6vw, 64px); font-weight: 600; letter-spacing: -1.5px;
          line-height: 1.08; color: var(--text); max-width: 700px;
          animation: fadeUp .7s .1s ease both;
        }
        .hero h1 em { font-style: normal; color: var(--green); }
        .hero-sub {
          font-size: 17px; color: var(--text2); max-width: 480px; line-height: 1.6;
          margin-top: 18px; animation: fadeUp .7s .2s ease both;
        }

        /* TOGGLE */
        .toggle-wrap {
          display: flex; align-items: center; gap: 14px; margin: 48px auto 0;
          animation: fadeUp .7s .3s ease both;
        }
        .toggle-label { font-size: 14px; color: var(--text2); }
        .toggle-label.active { color: var(--text); }
        .toggle-btn {
          width: 48px; height: 26px; border-radius: 13px; border: none; cursor: pointer;
          position: relative; transition: background .3s;
          background: var(--annual-bg, rgba(255,255,255,0.12));
        }
        .toggle-btn.on { --annual-bg: var(--green); }
        .toggle-btn::after {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%; background: white;
          transition: transform .3s; transform: translateX(var(--knob, 0));
        }
        .toggle-btn.on::after { --knob: 22px; }
        .badge-save {
          font-size: 11px; font-family: var(--mono); background: rgba(34,197,94,0.15);
          border: 1px solid var(--green-border); color: var(--green);
          padding: 3px 8px; border-radius: 6px;
        }

        /* PLANS */
        .plans-section { padding: 60px max(24px, calc((100vw - 1200px)/2)) 80px; }
        .plans-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          align-items: start;
        }

        .plan-card {
          border-radius: 16px; padding: 32px 28px; position: relative;
          border: 1px solid var(--border2);
          background: var(--bg3);
          transition: transform .2s, border-color .2s, box-shadow .2s;
          animation: fadeUp .7s ease both;
        }
        .plan-card:nth-child(1) { animation-delay: .1s; }
        .plan-card:nth-child(2) { animation-delay: .2s; }
        .plan-card:nth-child(3) { animation-delay: .3s; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }

        .plan-card.featured {
          border-color: var(--green-border);
          background: linear-gradient(160deg, rgba(34,197,94,0.08) 0%, var(--bg3) 60%);
          box-shadow: 0 0 0 1px var(--green-border), 0 20px 60px rgba(34,197,94,0.08);
        }

        .plan-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          font-size: 11px; font-family: var(--mono); font-weight: 500;
          padding: 4px 12px; border-radius: 100px;
          white-space: nowrap;
        }
        .plan-badge.popular { background: var(--green); color: #0a1a0f; }
        .plan-badge.custom { background: rgba(255,255,255,0.08); color: var(--text2); border: 1px solid var(--border2); }

        .plan-name { font-size: 13px; font-family: var(--mono); color: var(--green); letter-spacing: .08em; text-transform: uppercase; }
        .plan-tagline { font-size: 14px; color: var(--text2); margin-top: 4px; line-height: 1.4; }
        .plan-price-wrap { margin: 28px 0 8px; }
        .plan-price {
          font-size: 44px; font-weight: 600; letter-spacing: -2px; color: var(--text); line-height: 1;
        }
        .plan-price sup { font-size: 18px; font-weight: 400; vertical-align: top; margin-top: 8px; display: inline-block; }
        .plan-price span { font-size: 44px; }
        .plan-period { font-size: 13px; color: var(--text3); margin-top: 6px; }
        .plan-annual-note { font-size: 12px; color: var(--green); font-family: var(--mono); margin-top: 4px; min-height: 16px; }

        .plan-cta {
          display: block; width: 100%; padding: 13px; border-radius: 10px;
          font-size: 15px; font-weight: 500; text-align: center; text-decoration: none;
          margin: 24px 0 28px; transition: all .2s; cursor: pointer; border: none;
        }
        .plan-cta.primary { background: var(--green); color: #0a1a0f; }
        .plan-cta.primary:hover { background: #16a34a; }
        .plan-cta.secondary { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border2); }
        .plan-cta.secondary:hover { background: rgba(255,255,255,0.1); }

        .plan-divider { border: none; border-top: 1px solid var(--border); margin-bottom: 20px; }

        .plan-features-title { font-size: 11px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px; }

        .feature-row {
          display: flex; align-items: flex-start; gap: 10px; padding: 7px 0;
          font-size: 13.5px; color: var(--text2); line-height: 1.4;
        }
        .feature-row .icon { flex-shrink: 0; margin-top: 1px; font-size: 13px; width: 16px; text-align: center; }
        .feature-row.off { color: var(--text3); text-decoration: line-through; text-decoration-color: rgba(255,255,255,0.1); }

        /* COMPARE TABLE */
        .compare-section { padding: 0 max(24px, calc((100vw - 1200px)/2)) 80px; }
        .compare-section h2 { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; text-align: center; margin-bottom: 40px; color: var(--text); }
        .compare-table { width: 100%; border-collapse: collapse; }
        .compare-table th { padding: 14px 20px; font-size: 13px; font-family: var(--mono); color: var(--text2); border-bottom: 1px solid var(--border2); text-align: left; }
        .compare-table th:not(:first-child) { text-align: center; }
        .compare-table td { padding: 12px 20px; font-size: 13.5px; color: var(--text2); border-bottom: 1px solid var(--border); }
        .compare-table td:not(:first-child) { text-align: center; }
        .compare-table tr:hover td { background: rgba(255,255,255,0.02); }
        .compare-table .cat-row td { font-size: 11px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: .08em; padding: 18px 20px 6px; border: none; }
        .check { color: var(--green); font-size: 15px; }
        .cross { color: var(--text3); font-size: 15px; }

        /* SOCIAL PROOF */
        .proof-section {
          padding: 60px max(24px, calc((100vw - 1200px)/2));
          background: linear-gradient(to bottom, var(--bg), var(--bg2));
        }
        .proof-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .proof-card {
          background: var(--bg3); border: 1px solid var(--border); border-radius: 14px; padding: 24px;
        }
        .proof-quote { font-size: 14px; color: var(--text2); line-height: 1.65; margin-bottom: 20px; font-style: italic; }
        .proof-author { display: flex; align-items: center; gap: 12px; }
        .proof-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--green-glow);
          border: 1px solid var(--green-border); display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }
        .proof-name { font-size: 13px; font-weight: 500; color: var(--text); }
        .proof-role { font-size: 12px; color: var(--text3); }

        /* FAQ */
        .faq-section { padding: 60px max(24px, calc((100vw - 1200px)/2)) 80px; max-width: 800px; margin: 0 auto; }
        .faq-title { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; text-align: center; margin-bottom: 40px; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-q {
          width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          padding: 20px 0; display: flex; justify-content: space-between; align-items: center;
          font-size: 15px; font-weight: 500; color: var(--text); gap: 16px;
          font-family: var(--font);
        }
        .faq-q:hover { color: var(--green); }
        .faq-chevron { font-size: 18px; color: var(--text3); transition: transform .2s; flex-shrink: 0; }
        .faq-chevron.open { transform: rotate(180deg); color: var(--green); }
        .faq-a { font-size: 14px; color: var(--text2); line-height: 1.65; padding-bottom: 20px; }

        /* CTA BOTTOM */
        .cta-bottom {
          padding: 80px max(24px, calc((100vw - 1200px)/2));
          text-align: center;
          background: radial-gradient(ellipse 700px 400px at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 70%);
        }
        .cta-bottom h2 { font-size: 36px; font-weight: 600; letter-spacing: -0.8px; margin-bottom: 16px; }
        .cta-bottom h2 em { font-style: normal; color: var(--green); }
        .cta-bottom p { font-size: 16px; color: var(--text2); margin-bottom: 36px; }
        .cta-bottom-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green); color: #0a1a0f; font-weight: 500; font-size: 15px;
          padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: background .2s;
        }
        .btn-primary:hover { background: #16a34a; }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06); color: var(--text); font-size: 15px;
          padding: 14px 28px; border-radius: 10px; text-decoration: none;
          border: 1px solid var(--border2); transition: background .2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border);
          padding: 32px max(24px, calc((100vw - 1200px)/2));
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
        }
        footer p { font-size: 13px; color: var(--text3); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
          .proof-grid { grid-template-columns: 1fr; }
          .nav-links { display: none; }
          .nav-hamburger { display: block; }
          .compare-section { display: none; }
        }
        @media (max-width: 600px) {
          .cta-bottom h2 { font-size: 26px; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-mark">P</div>
          <span className="nav-logo-text">PRAI<span>RON</span></span>
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={l.href === '/precios' ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="nav-cta">Ingresar →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">
          <span className="hero-dot" />
          <span style={{ fontFamily: "'DM Mono', monospace" }}>Planes y Precios</span>
        </div>
        <h1>Inteligencia agroindustrial<br /><em>al alcance de todos</em></h1>
        <p className="hero-sub">
          Desde la finca familiar hasta el grupo empresarial. Elige el plan que se adapta a tu operación y escala cuando quieras.
        </p>

        {/* BILLING TOGGLE */}
        <div className="toggle-wrap">
          <span className={`toggle-label${!annual ? ' active' : ''}`}>Mensual</span>
          <button
            className={`toggle-btn${annual ? ' on' : ''}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Facturación anual"
          />
          <span className={`toggle-label${annual ? ' active' : ''}`}>Anual</span>
          <span className="badge-save">Ahorra 20%</span>
        </div>
      </section>

      {/* PLANS */}
      <section className="plans-section">
        <div className="plans-grid">
          {PLANS.map((plan) => {
            const price = annual ? plan.price.annual : plan.price.monthly
            return (
              <div key={plan.id} className={`plan-card${plan.highlight ? ' featured' : ''}`}>
                {plan.badge && (
                  <div className={`plan-badge${plan.highlight ? ' popular' : ' custom'}`}>
                    {plan.badge}
                  </div>
                )}

                <div className="plan-name">{plan.name}</div>
                <div className="plan-tagline">{plan.tagline}</div>

                <div className="plan-price-wrap">
                  {price ? (
                    <>
                      <div className="plan-price">
                        <sup>$</sup>
                        <span>{(price / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="plan-period">{plan.currency} · {plan.period}</div>
                      <div className="plan-annual-note">
                        {annual ? `≈ ${formatCOP(price * 12)} / año` : ' '}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="plan-price" style={{ fontSize: '36px', letterSpacing: '-1px' }}>A medida</div>
                      <div className="plan-period">Contactar para cotización</div>
                      <div className="plan-annual-note"> </div>
                    </>
                  )}
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`plan-cta${plan.highlight ? ' primary' : ' secondary'}`}
                >
                  {plan.cta}
                </Link>

                <hr className="plan-divider" />
                <div className="plan-features-title">Incluye</div>

                {plan.features.map((f, i) => (
                  <div key={i} className={`feature-row${f.included ? '' : ' off'}`}>
                    <span className="icon">{f.included ? '✓' : '–'}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* TRUST ROW */}
        <div style={{
          display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)'
        }}>
          {[
            { icon: '🔒', text: 'Pago seguro — SSL + PSE + tarjetas' },
            { icon: '📋', text: 'Sin permanencia — cancela cuando quieras' },
            { icon: '🧾', text: 'Factura electrónica automática' },
            { icon: '🇨🇴', text: 'GDPR + Habeas Data (Ley 1581)' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(240,253,244,0.5)' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE TABLE (hidden on mobile) */}
      <section className="compare-section">
        <h2>Comparación detallada</h2>
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Característica</th>
              <th>Básico</th>
              <th style={{ color: '#22c55e' }}>Pro</th>
              <th>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {[
              { cat: 'Operación' },
              { f: 'Fincas', v: ['1', 'Hasta 5', 'Ilimitadas'] },
              { f: 'Usuarios', v: ['3', 'Ilimitados', 'Ilimitados'] },
              { f: 'Sectores productivos', v: ['1', '16', '16 + custom'] },
              { cat: 'NOAH — IA agrícola' },
              { f: 'Alertas y recomendaciones', v: [true, true, true] },
              { f: 'Predicciones y modelos avanzados', v: [false, true, true] },
              { f: 'Modelos IA entrenados con tus datos', v: [false, false, true] },
              { cat: 'Reportes' },
              { f: 'Reportes PDF mensuales', v: [true, true, true] },
              { f: 'Exportación Excel / CSV', v: [false, true, true] },
              { f: 'BI y dashboards ejecutivos', v: [false, false, true] },
              { cat: 'Integraciones' },
              { f: 'API access', v: [false, '1K req/día', 'Ilimitada'] },
              { f: 'Webhooks', v: [false, false, true] },
              { f: 'ERP / SAP / Siigo', v: [false, false, true] },
              { cat: 'Soporte' },
              { f: 'Email', v: ['72h', '24h', 'Dedicado'] },
              { f: 'SLA garantizado', v: [false, false, '99.9%'] },
            ].map((row, i) => {
              if ('cat' in row) {
                return <tr key={i} className="cat-row"><td colSpan={4}>{row.cat}</td></tr>
              }
              return (
                <tr key={i}>
                  <td>{row.f}</td>
                  {(row.v as (boolean | string)[]).map((v, j) => (
                    <td key={j}>
                      {v === true ? <span className="check">✓</span>
                        : v === false ? <span className="cross">–</span>
                        : <span style={{ fontSize: '13px', fontFamily: "'DM Mono', monospace", color: j === 1 ? '#22c55e' : 'rgba(240,253,244,0.65)' }}>{v}</span>}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* SOCIAL PROOF */}
      <section className="proof-section">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#22c55e', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Clientes que ya confían en PRAIRON</div>
          <div style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.5px' }}>Resultados reales, operaciones reales</div>
        </div>
        <div className="proof-grid">
          {[
            { quote: 'PRAIRON nos ayudó a reducir el desperdicio de concentrado en un 18% en el primer trimestre. NOAH detectó patrones que nosotros nunca hubiéramos visto solos.', name: 'Carlos Rendón', role: 'Ganadero · Córdoba, Colombia', emoji: '🐄' },
            { quote: 'Gestionar 3 fincas cafeteras desde una sola pantalla cambió todo. Ya no necesito 3 sistemas diferentes — PRAIRON lo centraliza todo con reportes automáticos.', name: 'Ana Lucía Ospina', role: 'Caficultora · Huila, Colombia', emoji: '☕' },
            { quote: 'El módulo de trazabilidad nos abrió la puerta a mercados de exportación que antes eran imposibles. Ahora tenemos certificación completa y documentación en orden.', name: 'Grupo Palmero del Llano', role: 'Palmicultura · Meta, Colombia', emoji: '🌴' },
          ].map((t, i) => (
            <div key={i} className="proof-card">
              <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#22c55e', fontSize: '13px' }}>★</span>)}
              </div>
              <p className="proof-quote">"{t.quote}"</p>
              <div className="proof-author">
                <div className="proof-avatar">{t.emoji}</div>
                <div>
                  <div className="proof-name">{t.name}</div>
                  <div className="proof-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div className="faq-section">
        <h2 className="faq-title">Preguntas frecuentes</h2>
        {FAQS.map((item, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {item.q}
              <span className={`faq-chevron${openFaq === i ? ' open' : ''}`}>↓</span>
            </button>
            {openFaq === i && <p className="faq-a">{item.a}</p>}
          </div>
        ))}
      </div>

      {/* CTA BOTTOM */}
      <section className="cta-bottom">
        <h2>¿Listo para transformar<br /><em>tu operación agroindustrial?</em></h2>
        <p>14 días gratis. Sin tarjeta de crédito. Sin permanencia.</p>
        <div className="cta-bottom-btns">
          <Link href="/register" className="btn-primary">Empezar gratis →</Link>
          <Link href="/demo" className="btn-secondary">Ver demo en vivo</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 PRAIRON · Todos los derechos reservados · Hecho en LATAM</p>
        <p>ES · EN · PT · Colombia · México · Perú · Brasil · Ecuador</p>
      </footer>
    </>
  )
}
