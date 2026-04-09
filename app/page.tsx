'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const ANNOUNCEMENT_CONFIG = {
  enabled: true,
  title: '🎉 Lanzamiento oficial PRAIRON',
  message: '14 días gratis sin tarjeta de crédito · Onboarding personalizado incluido',
  cta: 'Activar prueba gratuita',
  ctaUrl: '/register',
  expires: '2026-06-01',
}

function PraironLogo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const color = white ? '#ffffff' : '#1a5c3a'
  const accent = white ? '#7ed4a0' : '#2d9e5f'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" fill={color} opacity="0.12"/>
      <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M14 20C14 16.686 16.686 14 20 14C23.314 14 26 16.686 26 20" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2.5" fill={color}/>
      <path d="M20 22.5V28" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const SECTORES = [
  { key: 'ganadero', label: 'Ganadería', color: '#b45309', bg: '#fef3e2', desc: 'Historial veterinario, producción de leche, trazabilidad individual y alertas de salud en tiempo real.', kpis: ['+18% leche/día', '-40% tiempo admin.', '0 animales sin control'], icon: '🐄' },
  { key: 'avicola', label: 'Avicultura', color: '#dc2626', bg: '#fef2f2', desc: 'Galpones, lotes de engorde o postura, registro diario de mortalidad y alimentación por lote.', kpis: ['FCR 1.78 promedio', '-60% mortalidad', '100% trazabilidad'], icon: '🐔' },
  { key: 'palma', label: 'Palma de aceite', color: '#065f46', bg: '#d1fae5', desc: 'Lotes FFB, extractora, eficiencia de extracción y análisis de laboratorio en un solo sistema.', kpis: ['+22% eficiencia ext.', '3 cert. ODS activas', '18.4 FFB/ha/año'], icon: '🌴' },
  { key: 'agricola', label: 'Agricultura', color: '#036446', bg: '#e8f5ef', desc: 'Ciclos de cultivo, control de plagas, recomendaciones IA por tipo de suelo y certificaciones ODS.', kpis: ['Score ODS 74/100', 'Cosecha predicha ±3d', '-30% pérdidas'], icon: '🌽' },
  { key: 'acuicultura', label: 'Acuicultura', color: '#0369a1', bg: '#e0f2fe', desc: 'Control de densidad, FCR acuícola, calidad de agua y proyección de cosecha.', kpis: ['FCR acuícola óptimo', '+25% supervivencia', 'Calidad agua 24/7'], icon: '🐟' },
  { key: 'caficultura', label: 'Caficultura', color: '#92400e', bg: '#fef3c7', desc: 'Floración, cosecha selectiva, beneficio húmedo y análisis de taza para café de especialidad.', kpis: ['Cosecha selectiva +30%', 'Trazabilidad por lote', 'Análisis de taza'], icon: '☕' },
  { key: 'apicultura', label: 'Apicultura', color: '#d97706', bg: '#fef9c3', desc: 'Registro de revisiones, estado de la reina, producción de miel y tratamientos sanitarios.', kpis: ['+40% producción/colmena', 'Varroa bajo control', 'Trazabilidad miel'], icon: '🍯' },
  { key: 'cana', label: 'Caña de Azúcar', color: '#15803d', bg: '#dcfce7', desc: 'Control de corte, toneladas por hectárea, POL y liquidación directa con el ingenio.', kpis: ['TCH óptimo por suerte', 'Liquidación automática', 'POL en tiempo real'], icon: '🌿' },
]

const STATS = [
  { value: 8, suffix: '+', label: 'Sectores productivos' },
  { value: 48, suffix: '', label: 'Módulos integrados' },
  { value: 99.8, suffix: '%', label: 'Uptime garantizado' },
  { value: 14, suffix: '', label: 'Días gratis' },
]

const TRUST_PILLARS = [
  { icon: '🔐', title: 'Cifrado AES-256', desc: 'Toda tu información viaja y se almacena con cifrado de nivel bancario. Ni siquiera nosotros accedemos a tus datos sin tu autorización.' },
  { icon: '🚫', title: 'Nunca vendemos tus datos', desc: 'A diferencia de grandes plataformas que usan la información agrícola para análisis de mercado, PRAIRON jamás comercializa ni comparte tu información.' },
  { icon: '📤', title: 'Tus datos, tu control', desc: 'Exporta toda tu información en cualquier momento. Solicita eliminación completa — ejecutada en menos de 72 horas.' },
  { icon: '🌍', title: 'GDPR + Habeas Data', desc: 'Cumplimos con el Reglamento Europeo de Protección de Datos y la Ley de Habeas Data de Colombia. Auditado anualmente.' },
]

const COMPARATIVA = [
  { feature: 'IA agroindustrial nativa (NOAH)', prairon: true },
  { feature: 'Funciona sin internet (Offline-First)', prairon: true },
  { feature: 'Trazabilidad QR por lote', prairon: true },
  { feature: 'Benchmarking vs. sector', prairon: true },
  { feature: 'Tareo digital de jornaleros', prairon: true },
  { feature: 'ODS y sostenibilidad exportable', prairon: true },
  { feature: '8+ sectores en una plataforma', prairon: true },
  { feature: 'Módulo financiero completo', prairon: true },
  { feature: 'Datos 100% privados — sin venta a terceros', prairon: true },
  { feature: 'Precio accesible para LATAM', prairon: true },
]

const DEMO_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', color: '#1a5c3a' },
  { id: 'noah', label: 'NOAH IA', icon: '◈', color: '#1e40af' },
  { id: 'finance', label: 'Finanzas', icon: '◎', color: '#7c3aed' },
  { id: 'trazabilidad', label: 'Trazabilidad', icon: '◉', color: '#b45309' },
]

function MiniChart({ data, color = '#2d9e5f' }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data)
  const w = 180, h = 44
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*h*0.85-h*0.05}`).join(' ')
  return (
    <svg width={w} height={h} style={{overflow:'visible'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.1"/>
    </svg>
  )
}

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
          const p = Math.min((Date.now()-start)/2000, 1)
          const ease = 1-Math.pow(1-p,3)
          setCount(Math.round(ease*target*10)/10)
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
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',animation:'fadeIn 0.3s ease'}}>
      <div style={{background:'#fff',borderRadius:'20px',maxWidth:'460px',width:'100%',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.25)',animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{background:'#1a5c3a',padding:'32px',textAlign:'center'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'16px'}}>
            <PraironLogo size={34} white/>
            <span style={{color:'#fff',fontSize:'20px',fontWeight:'700',letterSpacing:'-0.5px'}}>PRAIRON</span>
          </div>
          <h2 style={{color:'#fff',fontSize:'22px',fontWeight:'700',margin:'0 0 8px',lineHeight:1.3}}>{cfg.title}</h2>
          <p style={{color:'rgba(255,255,255,0.85)',fontSize:'15px',margin:0,lineHeight:1.5}}>{cfg.message}</p>
        </div>
        <div style={{padding:'24px 32px 32px'}}>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'12px',padding:'16px',marginBottom:'20px',textAlign:'center'}}>
            <div style={{fontSize:'28px',fontWeight:'800',color:'#1a5c3a',letterSpacing:'-1px'}}>14 días gratis</div>
            <div style={{fontSize:'13px',color:'#4b7a5e',marginTop:'4px'}}>Sin tarjeta de crédito · Cancela cuando quieras</div>
          </div>
          <Link href={cfg.ctaUrl} style={{display:'block',background:'#1a5c3a',color:'#fff',padding:'14px',borderRadius:'12px',textAlign:'center',fontWeight:'600',fontSize:'15px',textDecoration:'none',marginBottom:'12px'}} onClick={onClose}>
            {cfg.cta}
          </Link>
          <button onClick={onClose} style={{width:'100%',background:'none',border:'none',color:'#6b7280',fontSize:'13px',cursor:'pointer',padding:'8px'}}>
            Continuar sin registrarme
          </button>
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('prairon_modal')) setTimeout(() => setShowModal(true), 1200)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveSector(s => (s+1) % SECTORES.length), 3500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(() => setActiveDemo(t => (t+1) % DEMO_TABS.length), 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const closeModal = () => { setShowModal(false); sessionStorage.setItem('prairon_modal','1') }

  const clickDemo = (i: number) => {
    setActiveDemo(i)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setActiveDemo(t => (t+1) % DEMO_TABS.length), 4000)
  }

  const navBg = scrollY > 40 ? 'rgba(255,255,255,0.97)' : 'transparent'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',sans-serif;background:#fafaf8;color:#1a1a1a;-webkit-font-smoothing:antialiased}
        .sora{font-family:'Sora',sans-serif}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes progressFill{from{width:0%}to{width:100%}}
        .nav-link{color:#374151;text-decoration:none;font-size:14px;font-weight:500;padding:7px 14px;border-radius:8px;transition:all 0.2s}
        .nav-link:hover{color:#1a5c3a;background:rgba(26,92,58,0.07)}
        .btn-primary{background:#1a5c3a;color:#fff;padding:13px 26px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;display:inline-block;border:none;cursor:pointer;font-family:'DM Sans',sans-serif}
        .btn-primary:hover{background:#166534;transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,92,58,0.3)}
        .btn-outline{background:transparent;color:#1a5c3a;padding:13px 26px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;display:inline-block;border:1.5px solid #1a5c3a}
        .btn-outline:hover{background:#f0fdf4}
        .sector-pill{cursor:pointer;transition:all 0.25s;border:0.5px solid #e5e7eb;border-radius:12px;padding:16px;background:#fff}
        .sector-pill:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.1)}
        .demo-tab{cursor:pointer;padding:7px 13px;border-radius:8px;font-size:12px;font-weight:500;border:none;background:transparent;display:flex;align-items:center;gap:5px;color:#6b7280;transition:all 0.2s;font-family:'DM Sans',sans-serif}
        .demo-tab.active{background:#fff;color:#1a5c3a;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
        .trust-card{background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;transition:all 0.3s}
        .trust-card:hover{background:rgba(255,255,255,0.08);transform:translateY(-3px)}
        .container{max-width:1160px;margin:0 auto;padding:0 24px}
        .glow{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(34,197,94,0.25)}
        @media(max-width:768px){.hide-mob{display:none!important}.grid-2{grid-template-columns:1fr!important}.hero-h1{font-size:36px!important}}
      `}</style>

      {showModal && <AnnouncementModal onClose={closeModal}/>}

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:navBg,backdropFilter:scrollY>40?'blur(12px)':'none',borderBottom:scrollY>40?'0.5px solid rgba(0,0,0,0.07)':'none',transition:'all 0.3s'}}>
        <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:'62px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'9px',textDecoration:'none'}}>
            <PraironLogo size={30}/>
            <span className="sora" style={{fontSize:'17px',fontWeight:'700',color:'#1a5c3a',letterSpacing:'-0.5px'}}>PRAIRON</span>
          </Link>
          <div className="hide-mob" style={{display:'flex',gap:'2px'}}>
            <Link href="/soluciones" className="nav-link">Soluciones</Link>
            <Link href="/precios" className="nav-link">Precios</Link>
            <Link href="/demo" className="nav-link">Demo</Link>
            <a href="#privacidad" className="nav-link">Seguridad</a>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary" style={{padding:'9px 18px',fontSize:'13px'}}>Prueba gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',background:'linear-gradient(155deg,#f0fdf4 0%,#fafaf8 45%,#f0f9ff 100%)',paddingTop:'62px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'10%',right:'-8%',width:'560px',height:'560px',background:'radial-gradient(circle,rgba(26,92,58,0.07) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
        <div className="container" style={{width:'100%',padding:'60px 24px'}}>
          <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'56px',alignItems:'center'}}>

            {/* LEFT */}
            <div style={{animation:'slideUp 0.7s ease both'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'#dcfce7',color:'#15803d',padding:'5px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',marginBottom:'22px',border:'0.5px solid #bbf7d0'}}>
                <span className="glow"/>
                Plataforma agroindustrial · LATAM
              </div>
              <h1 className="sora hero-h1" style={{fontSize:'50px',fontWeight:'800',lineHeight:1.1,letterSpacing:'-2px',color:'#0f1a14',marginBottom:'18px'}}>
                Tu finca, inteligente.<br/>
                <span style={{color:'#1a5c3a'}}>Toda en un sistema.</span>
              </h1>
              <p style={{fontSize:'17px',color:'#4b5563',lineHeight:1.7,marginBottom:'30px',maxWidth:'440px'}}>
                PRAIRON integra ganadería, agricultura, finanzas, trazabilidad y NOAH IA en una sola plataforma. Funciona sin internet.
              </p>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'36px'}}>
                <Link href="/register" className="btn-primary" style={{fontSize:'15px',padding:'14px 28px'}}>Comenzar gratis — 14 días</Link>
                <Link href="/demo" className="btn-outline" style={{fontSize:'15px',padding:'14px 28px'}}>Ver demo en vivo</Link>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'14px'}}>
                {['🔒 Datos 100% privados','📴 Funciona offline','🌎 ES · EN · PT','✓ Sin tarjeta'].map(b=>(
                  <span key={b} style={{fontSize:'12px',color:'#6b7280'}}>{b}</span>
                ))}
              </div>
            </div>

            {/* RIGHT — DEMO */}
            <div style={{animation:'slideUp 0.9s ease both'}}>
              <div style={{background:'#fff',borderRadius:'18px',overflow:'hidden',boxShadow:'0 28px 70px rgba(0,0,0,0.11)',border:'0.5px solid rgba(0,0,0,0.06)'}}>
                {/* browser bar */}
                <div style={{background:'#f3f4f6',padding:'11px 14px',borderBottom:'0.5px solid #e5e7eb',display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{display:'flex',gap:'5px'}}>
                    {['#ef4444','#f59e0b','#22c55e'].map(c=><div key={c} style={{width:'9px',height:'9px',borderRadius:'50%',background:c}}/>)}
                  </div>
                  <div style={{flex:1,background:'#fff',borderRadius:'5px',padding:'4px 10px',fontSize:'11px',color:'#9ca3af',border:'0.5px solid #e5e7eb'}}>app.prairon.com</div>
                  <div className="glow"/>
                </div>
                {/* app shell */}
                <div style={{display:'flex',height:'400px'}}>
                  {/* sidebar */}
                  <div style={{width:'148px',background:'#1a5c3a',padding:'14px 0',flexShrink:0}}>
                    <div style={{padding:'8px 14px',marginBottom:'10px',display:'flex',alignItems:'center',gap:'7px'}}>
                      <PraironLogo size={18} white/>
                      <span style={{color:'#fff',fontSize:'11px',fontWeight:'700'}}>PRAIRON</span>
                    </div>
                    {['Dashboard','NOAH IA','Finanzas','Trazabilidad','Animales','Cultivos','Inventario','Tareo'].map((item,i)=>(
                      <div key={item} onClick={()=>clickDemo(i<4?i:0)} style={{padding:'7px 14px',fontSize:'11px',color:i===activeDemo?'#fff':'rgba(255,255,255,0.55)',background:i===activeDemo?'rgba(255,255,255,0.14)':'transparent',borderLeft:i===activeDemo?'2px solid #7ed4a0':'2px solid transparent',fontWeight:i===activeDemo?'600':'400',cursor:'pointer',transition:'all 0.2s'}}>
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* content */}
                  <div style={{flex:1,padding:'14px',background:'#fafaf8',overflow:'hidden'}}>
                    {activeDemo === 0 && (
                      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{background:DEMO_TABS[0].color,color:'#fff',padding:'10px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>▦ Vista general de la operación</div>
                        {[{l:'Ingresos del mes',v:'$48.2M',c:'+12.4%',up:true},{l:'Animales activos',v:'1,847',c:'+3.1%',up:true},{l:'Tareas pendientes',v:'23',c:'-18%',up:false},{l:'Score ODS',v:'74/100',c:'+5pts',up:true}].map(m=>(
                          <div key={m.l} style={{background:'#fff',borderRadius:'7px',padding:'9px 11px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'0.5px solid #e5e7eb'}}>
                            <div><div style={{fontSize:'9px',color:'#6b7280'}}>{m.l}</div><div style={{fontSize:'15px',fontWeight:'700',color:'#111'}}>{m.v}</div></div>
                            <div style={{fontSize:'10px',fontWeight:'600',padding:'2px 7px',borderRadius:'20px',background:m.up?'#dcfce7':'#fee2e2',color:m.up?'#16a34a':'#dc2626'}}>{m.c}</div>
                          </div>
                        ))}
                        <div style={{background:'#fffbeb',border:'0.5px solid #fcd34d',borderRadius:'7px',padding:'9px 11px'}}>
                          <div style={{fontSize:'9px',fontWeight:'600',color:'#d97706'}}>⚡ NOAH IA</div>
                          <div style={{fontSize:'10px',color:'#92400e',marginTop:'2px',lineHeight:1.4}}>Riesgo fitosanitario en Lote 3A — revisar en 48h</div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 1 && (
                      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{background:DEMO_TABS[1].color,color:'#fff',padding:'10px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>◈ NOAH IA — Tu asesor 24/7</div>
                        {[
                          {r:'user',m:'¿Cómo está la producción de leche esta semana?'},
                          {r:'noah',m:'Bajó 4.2% vs. semana anterior. Lote 7 muestra signos de mastitis subclínica en 3 vacas. Recomiendo revisión veterinaria hoy.'},
                          {r:'user',m:'¿Cuándo aplicar fertilizante en maíz?'},
                          {r:'noah',m:'En 3-5 días. Humedad suelo 64%, etapa V6, temperatura proyectada 22°C — condiciones ideales.'},
                        ].map((c,i)=>(
                          <div key={i} style={{display:'flex',flexDirection:c.r==='user'?'row-reverse':'row',gap:'6px',alignItems:'flex-start'}}>
                            {c.r==='noah'&&<div style={{width:'20px',height:'20px',borderRadius:'50%',background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#fff',fontWeight:'700',flexShrink:0}}>N</div>}
                            <div style={{background:c.r==='user'?'#1a5c3a':'#f1f5f9',color:c.r==='user'?'#fff':'#1e293b',padding:'7px 10px',borderRadius:'8px',fontSize:'10px',lineHeight:1.5,maxWidth:'82%'}}>{c.m}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDemo === 2 && (
                      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{background:DEMO_TABS[2].color,color:'#fff',padding:'10px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>◎ Rentabilidad por lote</div>
                        {[
                          {l:'Maíz — Lote 4B',ing:'$12.4M',cos:'$7.8M',m:'37%',s:'good'},
                          {l:'Ganadería Norte',ing:'$31.2M',cos:'$22.1M',m:'29%',s:'ok'},
                          {l:'Palma — Sector C',ing:'$8.9M',cos:'$7.4M',m:'17%',s:'warn'},
                        ].map(r=>(
                          <div key={r.l} style={{background:'#fff',borderRadius:'7px',padding:'9px 11px',border:'0.5px solid #e5e7eb'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <div style={{fontSize:'10px',fontWeight:'600',color:'#374151'}}>{r.l}</div>
                              <div style={{fontSize:'10px',fontWeight:'700',padding:'2px 7px',borderRadius:'20px',background:r.s==='good'?'#dcfce7':r.s==='ok'?'#fef9c3':'#fee2e2',color:r.s==='good'?'#16a34a':r.s==='ok'?'#d97706':'#dc2626'}}>Margen {r.m}</div>
                            </div>
                            <div style={{display:'flex',gap:'10px',marginTop:'5px'}}>
                              <span style={{fontSize:'9px',color:'#6b7280'}}>Ingresos: <b>{r.ing}</b></span>
                              <span style={{fontSize:'9px',color:'#6b7280'}}>Costos: <b>{r.cos}</b></span>
                            </div>
                          </div>
                        ))}
                        <div style={{background:'#f9fafb',borderRadius:'7px',padding:'9px 11px',border:'0.5px solid #e5e7eb'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                            <span style={{fontSize:'9px',color:'#6b7280'}}>Flujo a 30 días</span>
                            <span style={{fontSize:'13px',fontWeight:'700',color:'#16a34a'}}>+$4.8M</span>
                          </div>
                          <MiniChart data={[30,45,38,52,48,61,58,70]} color="#7c3aed"/>
                        </div>
                      </div>
                    )}
                    {activeDemo === 3 && (
                      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{background:DEMO_TABS[3].color,color:'#fff',padding:'10px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>◉ Trazabilidad QR por lote</div>
                        {[
                          {lote:'LOT-2024-0847',prod:'Leche entera',fecha:'08 Abr 2026',steps:['Ordeño','Enfriamiento','Laboratorio','Despacho'],done:4},
                          {lote:'LOT-2024-0831',prod:'Maíz seco',fecha:'06 Abr 2026',steps:['Cosecha','Pesaje','Secado','Almacén'],done:2},
                        ].map(t=>(
                          <div key={t.lote} style={{background:'#fff',borderRadius:'7px',padding:'9px 11px',border:'0.5px solid #e5e7eb'}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                              <div><div style={{fontSize:'9px',fontWeight:'600',color:'#b45309'}}>{t.lote}</div><div style={{fontSize:'11px',fontWeight:'700'}}>{t.prod}</div></div>
                              <div style={{fontSize:'9px',color:'#6b7280'}}>{t.fecha}</div>
                            </div>
                            <div style={{display:'flex',gap:'3px',flexWrap:'wrap'}}>
                              {t.steps.map((s,j)=>(
                                <span key={s} style={{fontSize:'9px',padding:'2px 7px',borderRadius:'20px',background:j<t.done?'#dcfce7':'#f3f4f6',color:j<t.done?'#16a34a':'#6b7280',fontWeight:'500'}}>{s}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* tabs */}
                <div style={{padding:'10px 14px',background:'#f9fafb',borderTop:'0.5px solid #e5e7eb'}}>
                  <div style={{display:'flex',gap:'3px',marginBottom:'7px'}}>
                    {DEMO_TABS.map((t,i)=>(
                      <button key={t.id} className={`demo-tab${i===activeDemo?' active':''}`} onClick={()=>clickDemo(i)}>
                        <span>{t.icon}</span>{t.label}
                      </button>
                    ))}
                  </div>
                  <div style={{height:'2px',background:'#e5e7eb',borderRadius:'1px',overflow:'hidden'}}>
                    <div key={activeDemo} style={{height:'100%',background:'#1a5c3a',borderRadius:'1px',animation:'progressFill 4s linear'}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{background:'#1a5c3a',padding:'44px 0'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px'}}>
            {STATS.map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div className="sora" style={{fontSize:'40px',fontWeight:'800',color:'#fff',letterSpacing:'-2px'}}>
                  <AnimatedCounter target={s.value} suffix={s.suffix}/>
                </div>
                <div style={{fontSize:'13px',color:'rgba(255,255,255,0.65)',marginTop:'3px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORES */}
      <section style={{padding:'80px 0',background:'#fafaf8'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:'44px'}}>
            <h2 className="sora" style={{fontSize:'36px',fontWeight:'800',letterSpacing:'-1.5px',marginBottom:'10px'}}>Un sistema para cada industria</h2>
            <p style={{fontSize:'16px',color:'#6b7280',maxWidth:'480px',margin:'0 auto'}}>Cada sector tiene su módulo específico construido desde cero — no adaptaciones genéricas.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
            {SECTORES.map((s,i)=>(
              <div key={s.key} className="sector-pill" onClick={()=>setActiveSector(i)} style={{background:i===activeSector?s.bg:'#fff',border:i===activeSector?`1.5px solid ${s.color}35`:'0.5px solid #e5e7eb',transform:i===activeSector?'translateY(-3px) scale(1.02)':'',boxShadow:i===activeSector?`0 14px 36px ${s.color}18`:''}}>
                <div style={{fontSize:'26px',marginBottom:'8px'}}>{s.icon}</div>
                <div style={{fontSize:'12px',fontWeight:'700',color:i===activeSector?s.color:'#374151',marginBottom:i===activeSector?'8px':'0'}}>{s.label}</div>
                {i===activeSector&&(
                  <>
                    <div style={{fontSize:'11px',color:'#6b7280',lineHeight:1.5,marginBottom:'8px'}}>{s.desc}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                      {s.kpis.map(k=><div key={k} style={{fontSize:'10px',fontWeight:'600',color:s.color,background:`${s.color}15`,padding:'2px 8px',borderRadius:'5px',display:'inline-block'}}>{k}</div>)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACIDAD */}
      <section id="privacidad" style={{background:'#0f1a14',padding:'80px 0'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:'44px'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'rgba(34,197,94,0.1)',color:'#4ade80',padding:'5px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',marginBottom:'18px',border:'0.5px solid rgba(34,197,94,0.2)'}}>
              🔐 Seguridad y privacidad de datos
            </div>
            <h2 className="sora" style={{fontSize:'36px',fontWeight:'800',color:'#fff',letterSpacing:'-1.5px',marginBottom:'14px'}}>
              Tu finca, tus datos.<br/><span style={{color:'#4ade80'}}>Siempre y para siempre.</span>
            </h2>
            <p style={{fontSize:'15px',color:'rgba(255,255,255,0.55)',maxWidth:'520px',margin:'0 auto',lineHeight:1.7}}>
              A diferencia de plataformas internacionales que usan tus datos para análisis de mercado, PRAIRON tiene una política clara: <strong style={{color:'#fff'}}>tus datos son exclusivamente tuyos.</strong>
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'36px'}}>
            {TRUST_PILLARS.map(p=>(
              <div key={p.title} className="trust-card">
                <div style={{fontSize:'28px',marginBottom:'12px'}}>{p.icon}</div>
                <h3 style={{fontSize:'14px',fontWeight:'700',color:'#fff',marginBottom:'7px'}}>{p.title}</h3>
                <p style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'20px',display:'flex',flexWrap:'wrap',gap:'28px',alignItems:'center',justifyContent:'center'}}>
            {[['Regulación','GDPR compliant'],['Colombia','Habeas Data — Ley 1581'],['Cifrado','AES-256 + TLS 1.3'],['Servidores','LATAM · Redundantes'],['Auditoría','Anual independiente']].map(([label,val])=>(
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginBottom:'3px'}}>{label}</div>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#4ade80'}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVA */}
      <section style={{padding:'80px 0'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:'44px'}}>
            <h2 className="sora" style={{fontSize:'36px',fontWeight:'800',letterSpacing:'-1.5px',marginBottom:'10px'}}>PRAIRON vs. el resto</h2>
            <p style={{fontSize:'15px',color:'#6b7280'}}>Granular, Trimble, FarmLogs — buenos para EE.UU. PRAIRON fue construido para LATAM.</p>
          </div>
          <div style={{maxWidth:'640px',margin:'0 auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 100px 100px',background:'#f9fafb',borderRadius:'12px 12px 0 0',padding:'11px 18px',border:'0.5px solid #e5e7eb',borderBottom:'none'}}>
              <div style={{fontSize:'11px',color:'#9ca3af',fontWeight:'600'}}>CARACTERÍSTICA</div>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#1a5c3a',textAlign:'center'}}>PRAIRON</div>
              <div style={{fontSize:'11px',fontWeight:'600',color:'#9ca3af',textAlign:'center'}}>Competencia</div>
            </div>
            {COMPARATIVA.map((row,i)=>(
              <div key={row.feature} style={{display:'grid',gridTemplateColumns:'1fr 100px 100px',padding:'12px 18px',background:'#fff',border:'0.5px solid #e5e7eb',borderTop:'none',borderRadius:i===COMPARATIVA.length-1?'0 0 12px 12px':'0'}}>
                <div style={{fontSize:'13px',color:'#374151'}}>{row.feature}</div>
                <div style={{textAlign:'center',color:'#16a34a',fontSize:'15px'}}>✓</div>
                <div style={{textAlign:'center',color:'#d1d5db',fontSize:'15px'}}>✕</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'linear-gradient(135deg,#1a5c3a 0%,#0f3d26 100%)',padding:'80px 0'}}>
        <div className="container" style={{textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'22px'}}>
            <PraironLogo size={52} white/>
          </div>
          <h2 className="sora" style={{fontSize:'40px',fontWeight:'800',color:'#fff',letterSpacing:'-1.5px',marginBottom:'14px'}}>Empieza hoy — gratis por 14 días</h2>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.7)',marginBottom:'32px',maxWidth:'440px',margin:'0 auto 32px',lineHeight:1.6}}>Sin tarjeta. Sin contratos. Onboarding personalizado incluido.</p>
          <div style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/register" style={{background:'#fff',color:'#1a5c3a',padding:'15px 34px',borderRadius:'11px',fontWeight:'700',fontSize:'15px',textDecoration:'none'}}>Crear cuenta gratis</Link>
            <Link href="/demo" style={{background:'rgba(255,255,255,0.1)',color:'#fff',padding:'15px 34px',borderRadius:'11px',fontWeight:'600',fontSize:'15px',textDecoration:'none',border:'1px solid rgba(255,255,255,0.25)'}}>Ver demo guiado</Link>
          </div>
          <p style={{marginTop:'18px',fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>🔒 Tus datos son tuyos · Nunca los vendemos · GDPR + Habeas Data Colombia</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0a110d',padding:'44px 0 22px'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'36px',marginBottom:'36px'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                <PraironLogo size={26} white/>
                <span className="sora" style={{color:'#fff',fontWeight:'700',fontSize:'15px'}}>PRAIRON</span>
              </div>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.38)',lineHeight:1.7,maxWidth:'260px'}}>Plataforma agroindustrial con IA para LATAM. Ganadería, agricultura, finanzas y trazabilidad en un solo sistema.</p>
              <div style={{marginTop:'14px',padding:'10px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'8px',border:'0.5px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginBottom:'3px'}}>Protección de datos</div>
                <div style={{fontSize:'11px',color:'#4ade80',fontWeight:'600'}}>🔐 GDPR · Habeas Data · AES-256</div>
              </div>
            </div>
            {[
              {title:'Producto',links:['Soluciones','Precios','Demo','NOAH IA','Actualizaciones']},
              {title:'Industrias',links:['Ganadería','Avicultura','Palma de Aceite','Caficultura','Acuicultura']},
              {title:'Legal',links:['Política de Privacidad','Términos de uso','Habeas Data','Seguridad','Contacto']},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)',fontWeight:'600',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{col.title}</div>
                {col.links.map(l=>(
                  <div key={l} style={{marginBottom:'7px'}}>
                    <Link href="#" style={{fontSize:'12px',color:'rgba(255,255,255,0.45)',textDecoration:'none'}}>{l}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:'0.5px solid rgba(255,255,255,0.07)',paddingTop:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)'}}>© 2026 PRAIRON · Todos los derechos reservados · Hecho en LATAM</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)'}}>ES · EN · PT · Colombia · México · Perú · Brasil</div>
          </div>
        </div>
      </footer>
    </>
  )
}
