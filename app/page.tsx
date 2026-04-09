'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const ANNOUNCEMENT_CONFIG = {
  enabled: true,
  title: '🎉 Lanzamiento oficial PRAIRON',
  message: '14 días gratis sin tarjeta de crédito · Onboarding personalizado incluido',
  cta: 'Activar prueba gratuita',
  ctaUrl: '/register',
  expires: '2026-08-01',
}

function PraironLogo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const c = white ? '#ffffff' : '#1a5c3a'
  const a = white ? '#7ed4a0' : '#2d9e5f'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" fill={c} opacity="0.12"/>
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" stroke={c} strokeWidth="1.5"/>
      <path d="M14 20C14 16.686 16.686 14 20 14C23.314 14 26 16.686 26 20" stroke={a} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2.5" fill={c}/>
      <path d="M20 22.5V28" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const SECTORES = [
  { key: 'ganadero',   label: 'Ganadería',          icon: '🐄', color: '#b45309', bg: '#fef3e2', desc: 'Historial veterinario, producción de leche, trazabilidad individual y alertas de salud en tiempo real.', kpis: ['+18% leche/día', '-40% tiempo admin.', '0 animales sin control'] },
  { key: 'avicola',    label: 'Avicultura',          icon: '🐔', color: '#dc2626', bg: '#fef2f2', desc: 'Galpones, lotes de engorde o postura, registro diario de mortalidad y alimentación por lote.', kpis: ['FCR 1.78 promedio', '-60% mortalidad', '100% trazabilidad'] },
  { key: 'palma',      label: 'Palma de aceite',     icon: '🌴', color: '#065f46', bg: '#d1fae5', desc: 'Lotes FFB, extractora, eficiencia de extracción y análisis de laboratorio en un solo sistema.', kpis: ['+22% eficiencia ext.', '3 cert. ODS activas', '18.4 FFB/ha/año'] },
  { key: 'vivero',     label: 'Vivero Palma',        icon: '🌱', color: '#047857', bg: '#ecfdf5', desc: 'Control de germinación, etapas de desarrollo, mortalidad en pre-vivero y vivero principal.', kpis: ['Germinación 94%', 'Control por bolsa', 'Despacho trazado'] },
  { key: 'agricola',   label: 'Agricultura',         icon: '🌽', color: '#036446', bg: '#e8f5ef', desc: 'Ciclos de cultivo, control de plagas, recomendaciones IA por tipo de suelo y certificaciones ODS.', kpis: ['Score ODS 74/100', 'Cosecha predicha ±3d', '-30% pérdidas'] },
  { key: 'organica',   label: 'Agric. Orgánica',     icon: '🌿', color: '#166534', bg: '#f0fdf4', desc: 'Trazabilidad de insumos orgánicos, certificaciones USDA/BCS, historial de aplicaciones y auditorías.', kpis: ['Certificación trazada', 'Cero agroquímicos', 'Auditoría digital'] },
  { key: 'horticola',  label: 'Horticultura',        icon: '🥬', color: '#15803d', bg: '#dcfce7', desc: 'Ciclos cortos intensivos, control de riego, temperatura, plagas y cosecha escalonada.', kpis: ['Ciclos optimizados', 'Riego automatizado', 'Cosecha escalonada'] },
  { key: 'fruticultura', label: 'Fruticultura',      icon: '🍓', color: '#be185d', bg: '#fdf2f8', desc: 'Fenología por variedad, historial de podas, fertilizaciones y proyección de cosecha por lote.', kpis: ['Fenología controlada', 'Poda trazada', 'Rendimiento/ha'] },
  { key: 'acuicultura',label: 'Acuicultura',         icon: '🐟', color: '#0369a1', bg: '#e0f2fe', desc: 'Control de densidad, FCR acuícola, calidad de agua y proyección de cosecha.', kpis: ['FCR acuícola óptimo', '+25% supervivencia', 'Calidad agua 24/7'] },
  { key: 'cafe',       label: 'Caficultura',         icon: '☕', color: '#92400e', bg: '#fef3c7', desc: 'Floración, cosecha selectiva, beneficio húmedo y análisis de taza para café de especialidad.', kpis: ['Cosecha selectiva +30%', 'Trazabilidad por lote', 'Análisis de taza'] },
  { key: 'cacao',      label: 'Cacao',               icon: '🍫', color: '#7c2d12', bg: '#fff7ed', desc: 'Control de fermentación, secado, clasificación por calidad y exportación trazada.', kpis: ['Fermentación óptima', 'Clasificación automática', 'Exportación trazada'] },
  { key: 'arroz',      label: 'Arroz',               icon: '🌾', color: '#ca8a04', bg: '#fefce8', desc: 'Manejo de láminas de agua, siembra directa o transplante, control de malezas y cosecha mecanizada.', kpis: ['Lámina controlada', 'Rendimiento t/ha', 'Cosecha mecanizada'] },
  { key: 'cana',       label: 'Caña de Azúcar',      icon: '🌿', color: '#15803d', bg: '#dcfce7', desc: 'Control de corte, toneladas por hectárea, POL y liquidación directa con el ingenio.', kpis: ['TCH óptimo por suerte', 'Liquidación automática', 'POL en tiempo real'] },
  { key: 'apicultura', label: 'Apicultura',          icon: '🍯', color: '#d97706', bg: '#fef9c3', desc: 'Registro de revisiones, estado de la reina, producción de miel y tratamientos sanitarios.', kpis: ['+40% producción/colmena', 'Varroa bajo control', 'Trazabilidad miel'] },
  { key: 'floricultura', label: 'Floricultura',      icon: '💐', color: '#9333ea', bg: '#faf5ff', desc: 'Control de variedades, tallos por cama, punto de corte, postcosecha y exportación.', kpis: ['Tallo perfecto 98%', 'Postcosecha trazada', 'Exportación a tiempo'] },
  { key: 'mixto',      label: 'MIXTO',               icon: '⊞',  color: '#475569', bg: '#f8fafc', desc: 'Combina múltiples módulos en una sola finca. Ganadería + cultivos + finanzas integradas.', kpis: ['Módulos combinados', 'Un solo dashboard', 'Finanzas unificadas'] },
]

const STATS = [
  { value: 16, suffix: '+', label: 'Sectores productivos' },
  { value: 48, suffix: '', label: 'Módulos integrados' },
  { value: 99.8, suffix: '%', label: 'Uptime garantizado' },
  { value: 14, suffix: '', label: 'Días gratis' },
]

const TRUST_PILLARS = [
  { icon: '🔐', title: 'Cifrado AES-256', desc: 'Toda tu información viaja y se almacena con cifrado de nivel bancario.' },
  { icon: '🚫', title: 'Nunca vendemos tus datos', desc: 'A diferencia de plataformas que usan datos agrícolas para análisis de mercado, PRAIRON jamás comercializa tu información.' },
  { icon: '📤', title: 'Tus datos, tu control', desc: 'Exporta toda tu información en cualquier momento. Eliminación en menos de 72 horas.' },
  { icon: '🌍', title: 'GDPR + Habeas Data', desc: 'Ley 1581 Colombia · GDPR Europa · Auditado anualmente por terceros independientes.' },
]

const COMPARATIVA = [
  'IA agroindustrial nativa (NOAH)',
  'Funciona sin internet (Offline-First)',
  'Trazabilidad QR por lote',
  'Benchmarking vs. sector',
  'Tareo digital de jornaleros',
  'ODS y sostenibilidad exportable',
  '16 sectores en una plataforma',
  'Módulo financiero completo',
  'Datos 100% privados — sin venta a terceros',
  'Precio accesible para LATAM',
]

const DEMO_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'noah', label: 'NOAH IA', icon: '◈' },
  { id: 'finance', label: 'Finanzas', icon: '◎' },
  { id: 'traz', label: 'Trazabilidad', icon: '◉' },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / 1800, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(ease * target * 10) / 10)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

function AnnouncementModal({ onClose }: { onClose: () => void }) {
  const cfg = ANNOUNCEMENT_CONFIG
  if (!cfg.enabled || new Date(cfg.expires) < new Date()) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ background: '#1a5c3a', padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            <PraironLogo size={30} white /><span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>PRAIRON</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 8px', lineHeight: 1.3 }}>{cfg.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>{cfg.message}</p>
        </div>
        <div style={{ padding: '22px 32px 28px' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#1a5c3a' }}>14 días gratis</div>
            <div style={{ fontSize: '12px', color: '#4b7a5e', marginTop: '3px' }}>Sin tarjeta · Cancela cuando quieras</div>
          </div>
          <Link href={cfg.ctaUrl} style={{ display: 'block', background: '#1a5c3a', color: '#fff', padding: '13px', borderRadius: '10px', textAlign: 'center', fontWeight: '600', fontSize: '14px', textDecoration: 'none', marginBottom: '10px' }} onClick={onClose}>{cfg.cta}</Link>
          <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', padding: '6px' }}>Continuar sin registrarme</button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const [activeSector, setActiveSector] = useState(0)
  const [activeDemo, setActiveDemo] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [tickerPos, setTickerPos] = useState(0)
  const demoInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('prairon_modal')) setTimeout(() => setShowModal(true), 1200)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveSector(s => (s + 1) % SECTORES.length), 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    demoInterval.current = setInterval(() => setActiveDemo(t => (t + 1) % DEMO_TABS.length), 4000)
    return () => { if (demoInterval.current) clearInterval(demoInterval.current) }
  }, [])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    let pos = 0
    const id = setInterval(() => {
      pos = (pos + 0.4) % 100
      setTickerPos(pos)
    }, 30)
    return () => clearInterval(id)
  }, [])

  const closeModal = () => { setShowModal(false); sessionStorage.setItem('prairon_modal', '1') }

  const clickDemo = (i: number) => {
    setActiveDemo(i)
    if (demoInterval.current) clearInterval(demoInterval.current)
    demoInterval.current = setInterval(() => setActiveDemo(t => (t + 1) % DEMO_TABS.length), 4000)
  }

  const tickerLabels = SECTORES.map(s => `${s.icon} ${s.label}`).join('  ·  ')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',sans-serif;background:#fafaf8;color:#1a1a1a;-webkit-font-smoothing:antialiased}
        .sora{font-family:'Sora',sans-serif}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes progressFill{from{width:0%}to{width:100%}}
        .btn-primary{background:#1a5c3a;color:#fff;padding:13px 26px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;display:inline-block;border:none;cursor:pointer;font-family:'DM Sans',sans-serif}
        .btn-primary:hover{background:#166534;transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,92,58,0.28)}
        .btn-outline{background:transparent;color:#1a5c3a;padding:13px 26px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;border:1.5px solid #1a5c3a;display:inline-block;transition:all 0.2s}
        .btn-outline:hover{background:#f0fdf4}
        .nav-link{color:#374151;text-decoration:none;font-size:14px;font-weight:500;padding:7px 14px;border-radius:8px;transition:all 0.2s}
        .nav-link:hover{color:#1a5c3a;background:rgba(26,92,58,0.07)}
        .demo-tab{cursor:pointer;padding:7px 12px;border-radius:7px;font-size:12px;font-weight:500;border:none;background:transparent;display:flex;align-items:center;gap:5px;color:#6b7280;transition:all 0.2s;font-family:'DM Sans',sans-serif}
        .demo-tab.active{background:#fff;color:#1a5c3a;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
        .trust-card{background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);border-radius:16px;padding:22px;transition:all 0.3s}
        .trust-card:hover{background:rgba(255,255,255,0.09);transform:translateY(-2px)}
        .container{max-width:1160px;margin:0 auto;padding:0 24px}
        .glow{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(34,197,94,0.2);flex-shrink:0}
        .sector-pill{cursor:pointer;transition:all 0.25s;border:0.5px solid #e5e7eb;border-radius:12px;padding:14px;background:#fff}
        .sector-pill:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.09)}
        @media(max-width:768px){.hide-mob{display:none!important}.grid-2{grid-template-columns:1fr!important}.sectors-grid{grid-template-columns:repeat(2,1fr)!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {showModal && <AnnouncementModal onClose={closeModal} />}

      {/* TICKER */}
      <div style={{ background: '#1a5c3a', height: '32px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', whiteSpace: 'nowrap', transform: `translateX(-${tickerPos}%)`, display: 'flex', gap: '60px', height: '100%', alignItems: 'center' }}>
          {[0, 1, 2].map(rep => (
            <span key={rep} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: '500', letterSpacing: '0.04em' }}>{tickerLabels}</span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 10 ? 'rgba(255,255,255,0.97)' : '#fff', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(0,0,0,0.07)', transition: 'all 0.3s' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            <PraironLogo size={28} />
            <span className="sora" style={{ fontSize: '16px', fontWeight: '700', color: '#1a5c3a', letterSpacing: '-0.5px' }}>PRAIRON</span>
          </Link>
          <div className="hide-mob" style={{ display: 'flex', gap: '2px' }}>
            <Link href="/soluciones" className="nav-link">Soluciones</Link>
            <Link href="/precios" className="nav-link">Precios</Link>
            <Link href="/demo" className="nav-link">Demo</Link>
            <a href="#privacidad" className="nav-link">Seguridad</a>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>Prueba gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(155deg,#f0fdf4 0%,#fafaf8 50%,#f0f9ff 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '8%', right: '-6%', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(26,92,58,0.06) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="container" style={{ width: '100%', padding: '60px 24px' }}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '52px', alignItems: 'center' }}>

            <div style={{ animation: 'slideUp 0.7s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#dcfce7', color: '#15803d', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '20px', border: '0.5px solid #bbf7d0' }}>
                <span className="glow" />16 sectores · LATAM
              </div>
              <h1 className="sora" style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.1, letterSpacing: '-2px', color: '#0f1a14', marginBottom: '16px' }}>
                Tu finca, inteligente.<br /><span style={{ color: '#1a5c3a' }}>Toda en un sistema.</span>
              </h1>
              <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.7, marginBottom: '28px', maxWidth: '420px' }}>
                PRAIRON integra ganadería, agricultura, finanzas, trazabilidad y NOAH IA. 16 sectores. Funciona sin internet.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <Link href="/register" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>Comenzar gratis — 14 días</Link>
                <Link href="/demo" className="btn-outline" style={{ fontSize: '15px', padding: '14px 28px' }}>Ver demo en vivo</Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                {['🔒 Datos privados', '📴 Offline-First', '🌎 ES · EN · PT', '✓ Sin tarjeta'].map(b => (
                  <span key={b} style={{ fontSize: '12px', color: '#6b7280' }}>{b}</span>
                ))}
              </div>
            </div>

            {/* DEMO */}
            <div style={{ animation: 'slideUp 0.9s ease both' }}>
              <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.1)', border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ background: '#f3f4f6', padding: '10px 14px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
                  </div>
                  <div style={{ flex: 1, background: '#fff', borderRadius: '4px', padding: '3px 10px', fontSize: '11px', color: '#9ca3af', border: '0.5px solid #e5e7eb' }}>app.prairon.com</div>
                  <span className="glow" />
                </div>
                <div style={{ display: 'flex', height: '380px' }}>
                  <div style={{ width: '140px', background: '#1a5c3a', padding: '12px 0', flexShrink: 0 }}>
                    <div style={{ padding: '6px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PraironLogo size={16} white /><span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>PRAIRON</span>
                    </div>
                    {['Dashboard', 'NOAH IA', 'Finanzas', 'Trazabilidad', 'Animales', 'Cultivos', 'Inventario', 'Tareo'].map((item, i) => (
                      <div key={item} onClick={() => clickDemo(i < 4 ? i : 0)} style={{ padding: '6px 12px', fontSize: '10px', color: i === activeDemo ? '#fff' : 'rgba(255,255,255,0.5)', background: i === activeDemo ? 'rgba(255,255,255,0.13)' : 'transparent', borderLeft: i === activeDemo ? '2px solid #7ed4a0' : '2px solid transparent', fontWeight: i === activeDemo ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}>{item}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: '12px', background: '#fafaf8', overflow: 'hidden' }}>
                    {activeDemo === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ background: '#1a5c3a', color: '#fff', padding: '9px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '600' }}>▦ Vista general</div>
                        {[{ l: 'Ingresos del mes', v: '$48.2M', c: '+12.4%', up: true }, { l: 'Animales activos', v: '1,847', c: '+3.1%', up: true }, { l: 'Tareas pendientes', v: '23', c: '-18%', up: false }, { l: 'Score ODS', v: '74/100', c: '+5pts', up: true }].map(m => (
                          <div key={m.l} style={{ background: '#fff', borderRadius: '6px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.5px solid #e5e7eb' }}>
                            <div><div style={{ fontSize: '9px', color: '#6b7280' }}>{m.l}</div><div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{m.v}</div></div>
                            <div style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '20px', background: m.up ? '#dcfce7' : '#fee2e2', color: m.up ? '#16a34a' : '#dc2626' }}>{m.c}</div>
                          </div>
                        ))}
                        <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: '6px', padding: '8px 10px' }}>
                          <div style={{ fontSize: '9px', fontWeight: '600', color: '#d97706' }}>⚡ NOAH IA</div>
                          <div style={{ fontSize: '10px', color: '#92400e', marginTop: '2px', lineHeight: 1.4 }}>Riesgo fitosanitario Lote 3A — revisar en 48h</div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ background: '#1e40af', color: '#fff', padding: '9px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '600' }}>◈ NOAH IA — Tu asesor 24/7</div>
                        {[{ r: 'user', m: '¿Cómo está la producción de leche?' }, { r: 'noah', m: 'Bajó 4.2% vs. semana anterior. Lote 7 muestra mastitis subclínica en 3 vacas. Revisión veterinaria hoy.' }, { r: 'user', m: '¿Cuándo fertilizar el maíz?' }, { r: 'noah', m: 'En 3-5 días. Humedad 64%, etapa V6, temperatura 22°C — condiciones ideales.' }].map((c, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: c.r === 'user' ? 'row-reverse' : 'row', gap: '5px', alignItems: 'flex-start' }}>
                            {c.r === 'noah' && <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>N</div>}
                            <div style={{ background: c.r === 'user' ? '#1a5c3a' : '#f1f5f9', color: c.r === 'user' ? '#fff' : '#1e293b', padding: '6px 9px', borderRadius: '7px', fontSize: '10px', lineHeight: 1.5, maxWidth: '84%' }}>{c.m}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDemo === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ background: '#7c3aed', color: '#fff', padding: '9px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '600' }}>◎ Rentabilidad por lote</div>
                        {[{ l: 'Maíz — Lote 4B', m: '37%', s: 'good' }, { l: 'Ganadería Norte', m: '29%', s: 'ok' }, { l: 'Palma — Sector C', m: '17%', s: 'warn' }].map(r => (
                          <div key={r.l} style={{ background: '#fff', borderRadius: '6px', padding: '8px 10px', border: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#374151' }}>{r.l}</span>
                            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', background: r.s === 'good' ? '#dcfce7' : r.s === 'ok' ? '#fef9c3' : '#fee2e2', color: r.s === 'good' ? '#16a34a' : r.s === 'ok' ? '#d97706' : '#dc2626' }}>Margen {r.m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDemo === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ background: '#b45309', color: '#fff', padding: '9px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '600' }}>◉ Trazabilidad QR por lote</div>
                        {[{ lote: 'LOT-2026-0847', prod: 'Leche entera', steps: ['Ordeño', 'Enfriamiento', 'Laboratorio', 'Despacho'], done: 4 }, { lote: 'LOT-2026-0831', prod: 'Maíz seco', steps: ['Cosecha', 'Pesaje', 'Secado', 'Almacén'], done: 2 }].map(t => (
                          <div key={t.lote} style={{ background: '#fff', borderRadius: '6px', padding: '8px 10px', border: '0.5px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <div style={{ fontSize: '9px', fontWeight: '600', color: '#b45309' }}>{t.lote}</div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '5px' }}>{t.prod}</div>
                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                              {t.steps.map((s, j) => <span key={s} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '20px', background: j < t.done ? '#dcfce7' : '#f3f4f6', color: j < t.done ? '#16a34a' : '#6b7280', fontWeight: '500' }}>{s}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '9px 12px', background: '#f9fafb', borderTop: '0.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                    {DEMO_TABS.map((t, i) => <button key={t.id} className={`demo-tab${i === activeDemo ? ' active' : ''}`} onClick={() => clickDemo(i)}><span>{t.icon}</span>{t.label}</button>)}
                  </div>
                  <div style={{ height: '2px', background: '#e5e7eb', borderRadius: '1px', overflow: 'hidden' }}>
                    <div key={activeDemo} style={{ height: '100%', background: '#1a5c3a', borderRadius: '1px', animation: 'progressFill 4s linear' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#1a5c3a', padding: '40px 0' }}>
        <div className="container">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-2px' }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORES — 16 */}
      <section style={{ padding: '80px 0', background: '#fafaf8' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="sora" style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '10px' }}>Un sistema para cada industria</h2>
            <p style={{ fontSize: '15px', color: '#6b7280', maxWidth: '460px', margin: '0 auto' }}>16 sectores con módulos específicos — no adaptaciones genéricas.</p>
          </div>
          <div className="sectors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {SECTORES.map((s, i) => (
              <div key={s.key} className="sector-pill" onClick={() => setActiveSector(i)}
                style={{ background: i === activeSector ? s.bg : '#fff', border: i === activeSector ? `1.5px solid ${s.color}40` : '0.5px solid #e5e7eb', transform: i === activeSector ? 'translateY(-3px) scale(1.02)' : '', boxShadow: i === activeSector ? `0 12px 32px ${s.color}18` : '' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: i === activeSector ? s.color : '#374151', marginBottom: i === activeSector ? '7px' : '0' }}>{s.label}</div>
                {i === activeSector && (
                  <>
                    <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: 1.5, marginBottom: '7px' }}>{s.desc}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {s.kpis.map(k => <div key={k} style={{ fontSize: '9px', fontWeight: '600', color: s.color, background: `${s.color}15`, padding: '2px 7px', borderRadius: '4px', display: 'inline-block' }}>{k}</div>)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACIDAD */}
      <section id="privacidad" style={{ background: '#0f1a14', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '16px', border: '0.5px solid rgba(34,197,94,0.2)' }}>🔐 Seguridad y privacidad de datos</div>
            <h2 className="sora" style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '12px' }}>Tu finca, tus datos.<br /><span style={{ color: '#4ade80' }}>Siempre y para siempre.</span></h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>A diferencia de plataformas que usan tus datos para análisis de mercado, PRAIRON tiene una política clara: <strong style={{ color: '#fff' }}>tus datos son exclusivamente tuyos.</strong></p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '32px' }}>
            {TRUST_PILLARS.map(p => (
              <div key={p.title} className="trust-card">
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{p.icon}</div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{p.title}</h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '18px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
            {[['Regulación', 'GDPR compliant'], ['Colombia', 'Habeas Data — Ley 1581'], ['Cifrado', 'AES-256 + TLS 1.3'], ['Servidores', 'LATAM · Redundantes'], ['Auditoría', 'Anual independiente']].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVA */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="sora" style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '10px' }}>PRAIRON vs. el resto</h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Granular, Trimble, FarmLogs — buenos para EE.UU. PRAIRON fue construido para LATAM.</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', background: '#f9fafb', borderRadius: '10px 10px 0 0', padding: '10px 16px', border: '0.5px solid #e5e7eb', borderBottom: 'none' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>CARACTERÍSTICA</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#1a5c3a', textAlign: 'center' }}>PRAIRON</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', textAlign: 'center' }}>Competencia</div>
            </div>
            {COMPARATIVA.map((row, i) => (
              <div key={row} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', padding: '10px 16px', background: '#fff', border: '0.5px solid #e5e7eb', borderTop: 'none', borderRadius: i === COMPARATIVA.length - 1 ? '0 0 10px 10px' : '0' }}>
                <div style={{ fontSize: '12px', color: '#374151' }}>{row}</div>
                <div style={{ textAlign: 'center', color: '#16a34a', fontSize: '14px' }}>✓</div>
                <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '14px' }}>✕</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#1a5c3a 0%,#0f3d26 100%)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><PraironLogo size={48} white /></div>
          <h2 className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '12px' }}>Empieza hoy — gratis por 14 días</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.6 }}>Sin tarjeta. Sin contratos. Onboarding personalizado incluido.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: '#fff', color: '#1a5c3a', padding: '14px 32px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>Crear cuenta gratis</Link>
            <Link href="/demo" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>Ver demo guiado</Link>
          </div>
          <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>🔒 Tus datos son tuyos · Nunca los vendemos · GDPR + Habeas Data Colombia</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a110d', padding: '44px 0 22px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <PraironLogo size={24} white /><span className="sora" style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>PRAIRON</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: '240px' }}>Plataforma agroindustrial con IA para LATAM. 16 sectores en un solo sistema.</p>
              <div style={{ marginTop: '12px', padding: '9px 11px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Protección de datos</div>
                <div style={{ fontSize: '10px', color: '#4ade80', fontWeight: '600' }}>🔐 GDPR · Habeas Data · AES-256</div>
              </div>
            </div>
            {[
              { title: 'Producto', links: ['Soluciones', 'Precios', 'Demo', 'NOAH IA'] },
              { title: 'Industrias', links: ['Ganadería', 'Avicultura', 'Caficultura', 'Cacao', 'Floricultura'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Habeas Data', 'Contacto'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: '6px' }}><Link href="#" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{l}</Link></div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>© 2026 PRAIRON · Hecho en LATAM</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>ES · EN · PT · Colombia · México · Perú · Brasil</div>
          </div>
        </div>
      </footer>
    </>
  )
}
