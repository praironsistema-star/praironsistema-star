'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// /demo — Demo pública sin login
// Muestra el sistema completo con datos ficticios reales
// Para inversionistas y demos comerciales
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_DATA = {
  company: { name: 'Hacienda El Progreso', location: 'Córdoba, Colombia', type: 'Ganadera / Mixta' },
  stats: [
    { label: 'Hectáreas totales', value: '480', unit: 'ha', color: '#036446' },
    { label: 'Animales registrados', value: '342', unit: 'bovinos', color: '#036446' },
    { label: 'Cultivos activos', value: '8', unit: 'lotes', color: '#185fa5' },
    { label: 'Tareas completadas', value: '89', unit: '%', color: '#036446' },
    { label: 'Score ODS', value: '74', unit: '/100', color: '#b45309' },
    { label: 'Producción leche', value: '1,240', unit: 'L/día', color: '#036446' },
  ],
  farms: [
    { name: 'Finca La Esperanza', area: 180, type: 'Ganadera', animales: 156, parcelas: 4 },
    { name: 'Lote Maíz Norte', area: 85, type: 'Agrícola', animales: 0, parcelas: 3 },
    { name: 'Palma del Río', area: 215, type: 'Palma', animales: 0, parcelas: 6 },
  ],
  animals: [
    { breed: 'Holstein', type: 'bovino', age: 36, health: 'saludable', milk: 28 },
    { breed: 'Brahman', type: 'bovino', age: 48, health: 'saludable', milk: 0 },
    { breed: 'Simmental', type: 'bovino', age: 24, health: 'tratamiento', milk: 18 },
    { breed: 'Angus', type: 'bovino', age: 60, health: 'saludable', milk: 0 },
    { breed: 'Gyr Lechero', type: 'bovino', age: 30, health: 'saludable', milk: 22 },
    { breed: 'Normando', type: 'bovino', age: 42, health: 'enfermo', milk: 0 },
  ],
  tasks: [
    { type: 'Fumigación', status: 'completada', date: '2026-03-10', farm: 'Lote Maíz Norte' },
    { type: 'Vacunación aftosa', status: 'in-progress', date: '2026-03-17', farm: 'La Esperanza' },
    { type: 'Fertilización', status: 'pending', date: '2026-03-22', farm: 'Palma del Río' },
    { type: 'Monitoreo plagas', status: 'completada', date: '2026-03-08', farm: 'Lote Maíz Norte' },
    { type: 'Riego tecnificado', status: 'pending', date: '2026-03-20', farm: 'Palma del Río' },
  ],
  alerts: [
    { type: 'Animal enfermo', message: '1 Normando requiere atención veterinaria urgente', severity: 'critical' },
    { type: 'Stock bajo', message: 'Herbicida 2-4D: 12 L restantes (mín: 20 L)', severity: 'warning' },
    { type: 'Cosecha próxima', message: 'Maíz Lote Norte listo en 8 días', severity: 'info' },
  ],
}

const HEALTH_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  saludable:   { bg: '#e8f5ef', color: '#036446', label: 'Saludable' },
  tratamiento: { bg: '#fef3e2', color: '#b45309', label: 'Tratamiento' },
  enfermo:     { bg: '#fef2f2', color: '#dc2626', label: 'Enfermo' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  completada:   { bg: '#e8f5ef', color: '#036446', label: 'Completada' },
  'in-progress':{ bg: '#e6f1fb', color: '#185fa5', label: 'En progreso' },
  pending:      { bg: '#fef3e2', color: '#b45309', label: 'Pendiente' },
}

const TABS = ['Dashboard', 'Granjas', 'Animales', 'Tareas', 'Alertas']

export default function DemoPage() {
  const [tab, setTab] = useState('Dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', fontFamily: 'Figtree, sans-serif' }}>

      {/* Banner demo */}
      <div style={{ background: '#b45309', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
          🎯 Modo Demo — Datos ficticios para demostración · No requiere cuenta
        </div>
        <Link href="/register" style={{ fontSize: '12px', padding: '5px 14px', background: 'white', color: '#b45309', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>
          Crear cuenta gratis →
        </Link>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e5e5e3', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: '#036446', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', fontFamily: 'monospace' }}>P</div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#036446', letterSpacing: '0.06em' }}>PRAIRON</span>
          <span style={{ fontSize: '11px', color: '#9b9b97', background: '#f9f9f7', padding: '2px 8px', borderRadius: '4px', border: '0.5px solid #e5e5e3' }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b6b67' }}>{DEMO_DATA.company.name}</span>
          <span style={{ fontSize: '12px', color: '#9b9b97' }}>·</span>
          <span style={{ fontSize: '12px', color: '#9b9b97' }}>{DEMO_DATA.company.location}</span>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 88px)' }}>

        {/* Sidebar */}
        <div style={{ width: '200px', background: '#fff', borderRight: '0.5px solid #e5e5e3', padding: '16px 0', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ width: '100%', padding: '10px 20px', border: 'none', background: tab === t ? '#e8f5ef' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: tab === t ? '500' : '400', color: tab === t ? '#036446' : '#6b6b67', fontFamily: 'inherit' }}>
              {t}
            </button>
          ))}
          <div style={{ margin: '16px 12px 0', padding: '12px', background: '#f9f9f7', borderRadius: '8px', border: '0.5px solid #e5e5e3' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9b9b97', letterSpacing: '0.06em', marginBottom: '8px' }}>NOH ASISTENTE IA</div>
            <div style={{ fontSize: '11px', color: '#6b6b67', lineHeight: 1.5 }}>Pregúntame sobre tu operación, cultivos o animales</div>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden' }}>

          {/* ── DASHBOARD ── */}
          {tab === 'Dashboard' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: '0 0 4px' }}>Dashboard</h1>
                <p style={{ fontSize: '13px', color: '#9b9b97', margin: 0 }}>{DEMO_DATA.company.name} · {DEMO_DATA.company.type}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {DEMO_DATA.stats.map(s => (
                  <div key={s.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '500', color: s.color, fontFamily: 'monospace', lineHeight: 1 }}>{s.value}<span style={{ fontSize: '14px', color: '#9b9b97', fontWeight: '400' }}> {s.unit}</span></div>
                    <div style={{ fontSize: '12px', color: '#9b9b97', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Alertas en dashboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DEMO_DATA.alerts.map((a, i) => (
                  <div key={i} style={{ background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'warning' ? '#fef3e2' : '#e6f1fb', border: `0.5px solid ${a.severity === 'critical' ? '#fecaca' : a.severity === 'warning' ? '#fed7aa' : '#bfdbfe'}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#3b82f6', flexShrink: 0 }} />
                    <div style={{ fontSize: '13px', color: a.severity === 'critical' ? '#dc2626' : a.severity === 'warning' ? '#b45309' : '#185fa5' }}>
                      <strong>{a.type}:</strong> {a.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GRANJAS ── */}
          {tab === 'Granjas' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: '0 0 20px' }}>Granjas</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {DEMO_DATA.farms.map((f, i) => (
                  <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>{f.name}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#e8f5ef', color: '#036446', fontWeight: '500' }}>{f.type}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                      <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#036446' }}>{f.area}</div>
                        <div style={{ fontSize: '10px', color: '#9b9b97' }}>hectáreas</div>
                      </div>
                      <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#036446' }}>{f.parcelas}</div>
                        <div style={{ fontSize: '10px', color: '#9b9b97' }}>parcelas</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANIMALES ── */}
          {tab === 'Animales' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: '0 0 20px' }}>Animales</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {DEMO_DATA.animals.map((a, i) => {
                  const hs = HEALTH_STYLES[a.health]
                  return (
                    <div key={i} style={{ background: '#fff', border: `0.5px solid ${a.health === 'enfermo' ? '#fecaca' : '#e5e5e3'}`, borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{a.breed}</div>
                          <div style={{ fontSize: '11px', color: '#9b9b97', textTransform: 'capitalize' }}>{a.type}</div>
                        </div>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: hs.bg, color: hs.color, fontWeight: '500' }}>{hs.label}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div style={{ background: '#f9f9f7', borderRadius: '5px', padding: '6px 8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18' }}>{a.age} meses</div>
                          <div style={{ fontSize: '10px', color: '#9b9b97' }}>edad</div>
                        </div>
                        <div style={{ background: '#f9f9f7', borderRadius: '5px', padding: '6px 8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18' }}>{a.milk > 0 ? a.milk + ' L' : '—'}</div>
                          <div style={{ fontSize: '10px', color: '#9b9b97' }}>leche/día</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TAREAS ── */}
          {tab === 'Tareas' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: '0 0 20px' }}>Tareas</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DEMO_DATA.tasks.map((t, i) => {
                  const ss = STATUS_STYLES[t.status]
                  return (
                    <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{t.type}</div>
                        <div style={{ fontSize: '11px', color: '#9b9b97' }}>{t.farm} · {new Date(t.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: ss.bg, color: ss.color, fontWeight: '500' }}>{ss.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── ALERTAS ── */}
          {tab === 'Alertas' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: '0 0 20px' }}>Alertas</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DEMO_DATA.alerts.map((a, i) => (
                  <div key={i} style={{ background: '#fff', border: `0.5px solid ${a.severity === 'critical' ? '#fecaca' : a.severity === 'warning' ? '#fed7aa' : '#bfdbfe'}`, borderRadius: '10px', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#3b82f6' }} />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{a.type}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'warning' ? '#fef3e2' : '#e6f1fb', color: a.severity === 'critical' ? '#dc2626' : a.severity === 'warning' ? '#b45309' : '#185fa5', fontWeight: '500' }}>
                        {a.severity === 'critical' ? 'Crítica' : a.severity === 'warning' ? 'Advertencia' : 'Info'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b6b67', paddingLeft: '18px' }}>{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ background: '#024d36', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'white', marginBottom: '4px' }}>¿Listo para digitalizar tu operación?</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/precios" style={{ fontSize: '12px', padding: '9px 18px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: '6px', textDecoration: 'none' }}>
            Ver planes
          </Link>
          <Link href="/register" style={{ fontSize: '12px', padding: '9px 18px', background: '#0dac5e', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </div>
    </div>
  )
}
