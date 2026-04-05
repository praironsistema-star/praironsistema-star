'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTORES = [
  { key: 'ganadero', label: 'Ganadería', icon: '🐄', color: '#b45309', bg: '#fef3e2', headline: 'Control total del hato bovino', desc: 'Historial veterinario, producción de leche, trazabilidad individual y alertas de salud en tiempo real.', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80', kpis: ['+18% leche/día', '-40% tiempo admin.', '0 animales sin control'], features: ['Historial vet. por animal', 'Registro de partos', 'Vacunación programada', 'Producción leche diaria'] },
  { key: 'avicola', label: 'Avicultura', icon: '🐔', color: '#dc2626', bg: '#fef2f2', headline: 'FCR óptimo, mortalidad mínima', desc: 'Galpones, lotes de engorde o postura, registro diario de mortalidad y alimentación por lote.', img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80', kpis: ['FCR 1.78 promedio', '-60% mortalidad', '100% trazabilidad'], features: ['Galpones y capacidad', 'Registro mortalidad diaria', 'Consumo alimento/lote', 'KPIs por ciclo'] },
  { key: 'palma', label: 'Palma de aceite', icon: '🌴', color: '#065f46', bg: '#d1fae5', headline: 'De la palma al aceite — trazabilidad completa', desc: 'Lotes FFB, extractora, eficiencia de extracción y análisis de laboratorio en un solo sistema.', img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80', kpis: ['+22% eficiencia ext.', '3 cert. activas ODS', '18.4 FFB/ha/año'], features: ['Cosecha FFB por lote', 'Trazabilidad extractora', 'Análisis laboratorio', 'Vivero y semilleros'] },
  { key: 'agricola', label: 'Agricultura', icon: '🌽', color: '#036446', bg: '#e8f5ef', headline: 'Cultivos inteligentes con IA predictiva', desc: 'Ciclos de cultivo, control de plagas, recomendaciones IA por tipo de suelo y certificaciones ODS.', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80', kpis: ['Score ODS 74/100', 'Cosecha predicha ±3 días', '-30% pérdidas'], features: ['Ciclos siembra/cosecha', 'Control plagas IA', 'ODS por cultivo', 'Recomendaciones NOAH'] },
  { key: 'acuicultura', label: 'Acuicultura', icon: '🐟', color: '#0369a1', bg: '#e0f2fe', headline: 'Estanques inteligentes, cosechas optimizadas', desc: 'Control de densidad, FCR acuícola, calidad de agua y proyección de cosecha para tilapia, trucha y camarón.', img: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=800&q=80', kpis: ['FCR acuícola óptimo', '+25% supervivencia', 'Calidad agua 24/7'], features: ['Estanques y densidad', 'Calidad del agua', 'Ciclos de engorde', 'Proyección de cosecha'] },
  { key: 'caficultura', label: 'Caficultura', icon: '☕', color: '#92400e', bg: '#fef3c7', headline: 'De la floración a la taza — ciclo completo', desc: 'Floración, cosecha selectiva, beneficio húmedo y análisis de taza para productores de café de especialidad.', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80', kpis: ['Cosecha selectiva +30%', 'Trazabilidad por lote', 'Análisis de taza'], features: ['Floración y cosecha', 'Beneficio húmedo', 'Control de calidad', 'Exportación y cert.'] },
  { key: 'apicultura', label: 'Apicultura', icon: '🍯', color: '#d97706', bg: '#fef9c3', headline: 'Colmenas saludables, miel premium', desc: 'Registro de revisiones, estado de la reina, producción de miel por colmena y tratamientos sanitarios.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', kpis: ['+40% producción/colmena', 'Varroa bajo control', 'Trazabilidad miel'], features: ['Revisión de colmenas', 'Estado de la reina', 'Producción de miel', 'Tratamientos sanitarios'] },
  { key: 'cana', label: 'Caña de Azúcar', icon: '🌿', color: '#15803d', bg: '#dcfce7', headline: 'Suertes, POL y liquidación con el ingenio', desc: 'Control de corte por contratista, toneladas por hectárea, POL y liquidación directa con el ingenio.', img: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80', kpis: ['TCH óptimo por suerte', 'Liquidación automática', 'POL en tiempo real'], features: ['Suertes y corte', 'TCH y POL', 'Control contratistas', 'Liquidación ingenio'] },
]

const VENTAJAS = [
  { icon: '📶', title: 'Offline-First', desc: 'Funciona sin internet. Registra en campo y sincroniza al volver a cobertura.', size: 'tall' },
  { icon: '🤖', title: 'NOAH IA 24/7', desc: 'Tu asesor agroindustrial que conoce tu finca, predice problemas y actúa.', size: 'wide' },
  { icon: '🗺️', title: 'Mapa GIS de lotes', desc: 'Visualiza tu finca completa con polígonos, alertas y historial por zona.', size: 'normal' },
  { icon: '📊', title: 'Benchmarking', desc: 'Compara tu operación contra el promedio del sector en tiempo real.', size: 'normal' },
  { icon: '🔗', title: 'Trazabilidad QR', desc: 'QR por lote — historial completo de insumos, cosecha y cadena de custodia.', size: 'normal' },
  { icon: '🌍', title: 'ODS + Sostenibilidad', desc: 'Score exportable para mercados europeos y certificaciones internacionales.', size: 'normal' },
  { icon: '📋', title: 'Tareo Digital', desc: 'Reemplaza el cuaderno de jornaleros. Nómina automática incluida.', size: 'normal' },
  { icon: '🗣️', title: 'ES · EN · PT', desc: 'Tres idiomas nativos. Listo para operar en cualquier país de LATAM.', size: 'normal' },
]

const STATS = [
  { value: 8, suffix: '+', label: 'Sectores productivos' },
  { value: 25, suffix: '+', label: 'Módulos integrados' },
  { value: 99.8, suffix: '%', label: 'Uptime garantizado' },
  { value: 14, suffix: '', label: 'Días gratis' },
]

const COMPARATIVA = [
  { feature: 'IA agroindustrial nativa (NOAH)', prairon: true, otros: false },
  { feature: 'Funciona sin internet (Offline-First)', prairon: true, otros: false },
  { feature: 'Trazabilidad QR por lote', prairon: true, otros: false },
  { feature: 'Benchmarking vs. sector', prairon: true, otros: false },
  { feature: 'Tareo digital de jornaleros', prairon: true, otros: false },
  { feature: 'Laboratorio + fitosanitario', prairon: true, otros: false },
  { feature: 'ODS y sostenibilidad exportable', prairon: true, otros: false },
  { feature: '8+ sectores en una plataforma', prairon: true, otros: false },
  { feature: 'App instalable sin App Store', prairon: true, otros: false },
  { feature: 'Español + Inglés + Portugués', prairon: true, otros: false },
  { feature: 'Mapa GIS de lotes', prairon: true, otros: false },
  { feature: 'Módulo financiero completo', prairon: true, otros: false },
]

const TESTIMONIOS = [
  { nombre: 'Carlos Restrepo', finca: 'Hacienda El Progreso', lugar: 'Colombia', sector: 'Ganadería', texto: 'Antes llevaba todo en libretas. Ahora NOAH me avisa cuando un animal necesita atención antes de que yo lo note. Mi producción de leche subió 18% en 3 meses.', resultado: '+18% leche/día' },
  { nombre: 'Familia Martínez', finca: 'Avícola San Pedro', lugar: 'Colombia', sector: 'Avicultura', texto: 'El FCR mejoró desde que registramos el consumo diario. PRAIRON nos mostró qué galpones estaban fallando y por qué. Resultados desde la primera semana.', resultado: 'FCR 1.78 óptimo' },
  { nombre: 'Grupo Palmares', finca: 'Palmares del Norte', lugar: 'Colombia', sector: 'Palma', texto: 'La trazabilidad ODS nos abrió puertas con compradores europeos. Vale mucho más que el precio del plan. Es nuestra ventaja competitiva en el mercado internacional.', resultado: '3 cert. ODS activas' },
]

const SECTORES_FORM = ['Ganadería / Bovinos', 'Avicultura', 'Palma de aceite', 'Agricultura / Cultivos', 'Acuicultura', 'Caficultura', 'Apicultura', 'Caña de azúcar', 'Mixto / Varios', 'Otro']
const TAMANOS = ['1–10 ha / pequeña escala', '11–100 hectáreas', '101–500 hectáreas', '500+ ha / industrial']
const DOLORES = ['Llevo todo en papel o Excel', 'No sé mi costo real de producción', 'No puedo rastrear animales o lotes', 'Me rechazan certificaciones', 'Sin visibilidad de trabajadores', 'Demasiado tiempo en admin.', 'Quiero acceder a créditos', 'Otro']

// ─── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function useCounter(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(ease * target * 10) / 10)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return count
}

// ─── Components ───────────────────────────────────────────────────────────────

function AnimatedStat({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCounter(value, 1200, active)
  const display = suffix === '%' ? count.toFixed(1) : Math.round(count)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', letterSpacing: '.04em' }}>{label}</div>
    </div>
  )
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(13,172,94,${p.o})`
        ctx.fill()
      })
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(13,172,94,${0.12 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} />
}

function FloatingOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,172,94,0.12) 0%, transparent 70%)', animation: 'orbFloat1 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,100,70,0.15) 0%, transparent 70%)', animation: 'orbFloat2 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '40%', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,120,0.06) 0%, transparent 70%)', animation: 'orbFloat3 10s ease-in-out infinite' }} />
    </div>
  )
}

function GlassCard3D({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(4px)`
  }
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.15s ease', ...style }}>
      {children}
    </div>
  )
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function MarqueeRow() {
  const items = [...SECTORES, ...SECTORES]
  return (
    <div style={{ overflow: 'hidden', padding: '20px 0' }}>
      <div style={{ display: 'flex', gap: '12px', animation: 'marquee 30s linear infinite', width: 'max-content' }}>
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '16px' }}>{s.icon}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoiCalculator() {
  const [hectareas, setHectareas] = useState('100')
  const [animales, setAnimales] = useState('150')
  const [trabajadores, setTrabajadores] = useState('5')
  const [sector, setSector] = useState('ganadero')
  const h = parseFloat(hectareas) || 0
  const a = parseFloat(animales) || 0
  const t = parseFloat(trabajadores) || 0
  const ahorro_tiempo = Math.round(t * 2.5 * 52 * 20)
  const ahorro_perdida = sector === 'ganadero' ? Math.round(a * 12) : sector === 'avicola' ? Math.round(a * 0.8) : Math.round(h * 45)
  const ahorro_total = ahorro_tiempo + ahorro_perdida
  const roi_meses = ahorro_total > 0 ? Math.max(1, Math.round(89 * 12 / ahorro_total * 10) / 10) : 0
  const inp: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', width: '100%', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: 'white' }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.08em', marginBottom: '16px' }}>TU OPERACIÓN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>SECTOR</label>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="ganadero">Ganadería</option>
              <option value="avicola">Avicultura</option>
              <option value="palma">Palma de aceite</option>
              <option value="agricola">Agricultura</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>HECTÁREAS</label>
            <input type="number" value={hectareas} onChange={e => setHectareas(e.target.value)} style={inp} min="1" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>ANIMALES</label>
            <input type="number" value={animales} onChange={e => setAnimales(e.target.value)} style={inp} min="0" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>TRABAJADORES</label>
            <input type="number" value={trabajadores} onChange={e => setTrabajadores(e.target.value)} style={inp} min="1" />
          </div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg, rgba(13,172,94,0.2) 0%, rgba(3,100,70,0.3) 100%)', border: '1px solid rgba(13,172,94,0.3)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '.08em', marginBottom: '16px' }}>AHORRO ESTIMADO / AÑO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Tiempo administrativo</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0dac5e', fontFamily: 'monospace' }}>${ahorro_tiempo.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Pérdidas operativas</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0dac5e', fontFamily: 'monospace' }}>${ahorro_perdida.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(13,172,94,0.3)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>TOTAL ANUAL</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>${ahorro_total.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>ROI en {roi_meses} meses</div>
          </div>
        </div>
        <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#0dac5e', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          Empezar ahora — 14 días gratis →
        </Link>
      </div>
    </div>
  )
}

function FormularioEstrategico() {
  const [form, setForm] = useState({ nombre: '', empresa: '', sector: '', tamano: '', dolores: [] as string[], whatsapp: '', pais: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  function toggleDolor(d: string) { setForm(f => ({ ...f, dolores: f.dolores.includes(d) ? f.dolores.filter(x => x !== d) : [...f.dolores, d] })) }
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setEnviando(true); await new Promise(r => setTimeout(r, 1200)); setEnviando(false); setEnviado(true) }
  const inp: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: 'white', transition: 'border-color .15s' }
  if (enviado) return (
    <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(13,172,94,0.1)', borderRadius: '20px', border: '1px solid rgba(13,172,94,0.2)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>¡Recibimos tu información!</h3>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 24px' }}>Un especialista te contactará en menos de 24 horas.</p>
      <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#0dac5e', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Empezar 14 días gratis →</Link>
    </div>
  )
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>NOMBRE *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} style={inp} placeholder="Tu nombre" /></div>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>FINCA / EMPRESA</label><input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} style={inp} placeholder="Nombre de tu operación" /></div>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>PAÍS *</label><input required value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} style={inp} placeholder="¿Desde qué país?" /></div>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>WHATSAPP *</label><input required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inp} placeholder="+1 000 000 0000" /></div>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>SECTOR *</label>
          <select required value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Selecciona</option>{SECTORES_FORM.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>TAMAÑO *</label>
          <select required value={form.tamano} onChange={e => setForm({ ...form, tamano: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Selecciona</option>{TAMANOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '8px' }}>MAYOR PROBLEMA HOY</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {DOLORES.map(d => (
            <button type="button" key={d} onClick={() => toggleDolor(d)} style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '11px', textAlign: 'left', border: form.dolores.includes(d) ? '1px solid #0dac5e' : '1px solid rgba(255,255,255,0.1)', background: form.dolores.includes(d) ? 'rgba(13,172,94,0.15)' : 'rgba(255,255,255,0.03)', color: form.dolores.includes(d) ? '#0dac5e' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
              {form.dolores.includes(d) ? '✓ ' : ''}{d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.06em', marginBottom: '5px' }}>¿QUÉ ESPERAS LOGRAR?</label>
        <textarea value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="Cuéntanos tu situación actual..." />
      </div>
      <button type="submit" disabled={enviando} style={{ width: '100%', padding: '14px', background: enviando ? 'rgba(255,255,255,0.1)' : '#0dac5e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
        {enviando ? 'Enviando...' : 'Solicitar diagnóstico estratégico gratuito →'}
      </button>
    </form>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeSector, setActiveSector] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const sector = SECTORES[activeSector]
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'Figtree', system-ui, sans-serif", color: '#1a1a18', background: '#010d07', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        ::placeholder { color: rgba(255,255,255,0.25) !important; }
        option { background: #012e1f; color: white; }

        @keyframes fadeup { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(20px,-30px) rotate(180deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(40px)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        .btn-primary { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:#0dac5e; color:white; border-radius:10px; font-size:15px; font-weight:600; transition:all .2s; cursor:pointer; border:none; font-family:inherit; }
        .btn-primary:hover { background:#0a9450; transform:translateY(-2px); box-shadow:0 12px 32px rgba(13,172,94,0.35); }
        .btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:14px 24px; border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.85); border-radius:10px; font-size:15px; transition:all .2s; cursor:pointer; font-family:inherit; background:transparent; }
        .btn-ghost:hover { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.06); }
        .nav-link { font-size:14px; color:rgba(255,255,255,0.65); transition:color .15s; }
        .nav-link:hover { color:white; }
        .nav-link-dark { font-size:14px; color:#6b6b67; transition:color .15s; }
        .nav-link-dark:hover { color:#036446; }
        .sector-pill { transition:all .2s; cursor:pointer; border:none; font-family:inherit; }
        .sector-pill:hover { transform:translateY(-2px); }
        .bento-card { transition:all .25s; }
        .bento-card:hover { transform:translateY(-4px) scale(1.01); border-color:rgba(13,172,94,0.3) !important; }
        .testimonio-card { transition:all .2s; }
        .testimonio-card:hover { transform:translateY(-4px); border-color:rgba(13,172,94,0.25) !important; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .testimonios-grid { grid-template-columns: 1fr !important; }
          .roi-grid { grid-template-columns: 1fr !important; }
          .precios-grid { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-h1 { font-size: clamp(2.2rem, 8vw, 3.5rem) !important; }
          .nav-links { display:none !important; }
          .section-pad { padding: 64px 24px !important; }
        }
      `}</style>

      {/* URGENCY BAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101, background: 'linear-gradient(90deg, #036446, #0dac5e, #036446)', backgroundSize: '200%', animation: 'shimmer 4s linear infinite', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', color: 'white', fontWeight: 500 }}>🎁 14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</span>
        <Link href="/register" style={{ fontSize: '11px', padding: '3px 12px', background: 'rgba(0,0,0,0.25)', color: 'white', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>Empezar →</Link>
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: '33px', left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(1,13,7,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .3s' }}>
        <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: '28px', width: 'auto' }} />
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#sectores" className="nav-link">Sectores</a>
          <a href="#ventajas" className="nav-link">Ventajas</a>
          <a href="#noah" className="nav-link">NOAH IA</a>
          <Link href="/precios" className="nav-link">Precios</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', padding: '8px 16px' }}>Ingresar</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>Empezar gratis</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: '97px', background: 'linear-gradient(160deg, #010d07 0%, #012418 50%, #01361f 100%)' }}>

        {/* Animated grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(13,172,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,172,94,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', animation: 'gridMove 20s linear infinite', opacity: 0.6 }} />

        <FloatingOrbs />
        <HeroCanvas />

        {/* Scanline effect */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(13,172,94,0.15), transparent)', animation: 'scanline 8s linear infinite' }} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }} className="hero-grid">
          <div style={{ animation: 'fadeup .8s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(13,172,94,0.12)', border: '1px solid rgba(13,172,94,0.25)', borderRadius: '20px', marginBottom: '28px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0dac5e', animation: 'pulse 2s ease infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.08em' }}>GANADERÍA · AVICULTURA · PALMA · CAFÉ · ACUICULTURA · Y MÁS</span>
            </div>

            <h1 className="hero-h1" style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.02, marginBottom: '24px', letterSpacing: '-2px' }}>
              El sistema que<br />la agroindustria<br />
              <span style={{ background: 'linear-gradient(90deg, #0dac5e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>merecía.</span>
            </h1>

            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '36px', maxWidth: '480px' }}>
              Una sola plataforma para toda tu operación agropecuaria. Con <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>NOAH</strong>, la IA agroindustrial que conoce tu finca, predice problemas y trabaja contigo 24/7.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '52px' }}>
              <Link href="/register" className="btn-primary">Empezar gratis — sin tarjeta →</Link>
              <Link href="/demo" className="btn-ghost">Ver demo en vivo</Link>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '32px' }}>
              {STATS.map(s => <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={statsVisible} />)}
            </div>
          </div>

          {/* Hero 3D Card */}
          <div style={{ animation: 'fadeup .8s ease .15s both' }}>
            <GlassCard3D>
              <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '28px', boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Buenos días, Carlos</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>Hacienda El Progreso · Operación mixta</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '5px 10px', background: 'rgba(13,172,94,0.12)', border: '1px solid rgba(13,172,94,0.2)', borderRadius: '20px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0dac5e', animation: 'pulse 2s ease infinite' }} />
                    <span style={{ fontSize: '10px', color: '#0dac5e', fontWeight: 600 }}>NOAH activo</span>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
                  {[{ label: 'Animales', value: '342', color: '#0dac5e', icon: '🐄' }, { label: 'Leche/día', value: '1,240L', color: '#60a5fa', icon: '🥛' }, { label: 'Score ODS', value: '74/100', color: '#fbbf24', icon: '🌍' }].map(k => (
                    <div key={k.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{k.icon}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '.06em' }}>PRODUCCIÓN DE LECHE — ÚLTIMOS 7 DÍAS</div>
                  <svg viewBox="0 0 240 50" style={{ width: '100%', height: '50px' }}>
                    <defs>
                      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0dac5e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0dac5e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,35 C20,30 40,25 60,22 C80,19 100,28 120,20 C140,12 160,18 180,14 C200,10 220,8 240,6" fill="none" stroke="#0dac5e" strokeWidth="2" strokeLinecap="round" />
                    <path d="M0,35 C20,30 40,25 60,22 C80,19 100,28 120,20 C140,12 160,18 180,14 C200,10 220,8 240,6 L240,50 L0,50 Z" fill="url(#lg)" />
                    {[0, 40, 80, 120, 160, 200, 240].map((x, i) => {
                      const ys = [35, 22, 28, 20, 14, 8, 6]
                      return <circle key={x} cx={x} cy={ys[i]} r="2.5" fill="#0dac5e" opacity="0.8" />
                    })}
                  </svg>
                </div>

                {/* NOAH message */}
                <div style={{ background: 'rgba(13,172,94,0.08)', border: '1px solid rgba(13,172,94,0.2)', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #036446, #0dac5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                    "Temperatura alta (34°C). Asegura agua fresca en bebederos del lote norte. 2 bovinos requieren revisión."
                  </div>
                </div>
              </div>
            </GlassCard3D>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em' }}>DESCUBRIR</span>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, rgba(13,172,94,0.6), transparent)', animation: 'float 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MARQUEE SECTORES */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <MarqueeRow />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTORES */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="sectores" className="section-pad" style={{ padding: '100px 48px', background: '#010d07' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>DISEÑADO PARA TU SECTOR</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>Una plataforma,<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>ocho industrias</span></h2>
            </div>
          </ScrollReveal>

          {/* Pills */}
          <ScrollReveal delay={100}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
              {SECTORES.map((s, i) => (
                <button key={s.key} className="sector-pill" onClick={() => setActiveSector(i)}
                  style={{ padding: '9px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: activeSector === i ? 600 : 400, background: activeSector === i ? s.color : 'rgba(255,255,255,0.05)', color: activeSector === i ? 'white' : 'rgba(255,255,255,0.5)', border: activeSector === i ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Sector card */}
          <ScrollReveal delay={150}>
            <GlassCard3D>
              <div key={sector.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeup .3s ease' }}>
                <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
                  <img src={sector.img} alt={sector.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(1,13,7,0.3) 0%, rgba(1,13,7,0.95) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sector.kpis.map(k => (
                      <div key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0dac5e' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: `${sector.color}22`, border: `1px solid ${sector.color}44`, borderRadius: '20px', marginBottom: '20px', width: 'fit-content' }}>
                    <span>{sector.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: sector.color, letterSpacing: '.06em' }}>{sector.label.toUpperCase()}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'white', marginBottom: '14px', lineHeight: 1.2 }}>{sector.headline}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '28px' }}>{sector.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {sector.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${sector.color}22`, border: `1px solid ${sector.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '9px', color: sector.color, fontWeight: 700 }}>✓</span>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: sector.color, color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', width: 'fit-content' }}>
                    Empezar con {sector.label} →
                  </Link>
                </div>
              </div>
            </GlassCard3D>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BENTO VENTAJAS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="ventajas" className="section-pad" style={{ padding: '100px 48px', background: '#000f08' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>LO QUE NOS HACE DIFERENTES</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>Ventajas que ningún<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>competidor tiene</span></h2>
            </div>
          </ScrollReveal>

          {/* Bento grid */}
          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'auto', gap: '16px' }}>
            {/* Card grande — Offline */}
            <ScrollReveal delay={0}>
              <div className="bento-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', background: 'linear-gradient(135deg, rgba(13,172,94,0.12) 0%, rgba(3,100,70,0.06) 100%)', border: '1px solid rgba(13,172,94,0.2)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px' }}>
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📶</div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Funciona sin internet</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Offline-First con Service Worker e IndexedDB. Registra en el campo sin señal y sincroniza automáticamente al volver a cobertura. Nadie en LATAM lo tiene.</p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(13,172,94,0.15)', border: '1px solid rgba(13,172,94,0.25)', borderRadius: '20px', width: 'fit-content' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0dac5e', animation: 'pulse 2s ease infinite' }} />
                  <span style={{ fontSize: '11px', color: '#0dac5e', fontWeight: 600 }}>Sincronizando...</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card NOAH */}
            <ScrollReveal delay={50}>
              <div className="bento-card" style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>NOAH IA 24/7</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>Tu asesor agroindustrial que conoce tu finca, predice problemas y actúa antes de que los notes tú.</p>
              </div>
            </ScrollReveal>

            {/* 6 cards normales */}
            {VENTAJAS.slice(2).map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 50 + 100}>
                <div className="bento-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', height: '100%' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{v.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>{v.title}</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* NOAH */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="noah" className="section-pad" style={{ background: '#010d07', padding: '100px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,172,94,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', position: 'relative' }}>
          <ScrollReveal>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '20px' }}>NOAH — IA AGROINDUSTRIAL</div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                <img src="/images/noh-thinking.png" alt="NOAH" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.5))', animation: 'float 3.5s ease-in-out infinite' }} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'white', marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-1px' }}>Tu asesor experto<br />disponible 24/7</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '36px' }}>NOAH conoce tu operación, tus datos y tu sector. No es un chatbot genérico — es un ingeniero agrónomo digital entrenado para el agro de habla hispana, inglesa y portuguesa.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '36px' }}>
                {['Memoria de conversación', 'Contexto de pantalla', 'Análisis de imágenes', 'Predicción de cosecha', 'Voz en 3 idiomas', 'Alertas proactivas'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(13,172,94,0.2)', border: '1px solid rgba(13,172,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#0dac5e', fontSize: '8px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary">Hablar con NOAH gratis →</Link>
            </div>
          </ScrollReveal>

          {/* Chat demo */}
          <ScrollReveal delay={150}>
            <GlassCard3D>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #036446, #0dac5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white' }}>N</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>NOAH</div>
                    <div style={{ fontSize: '10px', color: '#0dac5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0dac5e', animation: 'pulse 2s ease infinite' }} /> En línea
                    </div>
                  </div>
                </div>
                {[
                  { from: 'noh', text: 'Detecté mortalidad alta en Galpón 3 — 2.8% esta semana vs 1.2% la anterior. ¿Quieres que revise las causas?' },
                  { from: 'user', text: 'Sí, y dime qué hacer con la ventilación' },
                  { from: 'noh', text: 'La temperatura interna supera 32°C. Activa ventiladores adicionales y reduce densidad en un 15%. Te envío el protocolo completo ahora.' },
                  { from: 'user', text: '¿Cuándo es la próxima cosecha de café?' },
                  { from: 'noh', text: 'Basado en tu floración y el clima de tu zona, el Lote 4 está estimado para el 12 de mayo. Rendimiento: 1.8 ton/ha de pergamino.' },
                ].map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row' }}>
                    {msg.from === 'noh' && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #036446, #0dac5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>}
                    <div style={{ padding: '9px 13px', fontSize: '12px', lineHeight: 1.55, maxWidth: '78%', background: msg.from === 'noh' ? 'rgba(255,255,255,0.05)' : 'rgba(13,172,94,0.18)', color: 'rgba(255,255,255,0.85)', borderRadius: msg.from === 'noh' ? '4px 12px 12px 12px' : '12px 4px 12px 12px', border: msg.from === 'noh' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(13,172,94,0.25)' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard3D>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIOS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '100px 48px', background: '#000f08' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>CASOS DE ÉXITO</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>Productores que ya<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>confían en PRAIRON</span></h2>
            </div>
          </ScrollReveal>
          <div className="testimonios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {TESTIMONIOS.map((t, i) => (
              <ScrollReveal key={t.nombre} delay={i * 80}>
                <div className="testimonio-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                  <div style={{ fontSize: '32px', color: '#0dac5e', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, flex: 1 }}>{t.texto}</p>
                  <div style={{ padding: '12px', background: 'rgba(13,172,94,0.08)', border: '1px solid rgba(13,172,94,0.15)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#0dac5e', fontFamily: 'monospace' }}>{t.resultado}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #036446, #0dac5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {t.nombre[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{t.nombre}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{t.finca} · {t.lugar}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(13,172,94,0.1)', color: '#0dac5e', fontWeight: 500, border: '1px solid rgba(13,172,94,0.2)', whiteSpace: 'nowrap' }}>{t.sector}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ROI CALCULATOR */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '100px 48px', background: '#010d07' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>CALCULADORA DE ROI</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>¿Cuánto ahorra tu<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>operación con PRAIRON?</span></h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <RoiCalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* COMPARATIVA */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '100px 48px', background: '#000f08' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>POR QUÉ PRAIRON</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>La única plataforma<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>diseñada para el agro</span></h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '.08em' }}>FUNCIONALIDAD</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#0dac5e' }}>PRAIRON</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>Competidores</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>Excel / Papel</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVA.map((row, i) => (
                    <tr key={row.feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '13px 24px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{row.feature}</td>
                      <td style={{ padding: '13px 24px', textAlign: 'center', fontSize: '16px' }}>✅</td>
                      <td style={{ padding: '13px 24px', textAlign: 'center', fontSize: '16px' }}>{row.otros ? '✅' : '❌'}</td>
                      <td style={{ padding: '13px 24px', textAlign: 'center', fontSize: '16px' }}>❌</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PRECIOS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '100px 48px', background: '#010d07' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '14px' }}>PRECIOS SIMPLES</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px' }}>Empieza gratis,<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>escala cuando quieras</span></h2>
            </div>
          </ScrollReveal>
          <div className="precios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', alignItems: 'center' }}>
            {[
              { name: 'Starter', price: '$29', period: '/mes', desc: 'Para fincas pequeñas', features: ['1 usuario', '2 granjas', 'NOAH básico', 'Soporte email'], highlight: false },
              { name: 'Pro', price: '$89', period: '/mes', desc: 'Para operaciones en crecimiento', features: ['10 usuarios', 'Granjas ilimitadas', 'NOAH premium', 'Todos los módulos', 'Trazabilidad QR', 'Soporte prioritario'], highlight: true },
              { name: 'Enterprise', price: '$199', period: '/mes', desc: 'Para grupos empresariales', features: ['Usuarios ilimitados', 'Multi-empresa', 'API pública', 'NOAH con memoria', 'Benchmarking avanzado', 'Gerente dedicado'], highlight: false },
            ].map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 80}>
                <div style={{ background: p.highlight ? 'linear-gradient(135deg, rgba(13,172,94,0.15) 0%, rgba(3,100,70,0.1) 100%)' : 'rgba(255,255,255,0.02)', border: p.highlight ? '1px solid rgba(13,172,94,0.35)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', position: 'relative', transform: p.highlight ? 'scale(1.04)' : 'none', boxShadow: p.highlight ? '0 20px 60px rgba(13,172,94,0.15)' : 'none' }}>
                  {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0dac5e', color: 'white', fontSize: '10px', fontWeight: 600, padding: '4px 16px', borderRadius: '20px', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>MÁS POPULAR</div>}
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', marginBottom: '8px' }}>{p.name.toUpperCase()}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '40px', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{p.price}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{p.period}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>{p.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                        <span style={{ color: '#0dac5e', fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', background: p.highlight ? '#0dac5e' : 'rgba(255,255,255,0.06)', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                    {p.highlight ? 'Prueba 14 días gratis' : 'Empezar'}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/precios" style={{ fontSize: '13px', color: '#0dac5e', fontWeight: 500 }}>Ver todos los detalles de precios →</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DIAGNÓSTICO */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="diagnostico" className="section-pad" style={{ padding: '100px 48px', background: '#000f08', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(13,172,94,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(13,172,94,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '64px', alignItems: 'start' }} className="form-grid">
              <div style={{ position: 'sticky', top: '120px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0dac5e', letterSpacing: '.12em', marginBottom: '16px' }}>DIAGNÓSTICO GRATUITO</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '20px' }}>Cuéntanos sobre<br />tu operación</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '32px' }}>Un especialista de PRAIRON revisará tu caso y te contactará en menos de 24 horas para diseñar juntos la estrategia correcta.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[{ icon: '🎯', title: 'Diagnóstico personalizado', desc: 'Identificamos qué módulos necesitas según tu sector y tamaño.' }, { icon: '⚡', title: 'Implementación rápida', desc: 'La mayoría funciona en menos de 48 horas.' }, { icon: '��', title: 'Sin compromiso', desc: '14 días gratis, sin tarjeta, sin contratos.' }].map(b => (
                    <div key={b.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '18px', marginTop: '2px' }}>{b.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '3px' }}>{b.title}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(12px)' }}>
                <FormularioEstrategico />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CTA FINAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#010d07' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,172,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ padding: '120px 48px', position: 'relative' }}>
          <ScrollReveal>
            <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white', marginBottom: '20px', lineHeight: 1.05, letterSpacing: '-2px' }}>
                Tu operación merece tecnología que trabaja<br /><span style={{ background: 'linear-gradient(90deg, #0dac5e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>mientras tú duermes</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', marginBottom: '44px', lineHeight: 1.7 }}>
                14 días gratis · Sin tarjeta · ES · EN · PT · Para todo el mundo
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn-primary" style={{ fontSize: '16px', padding: '16px 36px' }}>Comenzar gratis ahora →</Link>
                <a href="#diagnostico" className="btn-ghost" style={{ fontSize: '16px', padding: '16px 28px' }}>Solicitar diagnóstico</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#000a05', padding: '64px 48px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: '26px', width: 'auto', marginBottom: '16px', opacity: 0.8 }} />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.75, maxWidth: '240px', marginBottom: '20px' }}>Sistema agroindustrial global. Ganadería, avicultura, palma, café, acuicultura y más — en una sola plataforma con IA nativa.</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['🐄', '🐔', '🌴', '☕', '🐟', '🍯', '🌿', '��'].map(i => <span key={i} style={{ fontSize: '16px' }}>{i}</span>)}
              </div>
            </div>
            {[
              { title: 'Sectores', links: ['Ganadería', 'Avicultura', 'Palma de aceite', 'Caficultura', 'Acuicultura', 'Apicultura'] },
              { title: 'Producto', links: ['Características', 'Precios', 'Demo', 'NOAH IA', 'Trazabilidad QR'] },
              { title: 'Empresa', links: ['Acerca de', 'Blog', 'Contacto', 'Privacidad', 'Términos'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '.1em', marginBottom: '16px' }}>{col.title.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', transition: 'color .15s' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>© 2026 PRAIRON. Todos los derechos reservados.</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Hecho para los productores del mundo 🌎</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
