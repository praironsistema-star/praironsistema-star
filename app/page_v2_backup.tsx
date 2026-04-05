'use client'
import Link from 'next/link'
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Landing PRAIRON — Rediseñada con 4 verticales
// Ganadería · Avicultura · Palma · Agricultura
// ─────────────────────────────────────────────────────────────────────────────

const VERTICALS = [
  {
    key: 'ganadero', label: 'Ganadería', icon: '🐄', color: '#b45309', bg: '#fef3e2', light: '#fffbeb',
    headline: 'Control total del hato bovino',
    desc: 'Historial veterinario, producción de leche, trazabilidad individual y alertas de salud en tiempo real.',
    kpis: [
      { label: 'Animales', value: '342', unit: 'bovinos' },
      { label: 'Leche/día', value: '1,240', unit: 'litros' },
      { label: 'Saludables', value: '94', unit: '%' },
    ],
    features: ['Historial vet. por animal', 'Registro de partos', 'Vacunación programada', 'Producción leche diaria'],
  },
  {
    key: 'avicola', label: 'Avicultura', icon: '🐔', color: '#dc2626', bg: '#fef2f2', light: '#fff5f5',
    headline: 'FCR, mortalidad y conversión alimenticia',
    desc: 'Galpones, lotes de engorde o postura, registro diario de mortalidad y alimentación por lote.',
    kpis: [
      { label: 'Aves activas', value: '48,000', unit: 'aves' },
      { label: 'FCR promedio', value: '1.82', unit: 'kg/kg' },
      { label: 'Mortalidad', value: '2.1', unit: '%' },
    ],
    features: ['Galpones y capacidad', 'Registro mortalidad diaria', 'Consumo alimento/lote', 'KPIs por ciclo'],
  },
  {
    key: 'palma', label: 'Palma de aceite', icon: '🌴', color: '#065f46', bg: '#d1fae5', light: '#f0fdf4',
    headline: 'De la palma al aceite — trazabilidad completa',
    desc: 'Lotes FFB, extractora, eficiencia de extracción y análisis de laboratorio en un solo sistema.',
    kpis: [
      { label: 'FFB/ha/año', value: '18.4', unit: 'ton' },
      { label: 'Eficiencia ext.', value: '22.3', unit: '%' },
      { label: 'Lotes activos', value: '12', unit: 'lotes' },
    ],
    features: ['Cosecha FFB por lote', 'Trazabilidad extractora', 'Análisis de laboratorio', 'Vivero y semilleros'],
  },
  {
    key: 'agricola', label: 'Agricultura', icon: '🌽', color: '#036446', bg: '#e8f5ef', light: '#f0fdf4',
    headline: 'Cultivos, ODS y predicción de cosecha',
    desc: 'Ciclos de cultivo, control de plagas, recomendaciones IA por tipo de suelo y certificaciones ODS.',
    kpis: [
      { label: 'Cultivos activos', value: '8', unit: 'lotes' },
      { label: 'Score ODS', value: '74', unit: '/100' },
      { label: 'Cosecha en', value: '12', unit: 'días' },
    ],
    features: ['Ciclos de siembra/cosecha', 'Control de plagas IA', 'ODS por tipo de cultivo', 'Recomendaciones NOH'],
  },
]

const STATS = [
  { value: '4', label: 'sectores cubiertos' },
  { value: '14', label: 'días gratis' },
  { value: '98%', label: 'uptime garantizado' },
  { value: 'NOH', label: 'IA agroindustrial' },
]


const CASOS = [
  {
    name: 'Carlos Restrepo', location: 'Córdoba', sector: 'Ganadería', icon: '🐄', color: '#b45309', bg: '#fef3e2',
    quote: 'Antes llevaba todo en libretas. Ahora NOH me avisa cuando un animal necesita atención antes de que yo lo note.',
    metrics: [{ value: '+18%', label: 'Leche/día' }, { value: '-40%', label: 'Tiempo admin.' }],
  },
  {
    name: 'Familia Martínez', location: 'Santander', sector: 'Avicultura', icon: '🐔', color: '#dc2626', bg: '#fef2f2',
    quote: 'El FCR mejoró desde que registramos el consumo diario. PRAIRON nos mostró qué galpones estaban fallando.',
    metrics: [{ value: '1.78', label: 'FCR óptimo' }, { value: '-60%', label: 'Mortalidad' }],
  },
  {
    name: 'Palmares del Norte', location: 'Meta', sector: 'Palma', icon: '🌴', color: '#065f46', bg: '#d1fae5',
    quote: 'La trazabilidad ODS nos abrió puertas con compradores europeos. Vale mucho más que el precio del plan.',
    metrics: [{ value: '+22%', label: 'Eficiencia ext.' }, { value: '3', label: 'Cert. activas' }],
  },
]

const COMPARATIVA = [
  { feature: 'IA agroindustrial nativa (NOH)', prairon: true,  agroapp: false, excel: false },
  { feature: 'Dashboard adaptativo por sector', prairon: true,  agroapp: false, excel: false },
  { feature: 'Trazabilidad ODS exportable',    prairon: true,  agroapp: false, excel: false },
  { feature: 'Análisis de imágenes de plagas', prairon: true,  agroapp: false, excel: false },
  { feature: 'Calendario agrícola integrado',  prairon: true,  agroapp: true,  excel: false },
  { feature: 'Control de inventario',          prairon: true,  agroapp: true,  excel: true  },
  { feature: 'Módulo financiero / contador',   prairon: true,  agroapp: false, excel: true  },
  { feature: 'Alertas automáticas',            prairon: true,  agroapp: true,  excel: false },
  { feature: 'App instalable (PWA)',           prairon: true,  agroapp: false, excel: false },
  { feature: 'API pública documentada',        prairon: true,  agroapp: false, excel: false },
]

function RoiCalculator() {
  const [hectareas,  setHectareas]  = useState('100')
  const [animales,   setAnimales]   = useState('150')
  const [trabajadores, setTrabajadores] = useState('5')
  const [sector,     setSector]     = useState('ganadero')

  const h = parseFloat(hectareas) || 0
  const a = parseFloat(animales) || 0
  const t = parseFloat(trabajadores) || 0

  const ahorro_tiempo  = Math.round(t * 2.5 * 52)
  const ahorro_perdida = sector === 'ganadero' ? Math.round(a * 12) : sector === 'avicola' ? Math.round(a * 0.8) : Math.round(h * 45)
  const ahorro_total   = ahorro_tiempo + ahorro_perdida
  const roi_meses      = ahorro_total > 0 ? Math.max(1, Math.round(89 * 12 / ahorro_total * 10) / 10) : 0

  const inp2: React.CSSProperties = { border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', outline:'none', width:'100%', fontFamily:'inherit', background:'#f9f9f7' }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>
      <div style={{ background:'#f9f9f7', border:'0.5px solid #e5e5e3', borderRadius:'14px', padding:'24px' }}>
        <div style={{ fontSize:'12px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.06em', marginBottom:'16px' }}>TU OPERACIÓN</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>SECTOR</label>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp2, cursor:'pointer' }}>
              <option value="ganadero">Ganadería</option>
              <option value="avicola">Avicultura</option>
              <option value="palma">Palma de aceite</option>
              <option value="agricola">Agricultura</option>
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>HECTÁREAS TOTALES</label>
            <input type="number" value={hectareas} onChange={e => setHectareas(e.target.value)} style={inp2} min="1" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{sector === 'avicola' ? 'AVES TOTALES' : 'ANIMALES TOTALES'}</label>
            <input type="number" value={animales} onChange={e => setAnimales(e.target.value)} style={inp2} min="0" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TRABAJADORES</label>
            <input type="number" value={trabajadores} onChange={e => setTrabajadores(e.target.value)} style={inp2} min="1" />
          </div>
        </div>
      </div>
      <div style={{ background:'#036446', borderRadius:'14px', padding:'24px', color:'white' }}>
        <div style={{ fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.6)', letterSpacing:'.06em', marginBottom:'16px' }}>TU AHORRO ESTIMADO CON PRAIRON</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'10px', padding:'14px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginBottom:'4px' }}>Ahorro en tiempo administrativo/año</div>
            <div style={{ fontSize:'28px', fontWeight:'600', fontFamily:'monospace' }}>${ahorro_tiempo.toLocaleString()} USD</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginTop:'2px' }}>{t} personas × 2.5h/sem × 52 semanas × $20/h</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'10px', padding:'14px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginBottom:'4px' }}>Reducción de pérdidas por falta de trazabilidad</div>
            <div style={{ fontSize:'28px', fontWeight:'600', fontFamily:'monospace' }}>${ahorro_perdida.toLocaleString()} USD</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'14px', border:'1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', marginBottom:'4px' }}>AHORRO TOTAL ANUAL</div>
            <div style={{ fontSize:'36px', fontWeight:'700', fontFamily:'monospace' }}>${ahorro_total.toLocaleString()} USD</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', marginTop:'4px' }}>Recuperas la inversión en {roi_meses} meses</div>
          </div>
        </div>
        <a href="/register" style={{ display:'block', textAlign:'center', padding:'12px', background:'white', color:'#036446', borderRadius:'8px', fontSize:'13px', fontWeight:'600', textDecoration:'none' }}>
          Empezar ahora — 14 días gratis →
        </a>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeVertical, setActiveVertical] = useState('ganadero')
  const vertical = VERTICALS.find(v => v.key === activeVertical)!

  return (
    <div style={{ fontFamily:'Figtree, system-ui, sans-serif', color:'#1a1a18', background:'#ffffff' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fadein{animation:fadein .3s ease both;}
        .noh-float{animation:float 3s ease-in-out infinite;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-size:14px;color:#6b6b67;transition:color .15s;cursor:pointer;}
        .nav-link:hover{color:#036446;}
        .vert-btn{transition:all .15s;cursor:pointer;border:none;font-family:inherit;}
        .vert-btn:hover{transform:translateY(-1px);}
        .feat-item{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:0.5px solid rgba(0,0,0,0.06);}
        .feat-item:last-child{border-bottom:none;}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)', borderBottom:'0.5px solid #e5e5e3', padding:'0 40px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'28px', height:'28px', background:'#036446', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'white', fontSize:'12px', fontWeight:'700' }}>P</span>
          </div>
          <span style={{ fontSize:'16px', fontWeight:'600', letterSpacing:'0.05em', color:'#036446' }}>PRAIRON</span>
          <span style={{ fontSize:'10px', color:'#9b9b97', marginLeft:'2px' }}>Agroindustrial OS</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'28px' }}>
          <a href="#sectores" className="nav-link">Sectores</a>
          <a href="#noh" className="nav-link">NOH IA</a>
          <Link href="/precios" className="nav-link">Precios</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Link href="/login" style={{ fontSize:'14px', color:'#6b6b67', padding:'8px 16px' }}>Ingresar</Link>
          <Link href="/register" style={{ fontSize:'13px', fontWeight:'500', padding:'9px 20px', background:'#036446', color:'white', borderRadius:'8px' }}>Empezar gratis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'80px 40px 60px', maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', maxWidth:'720px', margin:'0 auto 56px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 14px', background:'#e8f5ef', borderRadius:'20px', marginBottom:'24px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#0dac5e' }} />
            <span style={{ fontSize:'12px', fontWeight:'500', color:'#036446' }}>Ganadería · Avicultura · Palma · Agricultura</span>
          </div>
          <h1 style={{ fontSize:'52px', fontWeight:'600', lineHeight:1.1, color:'#1a1a18', marginBottom:'20px' }}>
            El OS de la<br /><span style={{ color:'#036446' }}>agroindustria colombiana</span>
          </h1>
          <p style={{ fontSize:'18px', color:'#6b6b67', lineHeight:1.7, marginBottom:'32px' }}>
            Un solo sistema para ganadería, avicultura, palma de aceite y agricultura. Con NOH, la IA agroindustrial que conoce tu operación.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/register" style={{ fontSize:'15px', fontWeight:'500', padding:'13px 28px', background:'#036446', color:'white', borderRadius:'10px' }}>
              Comenzar gratis — sin tarjeta
            </Link>
            <Link href="/demo" style={{ fontSize:'15px', padding:'13px 24px', border:'0.5px solid #e5e5e3', borderRadius:'10px', color:'#6b6b67' }}>
              Ver demo en vivo →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:'40px', justifyContent:'center', flexWrap:'wrap', marginBottom:'56px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'28px', fontWeight:'600', color:'#036446', fontFamily:'monospace' }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Vertical selector */}
        <div id="sectores">
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginBottom:'24px' }}>
            {VERTICALS.map(v => (
              <button key={v.key} className="vert-btn" onClick={() => setActiveVertical(v.key)}
                style={{ padding:'10px 20px', borderRadius:'20px', fontSize:'13px', fontWeight: activeVertical===v.key ? '500' : '400', background: activeVertical===v.key ? v.bg : '#f9f9f7', color: activeVertical===v.key ? v.color : '#6b6b67', border: `1.5px solid ${activeVertical===v.key ? v.color+'60' : '#e5e5e3'}` }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Vertical demo panel */}
          <div className="fadein" key={activeVertical} style={{ background:`linear-gradient(135deg, ${vertical.light} 0%, #fff 60%)`, border:`1px solid ${vertical.color}30`, borderRadius:'20px', padding:'32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 12px', background:vertical.bg, borderRadius:'20px', marginBottom:'16px' }}>
                <span style={{ fontSize:'16px' }}>{vertical.icon}</span>
                <span style={{ fontSize:'11px', fontWeight:'600', color:vertical.color, letterSpacing:'.06em' }}>{vertical.label.toUpperCase()}</span>
              </div>
              <h2 style={{ fontSize:'28px', fontWeight:'600', color:'#1a1a18', marginBottom:'12px', lineHeight:1.2 }}>{vertical.headline}</h2>
              <p style={{ fontSize:'14px', color:'#6b6b67', lineHeight:1.7, marginBottom:'24px' }}>{vertical.desc}</p>
              <div style={{ marginBottom:'24px' }}>
                {vertical.features.map(f => (
                  <div key={f} className="feat-item">
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:vertical.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'10px', color:vertical.color }}>✓</span>
                    </div>
                    <span style={{ fontSize:'13px', color:'#1a1a18' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ display:'inline-block', padding:'10px 24px', background:vertical.color, color:'white', borderRadius:'8px', fontSize:'13px', fontWeight:'500' }}>
                Empezar con {vertical.label} →
              </Link>
            </div>

            {/* KPI cards */}
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
                {vertical.kpis.map(k => (
                  <div key={k.label} style={{ background:'#fff', border:`0.5px solid ${vertical.color}30`, borderRadius:'12px', padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:'600', color:vertical.color, fontFamily:'monospace', lineHeight:1 }}>{k.value}</div>
                    <div style={{ fontSize:'10px', color:'#9b9b97', marginTop:'2px' }}>{k.unit}</div>
                    <div style={{ fontSize:'11px', color:'#6b6b67', marginTop:'4px', fontWeight:'500' }}>{k.label}</div>
                  </div>
                ))}
              </div>
              {/* Mini dashboard preview */}
              <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'12px', padding:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:vertical.color }} />
                  <span style={{ fontSize:'11px', fontWeight:'500', color:'#1a1a18' }}>NOH recomienda</span>
                </div>
                <div style={{ fontSize:'12px', color:'#6b6b67', lineHeight:1.6, padding:'10px', background:vertical.bg, borderRadius:'8px', marginBottom:'10px' }}>
                  {vertical.key === 'ganadero' && '"Temperatura alta hoy (34°C). Asegura agua fresca en bebederos y reduce estrés del hato."'}
                  {vertical.key === 'avicola' && '"El lote 3 tiene FCR de 2.1, por encima del óptimo. Revisa densidad del galpón y ventilación."'}
                  {vertical.key === 'palma' && '"Lote Norte tiene rendimiento 15% bajo el promedio. Recomiendo análisis foliar urgente."'}
                  {vertical.key === 'agricola' && '"Cosecha de Maíz Lote Norte en 12 días. Prepara equipo y coordina transporte."'}
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <div style={{ flex:1, height:'4px', background:vertical.color, borderRadius:'2px', opacity:0.8 }} />
                  <div style={{ flex:1, height:'4px', background:vertical.bg, borderRadius:'2px' }} />
                  <div style={{ flex:1, height:'4px', background:vertical.bg, borderRadius:'2px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOH SECTION */}
      <section id="noh" style={{ background:'#036446', padding:'80px 40px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'12px', fontWeight:'500', color:'#0dac5e', letterSpacing:'.1em', marginBottom:'16px' }}>INGENIERO NOH — IA AGROINDUSTRIAL</div>
            <h2 style={{ fontSize:'36px', fontWeight:'600', color:'white', marginBottom:'20px', lineHeight:1.2 }}>Tu asesor experto disponible 24/7</h2>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:'28px' }}>
              NOH conoce tu operación, tus datos y tu sector. No es un chatbot genérico — es un ingeniero agrónomo digital entrenado para ganadería, avicultura, palma y agricultura colombiana.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {['Memoria de conversación', 'Contexto de pantalla', 'Análisis de imágenes', 'Predicción de cosecha', 'Voz en español', 'Alertas automáticas'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px', background:'rgba(255,255,255,0.1)', borderRadius:'8px' }}>
                  <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#0dac5e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:'white', fontSize:'9px' }}>✓</span>
                  </div>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'16px', padding:'24px', border:'0.5px solid rgba(255,255,255,0.2)' }}>
            {[
              { from:'noh', text:'Detecté mortalidad alta en Galpón 3 — 2.8% esta semana vs 1.2% la anterior. ¿Quieres que revise las causas?' },
              { from:'user', text:'Sí, y dime qué hacer con la ventilación' },
              { from:'noh', text:'La temperatura interna del galpón supera 32°C. Activa ventiladores adicionales y reduce densidad. Te mando el protocolo completo.' },
            ].map((msg, i) => (
              <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'14px', flexDirection: msg.from==='user' ? 'row-reverse' : 'row' }}>
                <div style={{ width:'30px', height:'30px', borderRadius:'50%', background: msg.from==='noh' ? '#0dac5e' : 'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'600', color:'white', flexShrink:0 }}>
                  {msg.from==='noh' ? 'N' : 'C'}
                </div>
                <div style={{ background: msg.from==='noh' ? 'rgba(255,255,255,0.15)' : 'white', borderRadius: msg.from==='noh' ? '12px 12px 12px 4px' : '12px 12px 4px 12px', padding:'10px 14px', fontSize:'13px', color: msg.from==='noh' ? 'white' : '#1a1a18', lineHeight:1.5, maxWidth:'260px' }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES RAPIDOS */}
      <section style={{ padding:'80px 40px', background:'#f9f9f7', borderTop:'0.5px solid #e5e5e3' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446', letterSpacing:'.1em', marginBottom:'12px' }}>PRECIOS SIMPLES</div>
          <h2 style={{ fontSize:'36px', fontWeight:'600', color:'#1a1a18', marginBottom:'40px' }}>Empieza gratis, escala cuando quieras</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
            {[
              { name:'Starter', price:'$29', desc:'/mes · 1 finca · 3 usuarios', features:['Módulos básicos','NOH asistente','Soporte email'], cta:'Empezar gratis', highlight:false },
              { name:'Pro', price:'$89', desc:'/mes · 5 fincas · 15 usuarios', features:['Todos los módulos','NOH premium','Reportes PDF','Soporte prioritario'], cta:'Prueba 14 días', highlight:true },
              { name:'Enterprise', price:'A medida', desc:'Fincas y usuarios ilimitados', features:['API personalizada','Integración ERP','SLA garantizado','Onboarding dedicado'], cta:'Contactar', highlight:false },
            ].map(p => (
              <div key={p.name} style={{ background: p.highlight ? '#036446' : '#fff', border: p.highlight ? 'none' : '0.5px solid #e5e5e3', borderRadius:'16px', padding:'24px', position:'relative', boxShadow: p.highlight ? '0 20px 60px rgba(3,100,70,0.25)' : 'none' }}>
                {p.highlight && <div style={{ position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', background:'#0dac5e', color:'white', fontSize:'10px', fontWeight:'500', padding:'3px 12px', borderRadius:'20px' }}>Más popular</div>}
                <div style={{ fontSize:'20px', fontWeight:'600', color: p.highlight ? 'white' : '#036446', marginBottom:'4px', fontFamily:'monospace' }}>{p.price}</div>
                <div style={{ fontSize:'11px', color: p.highlight ? 'rgba(255,255,255,0.6)' : '#9b9b97', marginBottom:'16px' }}>{p.desc}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ fontSize:'12px', color: p.highlight ? 'rgba(255,255,255,0.85)' : '#6b6b67', display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ color: p.highlight ? '#0dac5e' : '#036446' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" style={{ display:'block', textAlign:'center', padding:'10px', background: p.highlight ? 'white' : '#036446', color: p.highlight ? '#036446' : 'white', borderRadius:'8px', fontSize:'13px', fontWeight:'500' }}>{p.cta}</Link>
              </div>
            ))}
          </div>
          <Link href="/precios" style={{ fontSize:'13px', color:'#036446', fontWeight:'500' }}>Ver todos los detalles de precios →</Link>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background:'#024d36', padding:'80px 40px', textAlign:'center' }}>
        <div style={{ maxWidth:'560px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'36px', fontWeight:'600', color:'white', marginBottom:'16px', lineHeight:1.2 }}>Tu operación merece tecnología de clase mundial</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', marginBottom:'32px', lineHeight:1.7 }}>14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
            <Link href="/register" style={{ fontSize:'15px', fontWeight:'500', padding:'13px 32px', background:'white', color:'#036446', borderRadius:'10px' }}>Comenzar gratis ahora</Link>
            <Link href="/demo" style={{ fontSize:'15px', padding:'13px 24px', border:'0.5px solid rgba(255,255,255,0.3)', borderRadius:'10px', color:'rgba(255,255,255,0.85)' }}>Ver demo →</Link>
          </div>
        </div>
      </section>


      {/* CALCULADORA DE ROI */}
      <section style={{ padding:'80px 40px', background:'#fff', borderTop:'0.5px solid #e5e5e3' }}>
        <div style={{ maxWidth:'860px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446', letterSpacing:'.1em', marginBottom:'12px' }}>CALCULADORA DE ROI</div>
            <h2 style={{ fontSize:'34px', fontWeight:'600', color:'#1a1a18', marginBottom:'12px', lineHeight:1.2 }}>¿Cuánto ahorra tu operación con PRAIRON?</h2>
            <p style={{ fontSize:'15px', color:'#6b6b67', lineHeight:1.7 }}>Ingresa los datos de tu finca y calcula tu retorno en 30 segundos.</p>
          </div>
          <RoiCalculator />
        </div>
      </section>

      {/* CASOS DE ÉXITO */}
      <section style={{ padding:'80px 40px', background:'#f9f9f7', borderTop:'0.5px solid #e5e5e3' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446', letterSpacing:'.1em', marginBottom:'12px' }}>CASOS DE ÉXITO</div>
            <h2 style={{ fontSize:'34px', fontWeight:'600', color:'#1a1a18', lineHeight:1.2 }}>Productores que ya confían en PRAIRON</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {CASOS.map(c => (
              <div key={c.name} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'16px', padding:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'#1a1a18' }}>{c.name}</div>
                    <div style={{ fontSize:'11px', color:'#9b9b97' }}>{c.location} · {c.sector}</div>
                  </div>
                </div>
                <div style={{ fontSize:'13px', color:'#6b6b67', lineHeight:1.6, marginBottom:'16px', fontStyle:'italic' }}>"{c.quote}"</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  {c.metrics.map(m => (
                    <div key={m.label} style={{ background:c.bg, borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                      <div style={{ fontSize:'18px', fontWeight:'600', color:c.color, fontFamily:'monospace' }}>{m.value}</div>
                      <div style={{ fontSize:'10px', color:c.color, opacity:0.8, marginTop:'2px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVA VS COMPETIDORES */}
      <section style={{ padding:'80px 40px', background:'#fff', borderTop:'0.5px solid #e5e5e3' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446', letterSpacing:'.1em', marginBottom:'12px' }}>POR QUÉ PRAIRON</div>
            <h2 style={{ fontSize:'34px', fontWeight:'600', color:'#1a1a18', lineHeight:1.2 }}>La única plataforma diseñada para el agro colombiano</h2>
          </div>
          <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'16px', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                  <th style={{ padding:'14px 20px', textAlign:'left', fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.06em' }}>FUNCIONALIDAD</th>
                  <th style={{ padding:'14px 20px', textAlign:'center', fontSize:'12px', fontWeight:'700', color:'#036446' }}>PRAIRON</th>
                  <th style={{ padding:'14px 20px', textAlign:'center', fontSize:'12px', fontWeight:'500', color:'#9b9b97' }}>Agroapp</th>
                  <th style={{ padding:'14px 20px', textAlign:'center', fontSize:'12px', fontWeight:'500', color:'#9b9b97' }}>Excel / Papel</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom:'0.5px solid #f0f0ee', background: i%2===0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding:'12px 20px', color:'#1a1a18', fontWeight:'500' }}>{row.feature}</td>
                    <td style={{ padding:'12px 20px', textAlign:'center' }}><span style={{ fontSize:'16px' }}>{row.prairon ? '✅' : '❌'}</span></td>
                    <td style={{ padding:'12px 20px', textAlign:'center' }}><span style={{ fontSize:'16px' }}>{row.agroapp ? '✅' : '❌'}</span></td>
                    <td style={{ padding:'12px 20px', textAlign:'center' }}><span style={{ fontSize:'16px' }}>{row.excel ? '✅' : '❌'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#1a1a18', padding:'48px 40px 32px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'40px', marginBottom:'40px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <div style={{ width:'24px', height:'24px', background:'#036446', borderRadius:'5px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'white', fontSize:'11px', fontWeight:'700' }}>P</span>
                </div>
                <span style={{ fontSize:'14px', fontWeight:'600', color:'white' }}>PRAIRON</span>
              </div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', lineHeight:1.7, maxWidth:'220px' }}>
                Sistema agroindustrial OS. Ganadería, avicultura, palma y agricultura en una sola plataforma.
              </p>
              <div style={{ display:'flex', gap:'6px', marginTop:'12px', flexWrap:'wrap' }}>
                {['🐄','🐔','🌴','🌽'].map(i => <span key={i} style={{ fontSize:'18px' }}>{i}</span>)}
              </div>
            </div>
            {[
              { title:'Sectores', links:['Ganadería','Avicultura','Palma de aceite','Agricultura'] },
              { title:'Producto', links:['Características','Precios','Demo','NOH IA'] },
              { title:'Empresa', links:['Acerca de','Blog','Contacto','Privacidad'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:'11px', fontWeight:'500', color:'rgba(255,255,255,0.4)', letterSpacing:'.08em', marginBottom:'14px' }}>{col.title.toUpperCase()}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', transition:'color .15s' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color='rgba(255,255,255,0.85)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(255,255,255,0.4)'}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.1)', paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>© 2026 PRAIRON. Todos los derechos reservados.</span>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>Hecho con ❤️ para los productores colombianos</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
