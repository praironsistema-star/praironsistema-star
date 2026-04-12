'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const ANNOUNCEMENT_CONFIG = {
  enabled: true,
  title: '🎉 Lanzamiento oficial PRAIRON',
  message: '14 días gratis sin tarjeta de crédito · Onboarding personalizado incluido',
  cta: 'Activar prueba gratuita',
  ctaUrl: '/register',
  expires: '2026-09-01',
}

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

const SECTORES = [
  { key:'ganadero',    label:'Ganadería',        icon:'🐄', color:'#d97706', bg:'#fef3e2', desc:'Historial veterinario, producción de leche, trazabilidad individual y alertas de salud en tiempo real.', kpis:['+18% leche/día','-40% tiempo admin.','0 animales sin control'], demo:{ animales:'1,847', leche:'1,240L', ods:'74/100', noah:'Temperatura alta (34°C). Asegura agua fresca en bebederos del lote norte. 2 bovinos requieren revisión.' } },
  { key:'avicola',     label:'Avicultura',       icon:'🐔', color:'#dc2626', bg:'#fef2f2', desc:'Galpones, lotes de engorde o postura, registro diario de mortalidad y alimentación por lote.', kpis:['FCR 1.78','−60% mortalidad','100% trazabilidad'], demo:{ animales:'24,800', leche:'FCR 1.78', ods:'68/100', noah:'Lote 3 muestra conversión por encima del estándar. Revisar formulación de alimento esta semana.' } },
  { key:'palma',       label:'Palma de aceite',  icon:'🌴', color:'#065f46', bg:'#d1fae5', desc:'Lotes FFB, extractora, eficiencia de extracción y análisis de laboratorio en un solo sistema.', kpis:['+22% eficiencia','3 cert. ODS','18.4 FFB/ha/año'], demo:{ animales:'320 ha', leche:'18.4 FFB', ods:'81/100', noah:'Sector B-4 con déficit hídrico leve. Programar riego de apoyo en próximas 72 horas.' } },
  { key:'cafe',        label:'Caficultura',      icon:'☕', color:'#92400e', bg:'#fef3c7', desc:'Floración, cosecha selectiva, beneficio húmedo y análisis de taza para café de especialidad.', kpis:['+30% cosecha selectiva','Trazabilidad por lote','Score taza 84pts'], demo:{ animales:'45 ha', leche:'84 pts taza', ods:'79/100', noah:'Floración secundaria detectada en Lote 2. Momento ideal para abono foliar en 48 horas.' } },
  { key:'cacao',       label:'Cacao',            icon:'🍫', color:'#7c2d12', bg:'#fff7ed', desc:'Control de fermentación, secado, clasificación por calidad y exportación trazada.', kpis:['Fermentación óptima','Clasificación automática','Exportación trazada'], demo:{ animales:'28 ha', leche:'78 pts', ods:'71/100', noah:'Fermentación del lote 7 en día 4. Voltear cajones hoy para perfil de sabor óptimo.' } },
  { key:'arroz',       label:'Arroz',            icon:'🌾', color:'#ca8a04', bg:'#fefce8', desc:'Manejo de láminas de agua, siembra directa o transplante, control de malezas y cosecha mecanizada.', kpis:['Lámina controlada','6.8 t/ha rendimiento','Cosecha mecanizada'], demo:{ animales:'180 ha', leche:'6.8 t/ha', ods:'66/100', noah:'Lámina en bloque C por debajo del óptimo. Abrir compuertas de riego esta tarde.' } },
  { key:'acuicultura', label:'Acuicultura',      icon:'🐟', color:'#0369a1', bg:'#e0f2fe', desc:'Control de densidad, FCR acuícola, calidad de agua y proyección de cosecha.', kpis:['FCR óptimo','+25% supervivencia','Calidad agua 24/7'], demo:{ animales:'12 estanques', leche:'FCR 1.4', ods:'72/100', noah:'Oxígeno disuelto en estanque 4 al 5.8 mg/L. Encender aireador nocturno preventivo.' } },
  { key:'horticola',   label:'Horticultura',     icon:'🥬', color:'#15803d', bg:'#dcfce7', desc:'Ciclos cortos intensivos, control de riego, temperatura, plagas y cosecha escalonada.', kpis:['Ciclos optimizados','Riego automatizado','Cosecha escalonada'], demo:{ animales:'8 invernaderos', leche:'3 ciclos/año', ods:'75/100', noah:'Humedad relativa invernadero 2 al 88%. Riesgo de Botrytis. Activar ventilación.' } },
  { key:'fruticultura',label:'Fruticultura',     icon:'🍓', color:'#be185d', bg:'#fdf2f8', desc:'Fenología por variedad, historial de podas, fertilizaciones y proyección de cosecha por lote.', kpis:['Fenología controlada','Poda trazada','Rendimiento/ha'], demo:{ animales:'60 ha', leche:'18 t/ha', ods:'70/100', noah:'Lote de mora en estado fenológico R3. Poda de formación recomendada esta semana.' } },
  { key:'organica',    label:'Agric. Orgánica',  icon:'🌿', color:'#166534', bg:'#f0fdf4', desc:'Trazabilidad de insumos orgánicos, certificaciones USDA/BCS, historial de aplicaciones y auditorías.', kpis:['Certificación trazada','Cero agroquímicos','Auditoría digital'], demo:{ animales:'35 ha', leche:'Cert. USDA', ods:'92/100', noah:'Periodo de carencia del caldo bordelés cumplido en lote 1. Puede cosechar desde mañana.' } },
  { key:'apicultura',  label:'Apicultura',       icon:'🍯', color:'#d97706', bg:'#fef9c3', desc:'Registro de revisiones, estado de la reina, producción de miel y tratamientos sanitarios.', kpis:['+40% producción/colmena','Varroa bajo control','Trazabilidad miel'], demo:{ animales:'120 colmenas', leche:'28 kg/colmena', ods:'77/100', noah:'Colmena 34 sin postura visible. Revisar estado de reina antes del domingo.' } },
  { key:'cana',        label:'Caña de Azúcar',   icon:'🌾', color:'#15803d', bg:'#dcfce7', desc:'Control de corte, toneladas por hectárea, POL y liquidación directa con el ingenio.', kpis:['TCH óptimo por suerte','Liquidación automática','POL en tiempo real'], demo:{ animales:'240 ha', leche:'POL 14.2%', ods:'69/100', noah:'Suerte 8-A con madurez óptima. Programar corte en los próximos 5 días para máximo POL.' } },
  { key:'floricultura',label:'Floricultura',     icon:'💐', color:'#9333ea', bg:'#faf5ff', desc:'Control de variedades, tallos por cama, punto de corte, postcosecha y exportación.', kpis:['Tallo perfecto 98%','Postcosecha trazada','Exportación a tiempo'], demo:{ animales:'18 invernaderos', leche:'98% calidad', ods:'74/100', noah:'Rosa variedad Freedom en punto de corte 2. Cosechar mañana para exportación del jueves.' } },
  { key:'vivero',      label:'Vivero Palma',     icon:'🌱', color:'#047857', bg:'#ecfdf5', desc:'Control de germinación, etapas de desarrollo, mortalidad en pre-vivero y vivero principal.', kpis:['Germinación 94%','Control por bolsa','Despacho trazado'], demo:{ animales:'180,000 plántulas', leche:'94% germ.', ods:'80/100', noah:'Plántulas en semana 14 muestran amarillamiento en sector C. Aplicar hierro quelado hoy.' } },
  { key:'ganadero2',   label:'Porcicultura',     icon:'��', color:'#be185d', bg:'#fdf2f8', desc:'Control de ciclos reproductivos, pesos por etapa, conversión alimenticia y bioseguridad.', kpis:['CA 2.4 óptimo','Ciclos controlados','Bioseguridad total'], demo:{ animales:'840 cerdos', leche:'CA 2.4', ods:'65/100', noah:'Cerda 112 en celo. Programar monta o inseminación en las próximas 12 horas.' } },
  { key:'mixto',       label:'MIXTO',            icon:'⊞',  color:'#475569', bg:'#f8fafc', desc:'Combina múltiples módulos en una sola finca. Ganadería + cultivos + finanzas integradas.', kpis:['Módulos combinados','Un solo dashboard','Finanzas unificadas'], demo:{ animales:'Multisistema', leche:'—', ods:'76/100', noah:'Resumen semanal listo. Ganadería +3%, Café en floración, Finanzas: flujo positivo $12M.' } },
]

const NOAH_CHATS = [
  { sector:'Ganadero · Hacienda El Progreso, Córdoba', msgs:[
    { r:'user', m:'¿Cómo está la producción de leche esta semana?' },
    { r:'noah', m:'Bajó 4.2% vs. semana anterior. Lote 7 muestra signos de mastitis subclínica en 3 vacas. Recomiendo revisión veterinaria hoy y ajuste de dieta con 200g más de concentrado.' },
    { r:'user', m:'¿Y el Score ODS?' },
    { r:'noah', m:'74/100 — subió 5 puntos este mes. El programa de bienestar animal está funcionando. Próximo paso: registrar los registros de agua para subir otros 3 puntos.' },
  ]},
  { sector:'Caficultor · Finca La Esperanza, Huila', msgs:[
    { r:'user', m:'¿Cuándo hago la próxima fertilización?' },
    { r:'noah', m:'En 8 días. Estás en etapa de llenado de grano — lo ideal es una aplicación foliar con calcio y boro para mejorar el peso del grano. Temperatura proyectada 19°C, ideal.' },
    { r:'user', m:'¿Cómo vienen los precios del café?' },
    { r:'noah', m:'NY cerró a 2.84 USD/libra. Con tu calidad (84 pts taza) puedes negociar prima de especialidad entre 0.30 y 0.55 USD adicionales. ¿Quieres que genere el informe para tu comprador?' },
  ]},
  { sector:'Avicultor · Granja Avícola San Luis, Cundinamarca', msgs:[
    { r:'user', m:'Lote 3 tiene mortalidad alta esta semana' },
    { r:'noah', m:'Detecté el patrón: la mortalidad subió el mismo día que cambió el proveedor de alimento. FCR también bajó de 1.78 a 1.94. Sugiero hacer análisis bromatológico urgente y volver al proveedor anterior mientras tanto.' },
    { r:'user', m:'¿Cuándo es el próximo despacho?' },
    { r:'noah', m:'Lote 3 sale en 11 días con peso proyectado de 2.4 kg. Si la mortalidad no mejora esta semana, el rendimiento baja 3.2%. ¿Activo alerta para el integrador?' },
  ]},
]

const PASOS = [
  { n:'01', title:'Registro en 3 minutos', desc:'Crea tu cuenta, selecciona tus industrias (puedes tener varias) y el sistema configura automáticamente tus módulos. Sin instalaciones, sin IT.' },
  { n:'02', title:'Onboarding guiado por industria', desc:'NOAH te hace 5 preguntas sobre tu finca y construye tu perfil productivo. Ya desde el día 1 tienes dashboards con tus datos reales, no demos vacíos.' },
  { n:'03', title:'Tu finca inteligente desde hoy', desc:'Registra, analiza y toma decisiones con IA. En campo sin internet, PRAIRON sigue funcionando y sincroniza cuando vuelve la señal.' },
]

const TRUST_PILLARS = [
  { icon:'🔐', title:'Cifrado AES-256', desc:'Toda tu información viaja y se almacena con cifrado de nivel bancario. Ni siquiera nosotros accedemos sin tu autorización.' },
  { icon:'🚫', title:'Nunca vendemos tus datos', desc:'Plataformas como Granular usaron datos de farmers para análisis de mercado. PRAIRON jamás comercializa ni comparte tu información.' },
  { icon:'📤', title:'Tus datos, tu control', desc:'Exporta todo en cualquier momento. Solicita eliminación completa — ejecutada en menos de 72 horas.' },
  { icon:'🌍', title:'GDPR + Habeas Data', desc:'Cumplimos Ley 1581 Colombia y GDPR Europa. Auditado anualmente por terceros independientes.' },
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
  'Datos privados — sin venta a terceros',
  'Precio accesible para LATAM',
  'Multi-idioma nativo (ES/EN/PT)',
  'App móvil con modo offline',
]

function AnimatedCounter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const s = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - s) / 2000, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(ease * target * Math.pow(10, decimals)) / Math.pow(10, decimals))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, decimals])
  return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>
}

function AnnouncementModal({ onClose }: { onClose: () => void }) {
  const cfg = ANNOUNCEMENT_CONFIG
  if (!cfg.enabled || new Date(cfg.expires) < new Date()) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn .3s ease' }}>
      <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.3)', animation: 'slideUp .4s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ background: 'linear-gradient(135deg,#1a5c3a,#0f3d26)', padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: "28px", width: "auto", objectFit: "contain" }} /><span style={{ color: "#fff", fontSize: "17px", fontWeight: "800", letterSpacing: "-0.5px" }}>PRAIRON</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: '700', margin: '0 0 8px', lineHeight: 1.3 }}>{cfg.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{cfg.message}</p>
        </div>
        <div style={{ padding: '22px 32px 28px' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a5c3a', letterSpacing: '-1px' }}>14 días gratis</div>
            <div style={{ fontSize: '11px', color: '#4b7a5e', marginTop: '3px' }}>Sin tarjeta de crédito · Cancela cuando quieras</div>
          </div>
          <Link href={cfg.ctaUrl} onClick={onClose} style={{ display: 'block', background: '#1a5c3a', color: '#fff', padding: '13px', borderRadius: '10px', textAlign: 'center', fontWeight: '700', fontSize: '14px', textDecoration: 'none', marginBottom: '10px' }}>{cfg.cta}</Link>
          <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '6px' }}>Continuar sin registrarme</button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const [activeSector, setActiveSector] = useState(0)
  const [activeNoah, setActiveNoah] = useState(0)
  const [noahMsg, setNoahMsg] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [tickerPos, setTickerPos] = useState(0)
  const [demoPulse, setDemoPulse] = useState(false)
  const sectorInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('prairon_ann')) setTimeout(() => setShowModal(true), 1400)
  }, [])

  useEffect(() => {
    sectorInterval.current = setInterval(() => setActiveSector(s => (s + 1) % SECTORES.length), 3200)
    return () => { if (sectorInterval.current) clearInterval(sectorInterval.current) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveNoah(n => (n + 1) % NOAH_CHATS.length), 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setNoahMsg(0)
    const id = setInterval(() => setNoahMsg(m => {
      const max = NOAH_CHATS[activeNoah].msgs.length
      return m < max - 1 ? m + 1 : m
    }), 1800)
    return () => clearInterval(id)
  }, [activeNoah])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    let pos = 0
    const id = setInterval(() => { pos = (pos + 0.35) % 100; setTickerPos(pos) }, 30)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDemoPulse(p => !p), 2000)
    return () => clearInterval(id)
  }, [])

  const closeModal = () => { setShowModal(false); sessionStorage.setItem('prairon_ann', '1') }
  const s = SECTORES[activeSector]
  const chat = NOAH_CHATS[activeNoah]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',sans-serif;background:#0d1f14;color:#fff;-webkit-font-smoothing:antialiased}
        .sora{font-family:'Sora',sans-serif}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .btn-green{background:#22c55e;color:#052e16;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;transition:all .2s;display:inline-block;border:none;cursor:pointer;font-family:'DM Sans',sans-serif}
        .btn-green:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 10px 28px rgba(34,197,94,.35)}
        .btn-ghost{background:rgba(255,255,255,.08);color:#fff;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;border:1px solid rgba(255,255,255,.18);display:inline-block;transition:all .2s}
        .btn-ghost:hover{background:rgba(255,255,255,.14)}
        .nav-link{color:rgba(255,255,255,.75);text-decoration:none;font-size:14px;font-weight:500;padding:7px 14px;border-radius:8px;transition:all .2s}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,.08)}
        .sector-pill{cursor:pointer;transition:all .25s;border-radius:12px;padding:14px;border:0.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
        .sector-pill:hover{background:rgba(255,255,255,.09);transform:translateY(-2px)}
        .msg-bubble{animation:msgIn .35s ease both}
        .container{max-width:1160px;margin:0 auto;padding:0 24px}
        .glow{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(34,197,94,.2);flex-shrink:0}
        .cursor{display:inline-block;width:2px;height:12px;background:#22c55e;margin-left:2px;animation:blink 1s step-end infinite;vertical-align:middle}
        @media(max-width:768px){.hide-mob{display:none!important}.grid-2{grid-template-columns:1fr!important}.sectors-grid{grid-template-columns:repeat(2,1fr)!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}.pasos-grid{grid-template-columns:1fr!important}}
      `}</style>

      {showModal && <AnnouncementModal onClose={closeModal} />}

      {/* TICKER */}
      <div style={{ background: '#052e16', height: '30px', overflow: 'hidden', position: 'relative', borderBottom: '0.5px solid rgba(255,255,255,.06)' }}>
        <div style={{ position: 'absolute', whiteSpace: 'nowrap', transform: `translateX(-${tickerPos}%)`, display: 'flex', gap: '60px', height: '100%', alignItems: 'center' }}>
          {[0, 1, 2].map(rep => (
            <span key={rep} style={{ fontSize: '11px', color: 'rgba(255,255,255,.55)', fontWeight: '500', letterSpacing: '.05em' }}>
              {SECTORES.map(s => `${s.icon} ${s.label}`).join('  ·  ')}
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 20 ? 'rgba(13,31,20,.97)' : 'transparent', backdropFilter: scrollY > 20 ? 'blur(16px)' : 'none', borderBottom: scrollY > 20 ? '0.5px solid rgba(255,255,255,.07)' : 'none', transition: 'all .3s' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '62px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
            <span className="sora" style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>PRAIRON</span>
          </Link>
          <div className="hide-mob" style={{ display: 'flex', gap: '2px' }}>
            <Link href="/soluciones" className="nav-link">Soluciones</Link>
            <Link href="#noah" className="nav-link">NOAH IA</Link>
            <Link href="/precios" className="nav-link">Precios</Link>
            <Link href="/demo" className="nav-link">Demo</Link>
            <a href="#privacidad" className="nav-link">Seguridad</a>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/login" className="nav-link">Ingresar</Link>
            <Link href="/register" className="btn-green" style={{ padding: '9px 18px', fontSize: '13px' }}>Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(160deg,#0d2818 0%,#0d1f14 40%,#051810 100%)', position: 'relative', overflow: 'hidden', paddingTop: '62px' }}>
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(34,197,94,.07) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(26,92,58,.1) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="container" style={{ width: '100%', padding: '70px 24px' }}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

            {/* LEFT */}
            <div style={{ animation: 'fadeInUp .7s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,.12)', color: '#4ade80', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px', border: '0.5px solid rgba(34,197,94,.25)' }}>
                <span className="glow" />Plataforma agroindustrial · 16 sectores · LATAM
              </div>
              <h1 className="sora" style={{ fontSize: '54px', fontWeight: '800', lineHeight: 1.05, letterSpacing: '-2.5px', color: '#fff', marginBottom: '20px' }}>
                El sistema que<br />el agro colombiano<br /><span style={{ color: '#4ade80' }}>necesitaba.</span>
              </h1>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '430px' }}>
                Un solo sistema para toda tu operación. Con <strong style={{ color: '#fff', fontWeight: '600' }}>NOAH</strong>, la IA agroindustrial que conoce tu finca y trabaja contigo 24/7.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link href="/register" className="btn-green">Empezar gratis — sin tarjeta →</Link>
                <Link href="/demo" className="btn-ghost">Ver demo en vivo</Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {[['280K+', 'Productores en Colombia'], ['16', 'Sectores cubiertos'], ['98%', 'Uptime garantizado'], ['14', 'Días gratis']].map(([v, l]) => (
                  <div key={l}>
                    <div className="sora" style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>{v}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', marginTop: '1px' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — DEMO CARD */}
            <div style={{ animation: 'fadeInUp .9s ease both' }}>
              <div style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.1)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
                {/* card header */}
                <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', marginLeft: '4px' }}>app.prairon.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="glow" />
                    <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: '600' }}>NOH activo</span>
                  </div>
                </div>
                {/* greeting */}
                <div style={{ padding: '16px 20px 0', borderBottom: '0.5px solid rgba(255,255,255,.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Buenos días, Carlos</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Hacienda El Progreso · Córdoba</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {SECTORES.slice(0, 4).map((sec, i) => (
                        <div key={sec.key} onClick={() => { setActiveSector(i); if (sectorInterval.current) clearInterval(sectorInterval.current) }}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', background: i === activeSector % 4 ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.06)', border: i === activeSector % 4 ? '0.5px solid rgba(34,197,94,.4)' : '0.5px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', transition: 'all .2s' }}>
                          {sec.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* KPI row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Animales', value: s.demo.animales, color: '#4ade80' },
                      { label: 'Producción', value: s.demo.leche, color: '#60a5fa' },
                      { label: 'Score ODS', value: s.demo.ods, color: '#fbbf24' },
                    ].map(k => (
                      <div key={k.label} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid rgba(255,255,255,.07)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: k.color, letterSpacing: '-0.5px' }}>{k.value}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* NOAH message */}
                <div style={{ padding: '12px 20px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>N</div>
                    <div style={{ background: 'rgba(34,197,94,.08)', border: '0.5px solid rgba(34,197,94,.2)', borderRadius: '10px', padding: '10px 12px', flex: 1 }}>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#4ade80', marginBottom: '4px', letterSpacing: '.04em' }}>NOAH IA</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>{s.demo.noah}<span className="cursor" /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['🔒 Datos privados', '📴 Offline-First', '🌎 ES · EN · PT', '✓ Sin tarjeta'].map(b => (
                  <span key={b} style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.04)', padding: '4px 10px', borderRadius: '20px', border: '0.5px solid rgba(255,255,255,.08)' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ background: '#052e16', padding: '44px 0', borderTop: '0.5px solid rgba(255,255,255,.06)', borderBottom: '0.5px solid rgba(255,255,255,.06)' }}>
        <div className="container">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {[{ v: 280, s: 'K+', l: 'Productores activos', d: 0 }, { v: 16, s: '+', l: 'Sectores productivos', d: 0 }, { v: 99.8, s: '%', l: 'Uptime garantizado', d: 1 }, { v: 14, s: ' días', l: 'Prueba gratuita', d: 0 }].map(item => (
              <div key={item.l} style={{ textAlign: 'center' }}>
                <div className="sora" style={{ fontSize: '40px', fontWeight: '800', color: '#4ade80', letterSpacing: '-2px' }}>
                  <AnimatedCounter target={item.v} suffix={item.s} decimals={item.d} />
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)', marginTop: '3px' }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NOAH IA ═══ */}
      <section id="noah" style={{ padding: '90px 0', background: '#080f0b' }}>
        <div className="container">
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(59,130,246,.12)', color: '#93c5fd', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '20px', border: '0.5px solid rgba(59,130,246,.25)' }}>
                ◈ Inteligencia Artificial Agroindustrial
              </div>
              <h2 className="sora" style={{ fontSize: '40px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
                NOAH — tu asesor<br /><span style={{ color: '#93c5fd' }}>24/7 en campo</span>
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: '28px' }}>
                NOAH no es un chatbot genérico. Conoce tu finca, tu historial, tu clima y tus animales. Responde en lenguaje natural y te da recomendaciones específicas para tu operación.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  'Alertas tempranas de enfermedades y plagas',
                  'Recomendaciones de fertilización por suelo y clima',
                  'Proyecciones de cosecha y análisis de rentabilidad',
                  'Integración con datos climáticos en tiempo real',
                  'Respuestas en español, inglés y portugués',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'rgba(255,255,255,.7)' }}>
                    <span style={{ color: '#4ade80', fontSize: '16px', flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {NOAH_CHATS.map((c, i) => (
                  <button key={i} onClick={() => setActiveNoah(i)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: i === activeNoah ? '#3b82f6' : 'rgba(255,255,255,.07)', color: i === activeNoah ? '#fff' : 'rgba(255,255,255,.5)', transition: 'all .2s' }}>
                    {['Ganadero', 'Caficultor', 'Avicultor'][i]}
                  </button>
                ))}
              </div>
            </div>

            {/* NOAH CHAT */}
            <div>
              <div style={{ background: 'rgba(255,255,255,.03)', border: '0.5px solid rgba(255,255,255,.09)', borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#fff', fontWeight: '800' }}>N</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>NOAH IA</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>{chat.sector}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="glow" /><span style={{ fontSize: '10px', color: '#4ade80' }}>En línea</span>
                  </div>
                </div>
                <div style={{ padding: '16px 18px', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chat.msgs.slice(0, noahMsg + 1).map((msg, i) => (
                    <div key={`${activeNoah}-${i}`} className="msg-bubble" style={{ display: 'flex', flexDirection: msg.r === 'user' ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-start' }}>
                      {msg.r === 'noah' && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>N</div>}
                      <div style={{ background: msg.r === 'user' ? 'rgba(34,197,94,.12)' : 'rgba(255,255,255,.06)', border: `0.5px solid ${msg.r === 'user' ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.08)'}`, padding: '9px 12px', borderRadius: '10px', fontSize: '12px', color: msg.r === 'user' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.8)', lineHeight: 1.55, maxWidth: '85%' }}>
                        {msg.m}{i === noahMsg && msg.r === 'noah' && <span className="cursor" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 18px', borderTop: '0.5px solid rgba(255,255,255,.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '9px 12px', fontSize: '11px', color: 'rgba(255,255,255,.25)' }}>Pregunta algo sobre tu finca...</div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>↑</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 16 SECTORES ═══ */}
      <section style={{ padding: '90px 0', background: '#0d1f14' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '10px' }}>Un sistema para cada industria</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.45)', maxWidth: '480px', margin: '0 auto' }}>16 sectores con módulos específicos construidos desde cero — no adaptaciones genéricas.</p>
          </div>
          <div className="sectors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {SECTORES.map((sec, i) => (
              <div key={sec.key} className="sector-pill" onClick={() => { setActiveSector(i); if (sectorInterval.current) clearInterval(sectorInterval.current) }}
                style={{ background: i === activeSector ? `${sec.color}18` : 'rgba(255,255,255,.03)', border: i === activeSector ? `1px solid ${sec.color}50` : '0.5px solid rgba(255,255,255,.07)', transform: i === activeSector ? 'translateY(-3px)' : '' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{sec.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: i === activeSector ? sec.color : 'rgba(255,255,255,.65)', marginBottom: i === activeSector ? '8px' : '0' }}>{sec.label}</div>
                {i === activeSector && (
                  <>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.45)', lineHeight: 1.5, marginBottom: '8px' }}>{sec.desc}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {sec.kpis.map(k => <div key={k} style={{ fontSize: '9px', fontWeight: '600', color: sec.color, background: `${sec.color}20`, padding: '2px 7px', borderRadius: '4px', display: 'inline-block' }}>{k}</div>)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section style={{ padding: '90px 0', background: '#080f0b' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '10px' }}>Listo en 3 minutos</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.45)', maxWidth: '420px', margin: '0 auto' }}>Sin instalaciones, sin IT, sin esperar semanas de configuración.</p>
          </div>
          <div className="pasos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {PASOS.map((p, i) => (
              <div key={p.n} style={{ background: 'rgba(255,255,255,.03)', border: '0.5px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '18px', fontSize: '40px', fontWeight: '800', color: 'rgba(255,255,255,.04)', fontFamily: 'Sora,sans-serif', letterSpacing: '-2px' }}>{p.n}</div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: i === 0 ? 'rgba(34,197,94,.15)' : i === 1 ? 'rgba(59,130,246,.15)' : 'rgba(168,85,247,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '14px' }}>
                  {['🚀', '🧠', '⚡'][i]}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{p.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', lineHeight: 1.65 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['📴 Sin internet funciona igual', '🔄 Sincronización automática', '📱 iOS y Android disponibles', '🔒 Datos cifrados en campo'].map(b => (
              <span key={b} style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.04)', padding: '6px 14px', borderRadius: '20px', border: '0.5px solid rgba(255,255,255,.07)' }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRIVACIDAD ═══ */}
      <section id="privacidad" style={{ padding: '90px 0', background: '#040a06' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,.08)', color: '#4ade80', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '18px', border: '0.5px solid rgba(34,197,94,.18)' }}>🔐 Seguridad y privacidad de datos</div>
            <h2 className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '14px', lineHeight: 1.1 }}>
              Tu finca, tus datos.<br /><span style={{ color: '#4ade80' }}>Siempre y para siempre.</span>
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Plataformas internacionales usan tu información agrícola para análisis de mercado. PRAIRON tiene una política clara: <strong style={{ color: '#fff' }}>tus datos son exclusivamente tuyos.</strong>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
            {TRUST_PILLARS.map(p => (
              <div key={p.title} style={{ background: 'rgba(255,255,255,.03)', border: '0.5px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '22px 18px', transition: 'all .3s' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{p.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '7px' }}>{p.title}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,.03)', border: '0.5px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '18px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
            {[['GDPR', 'compliant'], ['Colombia', 'Habeas Data — Ley 1581'], ['Cifrado', 'AES-256 + TLS 1.3'], ['Servidores', 'LATAM · Redundantes'], ['Auditoría', 'Anual independiente']].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.28)', marginBottom: '2px' }}>{l}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARATIVA ═══ */}
      <section style={{ padding: '90px 0', background: '#0d1f14' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 className="sora" style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', marginBottom: '10px' }}>PRAIRON vs. el resto</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.45)' }}>Granular, Trimble, FarmLogs — construidos para EE.UU. PRAIRON nació en LATAM, para LATAM.</p>
          </div>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', background: 'rgba(255,255,255,.04)', borderRadius: '10px 10px 0 0', padding: '11px 18px', border: '0.5px solid rgba(255,255,255,.08)', borderBottom: 'none' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.35)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em' }}>Característica</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', textAlign: 'center' }}>PRAIRON</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>Competencia</div>
            </div>
            {COMPARATIVA.map((row, i) => (
              <div key={row} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', padding: '11px 18px', background: i % 2 === 0 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.06)', borderTop: 'none', borderRadius: i === COMPARATIVA.length - 1 ? '0 0 10px 10px' : '0' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)' }}>{row}</div>
                <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '15px', fontWeight: '700' }}>✓</div>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: '15px' }}>✕</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(160deg,#052e16,#0d1f14)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}><img src="/images/logo-white.png" alt="PRAIRON" style={{ height: "52px", width: "auto", objectFit: "contain" }} /></div>
          <h2 className="sora" style={{ fontSize: '44px', fontWeight: '800', color: '#fff', letterSpacing: '-2px', marginBottom: '14px', lineHeight: 1.05 }}>
            Empieza hoy — gratis<br />por 14 días
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.55)', marginBottom: '36px', maxWidth: '400px', margin: '0 auto 36px', lineHeight: 1.6 }}>Sin tarjeta de crédito. Sin contratos. Onboarding personalizado incluido. Cancela cuando quieras.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-green" style={{ fontSize: '16px', padding: '16px 36px' }}>Crear cuenta gratis</Link>
            <Link href="/demo" className="btn-ghost" style={{ fontSize: '16px', padding: '16px 36px' }}>Ver demo guiado</Link>
          </div>
          <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,.28)' }}>🔒 Tus datos son tuyos · Nunca los vendemos · GDPR + Habeas Data Colombia</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#020a04', padding: '50px 0 24px', borderTop: '0.5px solid rgba(255,255,255,.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '36px', marginBottom: '36px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: "24px", width: "auto", objectFit: "contain" }} /><span className="sora" style={{ color: "#fff", fontWeight: "800", fontSize: "15px" }}>PRAIRON</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', lineHeight: 1.7, maxWidth: '260px', marginBottom: '16px' }}>Plataforma agroindustrial con IA para LATAM. 16 sectores. NOAH IA. Funciona sin internet.</p>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.28)', marginBottom: '3px' }}>Protección de datos</div>
                <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: '600' }}>🔐 GDPR · Habeas Data · AES-256</div>
              </div>
            </div>
            {[
              { title: 'Producto', links: ['Soluciones', 'Precios', 'Demo', 'NOAH IA', 'Actualizaciones'] },
              { title: 'Industrias', links: ['Ganadería', 'Caficultura', 'Avicultura', 'Palma', 'Cacao', 'Floricultura'] },
              { title: 'Legal', links: ['Política de Privacidad', 'Términos de uso', 'Habeas Data', 'Seguridad', 'Contacto'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: '7px' }}><Link href="#" style={{ fontSize: '12px', color: 'rgba(255,255,255,.38)', textDecoration: 'none' }}>{l}</Link></div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.22)' }}>© 2026 PRAIRON · Todos los derechos reservados · Hecho en LATAM</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.22)' }}>ES · EN · PT · Colombia · México · Perú · Brasil · Ecuador</div>
          </div>
        </div>
      </footer>
    </>
  )
}
