'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicNav from '@/components/layout/PublicNav'

const SECTORES = [
  {
    id: 'ganaderia', emoji: '🐄', label: 'Ganadería',
    desc: 'Cada animal registrado. Cada decisión respaldada por datos.',
    features: ['Registro individual por animal', 'Plan sanitario y vacunación', 'Control de pesaje y ganancias', 'Reproducción y genética', 'Costos por cabeza en tiempo real'],
    href: '/soluciones/ganaderia', color: '#22c55e',
  },
  {
    id: 'caficultura', emoji: '☕', label: 'Caficultura',
    desc: 'Del lote al mercado — trazabilidad completa para café de especialidad.',
    features: ['Gestión de lotes y variedades', 'Control fitosanitario (roya, broca)', 'Cosecha y beneficio húmedo', 'Trazabilidad para exportación', 'Certificaciones UTZ / Rainforest'],
    href: '/soluciones/caficultura', color: '#86efac',
  },
  {
    id: 'palma', emoji: '🌴', label: 'Palma de aceite',
    desc: 'Optimización del ciclo productivo para máxima extracción de aceite.',
    features: ['Control de polinización', 'Seguimiento de racimos por lote', 'Gestión de fertilización', 'Proyección de cosecha', 'Indicadores de extracción'],
    href: '/soluciones/palma', color: '#4ade80',
  },
  {
    id: 'avicultura', emoji: '🐔', label: 'Avicultura',
    desc: 'Producción avícola sin puntos ciegos — galpón por galpón.',
    features: ['Gestión por galpón', 'Control ambiental (temp/humedad)', 'Consumo y conversión alimenticia', 'Mortalidad y bioseguridad', 'Ciclos de producción'],
    href: '/soluciones/avicultura', color: '#22c55e',
  },
  {
    id: 'cacao', emoji: '🍫', label: 'Cacao',
    desc: 'Gestión integral del cacao fino de aroma y comercial.',
    features: ['Control de fermentación y secado', 'Trazabilidad por lote', 'Gestión de beneficio', 'Certificaciones orgánicas', 'Comercialización y precios'],
    href: '/soluciones/cacao', color: '#86efac',
  },
  {
    id: 'acuicultura', emoji: '🐟', label: 'Acuicultura',
    desc: 'Control total de estanques, biomasa y calidad del agua.',
    features: ['Monitoreo de calidad de agua', 'Control de biomasa por estanque', 'Alimentación y conversión', 'Cosecha y procesamiento', 'Trazabilidad sanitaria'],
    href: '/soluciones/acuicultura', color: '#4ade80',
  },
  {
    id: 'horticultura', emoji: '🥬', label: 'Horticultura',
    desc: 'Ciclos cortos, máximo control — producción intensiva optimizada.',
    features: ['Planificación de ciclos y rotación', 'Control de riego y fertilización', 'Monitoreo de plagas', 'Trazabilidad BPA', 'Gestión de ventas directas'],
    href: '/soluciones/horticultura', color: '#22c55e',
  },
  {
    id: 'arroz', emoji: '🌾', label: 'Arroz',
    desc: 'Gestión del cultivo de arroz desde la siembra hasta la trilla.',
    features: ['Planificación de siembra por lote', 'Control de lámina de agua', 'Manejo integrado de plagas', 'Control de costos por hectárea', 'Rendimiento en trilla'],
    href: '/soluciones/arroz', color: '#86efac',
  },
  {
    id: 'apicultura', emoji: '🍯', label: 'Apicultura',
    desc: 'Gestión de colmenas y producción de miel con trazabilidad total.',
    features: ['Registro de colmenas y apiarios', 'Control sanitario (varroasis)', 'Producción de miel por colmena', 'Calendario de revisiones', 'Trazabilidad para exportación'],
    href: '/soluciones/apicultura', color: '#4ade80',
  },
  {
    id: 'cana', emoji: '🌿', label: 'Caña de azúcar',
    desc: 'Optimización del ciclo de caña para máxima extracción de sacarosa.',
    features: ['Gestión de socas y resiembras', 'Control de maduración', 'Planificación de cosecha', 'Rendimiento en fábrica (TAH)', 'Costos por tonelada'],
    href: '/soluciones/cana', color: '#22c55e',
  },
  {
    id: 'fruticultura', emoji: '🍓', label: 'Fruticultura',
    desc: 'Producción frutícola con trazabilidad para mercados exigentes.',
    features: ['Gestión de variedades y portainjertos', 'Control de podas y raleo', 'Seguimiento de maduración', 'Trazabilidad GlobalG.A.P.', 'Gestión de exportación'],
    href: '/soluciones/fruticultura', color: '#86efac',
  },
  {
    id: 'organica', emoji: '🌿', label: 'Agricultura Orgánica',
    desc: 'Cumplimiento de normativas orgánicas con documentación automática.',
    features: ['Registro de insumos permitidos', 'Documentación para certificación', 'Trazabilidad NOP / EU Organic', 'Control de contaminación cruzada', 'Gestión de certificadores'],
    href: '/soluciones/organica', color: '#4ade80',
  },
]

export default function SolucionesPage() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a1a0f; --bg2: #0d1f14; --bg3: #112218;
          --green: #22c55e; --green-glow: rgba(34,197,94,0.12);
          --green-border: rgba(34,197,94,0.25);
          --text: #f0fdf4; --text2: rgba(240,253,244,0.62); --text3: rgba(240,253,244,0.3);
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --font: 'DM Sans', system-ui, sans-serif; --mono: 'DM Mono', monospace;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; }

        /* HERO */
        .hero {
          padding: 120px max(24px, calc((100vw - 1200px)/2)) 72px;
          text-align: center;
          background: radial-gradient(ellipse 900px 500px at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px);
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 28px;
          border: 1px solid var(--green-border); border-radius: 100px;
          padding: 6px 16px; font-size: 12px; font-family: var(--mono); color: var(--green);
          background: var(--green-glow); position: relative; z-index: 1;
          animation: fadeUp .6s ease both;
        }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .hero h1 {
          font-size: clamp(36px, 5.5vw, 62px); font-weight: 600; letter-spacing: -1.5px;
          line-height: 1.08; position: relative; z-index: 1;
          animation: fadeUp .7s .1s ease both;
        }
        .hero h1 em { font-style: normal; color: var(--green); }
        .hero-sub {
          font-size: 17px; color: var(--text2); max-width: 560px; margin: 18px auto 0;
          line-height: 1.65; position: relative; z-index: 1;
          animation: fadeUp .7s .2s ease both;
        }

        /* STATS */
        .stats-row {
          display: flex; justify-content: center; gap: 48px; flex-wrap: wrap;
          padding: 40px max(24px, calc((100vw - 1200px)/2));
          border-bottom: 1px solid var(--border);
        }
        .stat { text-align: center; }
        .stat-num { font-size: 32px; font-weight: 600; color: var(--green); letter-spacing: -1px; }
        .stat-lbl { font-size: 12px; font-family: var(--mono); color: var(--text3); margin-top: 4px; }

        /* GRID */
        .grid-section { padding: 60px max(24px, calc((100vw - 1200px)/2)) 80px; }
        .grid-title { font-size: 13px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 32px; text-align: center; }
        .sectors-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        .sector-card {
          background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px;
          padding: 28px 24px; text-decoration: none; display: block;
          transition: transform .2s, border-color .2s, box-shadow .2s;
          position: relative; overflow: hidden;
        }
        .sector-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(135deg, rgba(34,197,94,0.06) 0%, transparent 60%);
          opacity: 0; transition: opacity .3s;
        }
        .sector-card:hover { transform: translateY(-4px); border-color: var(--green-border); box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(34,197,94,0.1); }
        .sector-card:hover::before { opacity: 1; }

        .sector-emoji { font-size: 36px; margin-bottom: 14px; display: block; }
        .sector-name { font-size: 18px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; margin-bottom: 6px; }
        .sector-desc { font-size: 13.5px; color: var(--text2); line-height: 1.55; margin-bottom: 20px; }
        .sector-features { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .sector-feature { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text2); }
        .sector-feature::before { content: '✓'; color: var(--green); flex-shrink: 0; font-size: 11px; margin-top: 2px; }
        .sector-more { font-size: 12px; color: var(--text3); font-family: var(--mono); }
        .sector-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--green); font-weight: 500;
          margin-top: 4px; transition: gap .2s;
        }
        .sector-card:hover .sector-link { gap: 10px; }

        /* NOAH BANNER */
        .noah-banner {
          margin: 0 max(24px, calc((100vw - 1200px)/2)) 80px;
          background: linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%);
          border: 1px solid var(--green-border); border-radius: 20px;
          padding: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
        }
        .noah-banner h2 { font-size: 30px; font-weight: 600; letter-spacing: -0.8px; margin-bottom: 12px; }
        .noah-banner h2 em { font-style: normal; color: var(--green); }
        .noah-banner p { font-size: 15px; color: var(--text2); line-height: 1.65; }
        .noah-card-inner { background: var(--bg3); border: 1px solid var(--border2); border-radius: 14px; padding: 20px; }
        .noah-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .noah-avatar { width: 30px; height: 30px; border-radius: 8px; background: var(--green); display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 12px; color: #0a1a0f; font-weight: 500; }
        .noah-name { font-size: 13px; font-weight: 500; color: var(--text); }
        .noah-status { font-size: 11px; font-family: var(--mono); color: var(--green); }
        .noah-msg { font-size: 13px; color: var(--text2); line-height: 1.6; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 2px solid var(--green); }

        /* CTA */
        .cta-section {
          padding: 80px max(24px, calc((100vw - 1200px)/2));
          text-align: center;
          background: radial-gradient(ellipse 600px 400px at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 70%);
        }
        .cta-section h2 { font-size: 36px; font-weight: 600; letter-spacing: -0.8px; margin-bottom: 14px; }
        .cta-section h2 em { font-style: normal; color: var(--green); }
        .cta-section p { font-size: 16px; color: var(--text2); margin-bottom: 36px; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--green); color: #0a1a0f; font-weight: 500; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: background .2s; }
        .btn-primary:hover { background: #16a34a; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); color: var(--text); font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; border: 1px solid var(--border2); transition: background .2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09); }

        /* FOOTER */
        footer { border-top: 1px solid var(--border); padding: 28px max(24px, calc((100vw - 1200px)/2)); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        footer p { font-size: 13px; color: var(--text3); }

        @media (max-width: 1024px) { .sectors-grid { grid-template-columns: 1fr 1fr; } .noah-banner { grid-template-columns: 1fr; gap: 28px; } }
        @media (max-width: 640px) { .sectors-grid { grid-template-columns: 1fr; } .noah-banner { padding: 28px 20px; } }
      `}</style>

      <PublicNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">
          <span className="hero-dot" />
          <span>16 sectores productivos</span>
        </div>
        <h1>Un sistema hecho para<br /><em>cada tipo de producción</em></h1>
        <p className="hero-sub">
          PRAIRON no es un sistema genérico. Cada área productiva tiene su propio flujo, módulos y lenguaje. Elige tu sector y ve exactamente lo que incluye.
        </p>
      </section>

      {/* STATS */}
      <div className="stats-row">
        {[
          { num: '16', lbl: 'Sectores productivos' },
          { num: '500+', lbl: 'Productores activos' },
          { num: '47', lbl: 'Modelos de datos' },
          { num: '30+', lbl: 'Módulos especializados' },
        ].map((s, i) => (
          <div key={i} className="stat">
            <div className="stat-num">{s.num}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* SECTORES GRID */}
      <section className="grid-section">
        <div className="grid-title">Elige tu sector</div>
        <div className="sectors-grid">
          {SECTORES.map((s) => (
            <Link
              key={s.id} href={s.href}
              className="sector-card"
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="sector-emoji">{s.emoji}</span>
              <div className="sector-name">{s.label}</div>
              <div className="sector-desc">{s.desc}</div>
              <div className="sector-features">
                {s.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="sector-feature">{f}</div>
                ))}
              </div>
              {s.features.length > 3 && (
                <div className="sector-more">+ {s.features.length - 3} módulos más</div>
              )}
              <div className="sector-link">Ver módulos completos →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* NOAH BANNER */}
      <div className="noah-banner">
        <div>
          <h2>NOAH analiza<br /><em>tu sector específico</em></h2>
          <p>
            La IA de PRAIRON no da recomendaciones genéricas. NOAH conoce las variables críticas de cada sector — pesos, densidades, conversiones, índices sanitarios — y habla el idioma de tu operación.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/demo" className="btn-primary" style={{ fontSize: '14px', padding: '11px 22px' }}>Ver demo de NOAH →</Link>
            <Link href="/#noah" className="btn-secondary" style={{ fontSize: '14px', padding: '11px 22px' }}>Cómo funciona</Link>
          </div>
        </div>
        <div className="noah-card-inner">
          <div className="noah-row">
            <div className="noah-avatar">N</div>
            <div>
              <div className="noah-name">NOAH</div>
              <div className="noah-status">● Analizando tu operación</div>
            </div>
          </div>
          <div className="noah-msg">
            "Detecté que tus <strong>bovinos del Lote Norte</strong> tienen una ganancia diaria de peso 12% por debajo del promedio de tu región. La causa más probable es déficit proteico en la dieta. Recomiendo ajustar la ración antes del jueves — el impacto proyectado es +$340K COP en el próximo ciclo."
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Ganadería 🐄', 'Caficultura ☕', 'Palma 🌴', 'Avicultura 🐔'].map(s => (
              <span key={s} style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <h2>¿Listo para ver PRAIRON<br /><em>en tu sector?</em></h2>
        <p>14 días gratis. Sin tarjeta de crédito.</p>
        <div className="cta-btns">
          <Link href="/register" className="btn-primary">Empezar gratis →</Link>
          <Link href="/demo" className="btn-secondary">Agendar demo</Link>
        </div>
      </section>

      <footer>
        <p>© 2026 PRAIRON · Todos los derechos reservados · Hecho en LATAM</p>
        <p>ES · EN · PT · Colombia · México · Perú · Brasil · Ecuador</p>
      </footer>
    </>
  )
}
