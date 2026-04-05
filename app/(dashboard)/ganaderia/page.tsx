'use client'

import { useState } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Especie = 'bovino_carne' | 'bovino_leche' | 'porcino' | 'ovino' | 'caprino'
type SexoAnimal = 'macho' | 'hembra'
type EstadoSanidad = 'sano' | 'en_tratamiento' | 'cuarentena' | 'baja'
type EstadoReproductivo = 'vacio' | 'gestante' | 'lactando' | 'servicio'

interface Animal {
  id: string
  arete: string
  nombre?: string
  especie: Especie
  raza: string
  sexo: SexoAnimal
  fechaNacimiento: string
  lote: string
  pesoActual: number
  estadoSanidad: EstadoSanidad
  estadoReproductivo?: EstadoReproductivo
  produccionLeche?: number // litros/día
}

interface Lote {
  id: string
  nombre: string
  potrero: string
  especie: Especie
  capacidad: number
  animales: number
}

interface EventoPesaje {
  id: string
  fecha: string
  arete: string
  pesoAnterior: number
  pesoActual: number
  gmd: number // ganancia media diaria
}

interface EventoSanitario {
  id: string
  fecha: string
  tipo: 'vacuna' | 'desparasitacion' | 'tratamiento' | 'cirugia'
  descripcion: string
  animalesAfectados: number
  veterinario: string
  proximaFecha?: string
}

interface EventoReproductivo {
  id: string
  fecha: string
  tipo: 'servicio' | 'diagnostico_gestacion' | 'parto' | 'destete' | 'celo'
  arete: string
  resultado?: string
  observacion?: string
}

interface Potrero {
  id: string
  nombre: string
  hectareas: number
  forraje: string
  capacidadCarga: number
  animalesActuales: number
  estadoPastura: 'optimo' | 'pastoreando' | 'descanso' | 'critico'
  diasDescanso?: number
}

// ─── Datos demo ───────────────────────────────────────────────────────────────

const ANIMALES_DEMO: Animal[] = [
  { id: '1', arete: 'BOV-001', nombre: 'Rosita', especie: 'bovino_leche', raza: 'Holstein', sexo: 'hembra', fechaNacimiento: '2021-03-15', lote: 'Lote A', pesoActual: 520, estadoSanidad: 'sano', estadoReproductivo: 'lactando', produccionLeche: 22 },
  { id: '2', arete: 'BOV-002', especie: 'bovino_carne', raza: 'Brahman', sexo: 'macho', fechaNacimiento: '2023-01-10', lote: 'Lote B', pesoActual: 380, estadoSanidad: 'sano' },
  { id: '3', arete: 'BOV-003', nombre: 'Luna', especie: 'bovino_leche', raza: 'Jersey', sexo: 'hembra', fechaNacimiento: '2020-07-22', lote: 'Lote A', pesoActual: 445, estadoSanidad: 'en_tratamiento', estadoReproductivo: 'gestante', produccionLeche: 18 },
  { id: '4', arete: 'POR-001', especie: 'porcino', raza: 'Landrace', sexo: 'hembra', fechaNacimiento: '2023-06-01', lote: 'Lote C', pesoActual: 185, estadoSanidad: 'sano', estadoReproductivo: 'gestante' },
  { id: '5', arete: 'OVI-001', especie: 'ovino', raza: 'Pelibuey', sexo: 'hembra', fechaNacimiento: '2022-11-05', lote: 'Lote D', pesoActual: 48, estadoSanidad: 'sano', estadoReproductivo: 'vacio' },
  { id: '6', arete: 'BOV-004', especie: 'bovino_carne', raza: 'Simmental', sexo: 'macho', fechaNacimiento: '2022-09-18', lote: 'Lote B', pesoActual: 510, estadoSanidad: 'cuarentena' },
]

const LOTES_DEMO: Lote[] = [
  { id: 'a', nombre: 'Lote A', potrero: 'Potrero Norte', especie: 'bovino_leche', capacidad: 40, animales: 22 },
  { id: 'b', nombre: 'Lote B', potrero: 'Potrero Sur', especie: 'bovino_carne', capacidad: 60, animales: 35 },
  { id: 'c', nombre: 'Lote C', potrero: 'Corral Porcinos', especie: 'porcino', capacidad: 50, animales: 28 },
  { id: 'd', nombre: 'Lote D', potrero: 'Potrero Este', especie: 'ovino', capacidad: 80, animales: 55 },
]

const PESAJES_DEMO: EventoPesaje[] = [
  { id: '1', fecha: '2025-03-20', arete: 'BOV-002', pesoAnterior: 355, pesoActual: 380, gmd: 0.89 },
  { id: '2', fecha: '2025-03-20', arete: 'BOV-004', pesoAnterior: 488, pesoActual: 510, gmd: 0.79 },
  { id: '3', fecha: '2025-03-15', arete: 'POR-001', pesoAnterior: 170, pesoActual: 185, gmd: 1.07 },
]

const SANITARIOS_DEMO: EventoSanitario[] = [
  { id: '1', fecha: '2025-03-10', tipo: 'vacuna', descripcion: 'Aftosa + Brucelosis', animalesAfectados: 57, veterinario: 'Dr. Ramírez', proximaFecha: '2025-09-10' },
  { id: '2', fecha: '2025-03-18', tipo: 'tratamiento', descripcion: 'Mastitis BOV-003', animalesAfectados: 1, veterinario: 'Dr. Ramírez' },
  { id: '3', fecha: '2025-02-28', tipo: 'desparasitacion', descripcion: 'Ivermectina rotación', animalesAfectados: 90, veterinario: 'Dr. Mora', proximaFecha: '2025-05-28' },
]

const REPRODUCTIVOS_DEMO: EventoReproductivo[] = [
  { id: '1', fecha: '2025-03-22', tipo: 'diagnostico_gestacion', arete: 'BOV-003', resultado: 'Positivo — 90 días', observacion: 'Parto estimado 15 Jun' },
  { id: '2', fecha: '2025-03-20', tipo: 'celo', arete: 'OVI-001', observacion: 'Apta para servicio' },
  { id: '3', fecha: '2025-03-15', tipo: 'parto', arete: 'BOV-001', resultado: 'Ternero macho — 38 kg', observacion: 'Parto normal' },
]

const POTREROS_DEMO: Potrero[] = [
  { id: '1', nombre: 'Potrero Norte', hectareas: 12, forraje: 'Brachiaria decumbens', capacidadCarga: 40, animalesActuales: 22, estadoPastura: 'pastoreando' },
  { id: '2', nombre: 'Potrero Sur', hectareas: 20, forraje: 'Pará + King grass', capacidadCarga: 65, animalesActuales: 35, estadoPastura: 'optimo' },
  { id: '3', nombre: 'Potrero Este', hectareas: 8, forraje: 'Estrella africana', capacidadCarga: 30, animalesActuales: 0, estadoPastura: 'descanso', diasDescanso: 18 },
  { id: '4', nombre: 'Potrero Oeste', hectareas: 6, forraje: 'Brachiaria brizantha', capacidadCarga: 20, animalesActuales: 18, estadoPastura: 'critico' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ESPECIE_LABELS: Record<Especie, string> = {
  bovino_carne: '🐄 Bovino Carne',
  bovino_leche: '🥛 Bovino Leche',
  porcino: '�� Porcino',
  ovino: '🐑 Ovino',
  caprino: '🐐 Caprino',
}

const SANIDAD_STYLES: Record<EstadoSanidad, { bg: string; color: string; label: string }> = {
  sano:            { bg: '#d1fae5', color: '#065f46', label: 'Sano' },
  en_tratamiento:  { bg: '#fef3c7', color: '#92400e', label: 'En tratamiento' },
  cuarentena:      { bg: '#fee2e2', color: '#991b1b', label: 'Cuarentena' },
  baja:            { bg: '#f3f4f6', color: '#6b7280', label: 'Baja' },
}

const PASTURA_STYLES: Record<Potrero['estadoPastura'], { bg: string; color: string; label: string; icon: string }> = {
  optimo:      { bg: '#d1fae5', color: '#065f46', label: 'Óptimo',      icon: '🟢' },
  pastoreando: { bg: '#dbeafe', color: '#1e40af', label: 'Pastoreando', icon: '🔵' },
  descanso:    { bg: '#fef9c3', color: '#854d0e', label: 'Descanso',    icon: '🟡' },
  critico:     { bg: '#fee2e2', color: '#991b1b', label: 'Crítico',     icon: '🔴' },
}

type Tab = 'inventario' | 'pesajes' | 'sanidad' | 'reproduccion' | 'pasturas'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function GanaderiaPage() {
  const [tab, setTab] = useState<Tab>('inventario')
  const [animales, setAnimales] = useState<Animal[]>(ANIMALES_DEMO)
  const [lotes] = useState<Lote[]>(LOTES_DEMO)
  const [pesajes, setPesajes] = useState<EventoPesaje[]>(PESAJES_DEMO)
  const [sanitarios, setSanitarios] = useState<EventoSanitario[]>(SANITARIOS_DEMO)
  const [reproductivos, setReproductivos] = useState<EventoReproductivo[]>(REPRODUCTIVOS_DEMO)
  const [potreros, setPotreros] = useState<Potrero[]>(POTREROS_DEMO)
  const [filtroEspecie, setFiltroEspecie] = useState<Especie | 'todos'>('todos')
  const [showModal, setShowModal] = useState(false)

  // KPIs
  const totalAnimales = animales.length
  const totalSanos = animales.filter(a => a.estadoSanidad === 'sano').length
  const gestantes = animales.filter(a => a.estadoReproductivo === 'gestante').length
  const produccionTotal = animales.reduce((s, a) => s + (a.produccionLeche ?? 0), 0)
  const gmdPromedio = pesajes.length ? (pesajes.reduce((s, p) => s + p.gmd, 0) / pesajes.length).toFixed(2) : '—'

  const animalesFiltrados = filtroEspecie === 'todos'
    ? animales
    : animales.filter(a => a.especie === filtroEspecie)

  const handleDeleteAnimal = async (id: string, arete: string) => {
    const ok = window.confirm(`¿Eliminar ${arete}?`)
    if (ok) setAnimales(prev => prev.filter(a => a.id !== id))
  }

  const handleDeleteSanitario = async (id: string, desc: string) => {
    const ok = window.confirm(`¿Eliminar "${desc}"?`)
    if (ok) setSanitarios(prev => prev.filter(s => s.id !== id))
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'inventario',   label: 'Inventario',    icon: '🐄' },
    { key: 'pesajes',      label: 'Pesajes',        icon: '⚖️' },
    { key: 'sanidad',      label: 'Sanidad',        icon: '💉' },
    { key: 'reproduccion', label: 'Reproducción',   icon: '🐣' },
    { key: 'pasturas',     label: 'Pasturas',       icon: '🌿' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary, #111)', margin: 0 }}>
            🐄 Ganadería
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', marginTop: '4px', fontSize: '0.875rem' }}>
            Bovinos · Porcinos · Ovinos · Caprinos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          + Registrar animal
        </button>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total animales',    value: totalAnimales,       unit: 'cabezas',   color: '#16a34a' },
          { label: 'Animales sanos',    value: `${totalAnimales ? Math.round(totalAnimales ? (totalSanos/totalAnimales)*100 : 0) : 0}%`, unit: `${totalSanos} cab.`, color: '#059669' },
          { label: 'Gestantes',         value: gestantes,           unit: 'hembras',   color: '#d97706' },
          { label: 'Producción leche',  value: produccionTotal,     unit: 'L/día',     color: '#0284c7' },
          { label: 'GMD Promedio',      value: gmdPromedio,         unit: 'kg/día',    color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)', margin: '0 0 6px' }}>{k.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color, margin: '0 0 2px' }}>{k.value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #9ca3af)', margin: 0 }}>{k.unit}</p>
          </div>
        ))}
      </div>

      {/* ── Lotes resumen ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {lotes.map(l => (
          <div key={l.id} style={{ background: 'var(--card-bg, #f9fafb)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.nombre}</span>
              <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#065f46', borderRadius: '6px', padding: '2px 8px' }}>
                {ESPECIE_LABELS[l.especie].split(' ')[0]}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)' }}>{l.potrero}</div>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                <span>{l.animales} animales</span>
                <span>{Math.round((l.animales / l.capacidad) * 100)}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '99px', height: '6px' }}>
                <div style={{ background: l.animales / l.capacidad > 0.9 ? '#ef4444' : '#16a34a', borderRadius: '99px', height: '6px', width: `${Math.min((l.animales / l.capacidad) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border, #e5e7eb)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px',
              fontWeight: tab === t.key ? 700 : 400, fontSize: '0.875rem',
              color: tab === t.key ? '#16a34a' : 'var(--text-secondary, #6b7280)',
              borderBottom: tab === t.key ? '2px solid #16a34a' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══ INVENTARIO ═══════════════════════════════════════════════════════ */}
      {tab === 'inventario' && (
        <div>
          {/* Filtro especie */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(['todos', 'bovino_carne', 'bovino_leche', 'porcino', 'ovino', 'caprino'] as const).map(e => (
              <button
                key={e}
                onClick={() => setFiltroEspecie(e)}
                style={{
                  border: `1px solid ${filtroEspecie === e ? '#16a34a' : '#d1d5db'}`,
                  background: filtroEspecie === e ? '#d1fae5' : 'transparent',
                  color: filtroEspecie === e ? '#065f46' : '#6b7280',
                  borderRadius: '20px', padding: '4px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: filtroEspecie === e ? 600 : 400,
                }}
              >
                {e === 'todos' ? '🐾 Todos' : ESPECIE_LABELS[e]}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--table-head, #f9fafb)', borderBottom: '2px solid var(--border, #e5e7eb)' }}>
                  {['Arete', 'Nombre', 'Especie', 'Raza', 'Sexo', 'Lote', 'Peso (kg)', 'Sanidad', 'Reproductivo', 'Leche L/d', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--text-secondary, #6b7280)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {animalesFiltrados.map(a => {
                  const san = SANIDAD_STYLES[a.estadoSanidad]
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border, #f3f4f6)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'monospace' }}>{a.arete}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary, #6b7280)' }}>{a.nombre ?? '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{ESPECIE_LABELS[a.especie]}</td>
                      <td style={{ padding: '10px 12px' }}>{a.raza}</td>
                      <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{a.sexo}</td>
                      <td style={{ padding: '10px 12px' }}>{a.lote}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{a.pesoActual}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: san.bg, color: san.color, borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {san.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
                        {a.estadoReproductivo ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{a.produccionLeche ?? '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => handleDeleteAnimal(a.id, a.arete)}
                          style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {animalesFiltrados.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Sin animales registrados para este filtro.</p>
            )}
          </div>
        </div>
      )}

      {/* ═══ PESAJES ══════════════════════════════════════════════════════════ */}
      {tab === 'pesajes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              GMD promedio: <strong style={{ color: '#7c3aed' }}>{gmdPromedio} kg/día</strong>
            </p>
            <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              + Registrar pesaje
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Fecha', 'Arete', 'Peso anterior (kg)', 'Peso actual (kg)', 'Ganancia (kg)', 'GMD (kg/día)'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pesajes.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px' }}>{p.fecha}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'monospace' }}>{p.arete}</td>
                    <td style={{ padding: '10px 12px' }}>{p.pesoAnterior}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{p.pesoActual}</td>
                    <td style={{ padding: '10px 12px', color: '#16a34a', fontWeight: 600 }}>+{(p.pesoActual - p.pesoAnterior).toFixed(1)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: p.gmd >= 0.9 ? '#d1fae5' : p.gmd >= 0.6 ? '#fef3c7' : '#fee2e2',
                        color: p.gmd >= 0.9 ? '#065f46' : p.gmd >= 0.6 ? '#92400e' : '#991b1b',
                        borderRadius: '6px', padding: '2px 8px', fontWeight: 700, fontSize: '0.8rem',
                      }}>
                        {p.gmd}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ SANIDAD ══════════════════════════════════════════════════════════ */}
      {tab === 'sanidad' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              + Nuevo evento sanitario
            </button>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {sanitarios.map(s => (
              <div key={s.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {s.tipo === 'vacuna' ? '💉' : s.tipo === 'desparasitacion' ? '🧪' : s.tipo === 'tratamiento' ? '💊' : '🔪'}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{s.descripcion}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                        {s.fecha} · {s.animalesAfectados} animales · Dr. {s.veterinario.replace('Dr. ', '')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {s.proximaFecha && (
                      <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '6px', padding: '3px 10px' }}>
                        Próxima: {s.proximaFecha}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSanitario(s.id, s.descripcion)}
                      style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ REPRODUCCIÓN ═════════════════════════════════════════════════════ */}
      {tab === 'reproduccion' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              + Nuevo evento reproductivo
            </button>
          </div>
          {/* Resumen reproductivo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {(['vacio', 'gestante', 'lactando', 'servicio'] as EstadoReproductivo[]).map(estado => {
              const count = animales.filter(a => a.estadoReproductivo === estado).length
              const colors: Record<string, string> = { vacio: '#6b7280', gestante: '#d97706', lactando: '#0284c7', servicio: '#7c3aed' }
              return (
                <div key={estado} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: colors[estado], margin: '0 0 4px' }}>{count}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{estado.replace('_', ' ')}</p>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {reproductivos.map(r => (
              <div key={r.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '10px', padding: '14px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {r.tipo === 'parto' ? '🐣' : r.tipo === 'diagnostico_gestacion' ? '🔬' : r.tipo === 'celo' ? '❤️' : r.tipo === 'servicio' ? '🐂' : '🍼'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'capitalize' }}>{r.tipo.replace(/_/g, ' ')}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#7c3aed', background: '#ede9fe', borderRadius: '4px', padding: '1px 6px' }}>{r.arete}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{r.fecha}</span>
                  </div>
                  {r.resultado && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>{r.resultado}</p>}
                  {r.observacion && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>{r.observacion}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PASTURAS ═════════════════════════════════════════════════════════ */}
      {tab === 'pasturas' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              + Nuevo potrero
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {potreros.map(p => {
              const est = PASTURA_STYLES[p.estadoPastura]
              const ocupacion = p.capacidadCarga > 0 ? (p.animalesActuales / p.capacidadCarga) : 0
              return (
                <div key={p.id} style={{ background: 'var(--card-bg, #fff)', border: `1px solid ${est.color}40`, borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{p.nombre}</h3>
                    <span style={{ background: est.bg, color: est.color, borderRadius: '6px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {est.icon} {est.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
                    <span>🌾 {p.forraje}</span>
                    <span style={{ margin: '0 8px' }}>·</span>
                    <span>📐 {p.hectareas} ha</span>
                    {p.diasDescanso !== undefined && <span style={{ marginLeft: '8px' }}>⏳ {p.diasDescanso} días descanso</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px' }}>
                    <span>{p.animalesActuales} / {p.capacidadCarga} animales</span>
                    <span style={{ fontWeight: 700, color: ocupacion > 0.9 ? '#ef4444' : '#16a34a' }}>{Math.round(ocupacion * 100)}% carga</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: '99px', height: '8px' }}>
                    <div style={{
                      background: ocupacion > 0.9 ? '#ef4444' : ocupacion > 0.7 ? '#f59e0b' : '#16a34a',
                      borderRadius: '99px', height: '8px',
                      width: `${Math.min(ocupacion * 100, 100)}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Modal placeholder ── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 700 }}>Registrar animal</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 24px' }}>Formulario de alta de animal (conectar con API)</p>
            <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


