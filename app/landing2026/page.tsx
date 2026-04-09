'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard adaptativo por industria
// ─────────────────────────────────────────────────────────────────────────────

type KPI = { label: string; value: string | number; color: string }

function EmptyState({ icon, title, desc, href, cta }: { icon: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', border: '0.5px dashed #e5e5e3', borderRadius: '12px' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '20px' }}>{desc}</div>
      <Link href={href} style={{ fontSize: '12px', padding: '8px 20px', background: '#036446', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>{cta}</Link>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: KPI }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '26px', fontWeight: '500', color: kpi.color, fontFamily: 'monospace', lineHeight: 1 }}>{kpi.value}</div>
      <div style={{ fontSize: '12px', color: '#9b9b97', marginTop: '4px' }}>{kpi.label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const user = getUser()
  const industry = ((user as any)?.industryType || 'MIXTO').toUpperCase()
  const nombre = user?.name?.split(' ')[0] || 'productor'

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [industry])

  async function loadDashboard() {
    setLoading(true)
    try {
      if (industry === 'AVICOLA') {
        const r = await api.get('/poultry/dashboard')
        setData({ type: 'avicola', ...r.data })
      } else if (industry === 'PALMA') {
        const r = await api.get('/palm/dashboard')
        setData({ type: 'palma', ...r.data })
      } else {
        const [summary, alerts, tasks] = await Promise.allSettled([
          api.get('/finance/summary'),
          api.get('/alerts'),
          api.get('/tasks'),
        ])
        const s = summary.status === 'fulfilled' ? summary.value.data : {}
        const a = alerts.status === 'fulfilled' ? alerts.value.data : []
        const t = tasks.status === 'fulfilled' ? tasks.value.data : []
        setData({ type: industry.toLowerCase(), summary: s, alerts: a, tasks: t })
      }
    } catch {
      setData({ type: industry.toLowerCase() })
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  // ── KPIs extraídos fuera del JSX para evitar error de parser ──
  function getKpis(): KPI[] {
    if (!data) return []
    if (data.type === 'avicola') {
      return [
        { label: 'Galpones activos',  value: data.summary?.totalHouses || 0,                                         color: '#dc2626' },
        { label: 'Lotes en curso',    value: data.summary?.activeBatches || 0,                                        color: '#dc2626' },
        { label: 'Aves totales',      value: (data.summary?.totalAnimals || 0).toLocaleString() + ' aves',            color: '#dc2626' },
        { label: 'Mortalidad prom.',  value: (data.summary?.avgMortalityRate || 0) + '%',                             color: (data.summary?.avgMortalityRate || 0) > 5 ? '#dc2626' : '#b45309' },
      ]
    }
    if (data.type === 'palma') {
      return [
        { label: 'Lotes de palma',    value: data.summary?.totalPlots || 0,                                           color: '#065f46' },
        { label: 'Hectáreas totales', value: (data.summary?.totalHa || 0) + ' ha',                                    color: '#065f46' },
        { label: 'FFB total',         value: (data.summary?.totalFFB || 0).toFixed(1) + ' ton',                       color: '#065f46' },
        { label: 'Eficiencia ext.',   value: (data.summary?.avgExtractionEfficiency || 0) + '%',                      color: (data.summary?.avgExtractionEfficiency || 0) >= 20 ? '#065f46' : '#b45309' },
      ]
    }
    if (industry === 'GANADERO') {
      return [
        { label: 'Granjas',         value: data.summary?.farms?.total || 0,                                           color: '#b45309' },
        { label: 'Animales',        value: data.summary?.animals?.total || 0,                                         color: '#b45309' },
        { label: 'Leche hoy',       value: (data.summary?.animals?.totalMilkPerDay || 0) + ' L',                      color: '#b45309' },
        { label: 'Alertas activas', value: (data.alerts || []).filter((a: any) => !a.readStatus).length,               color: '#dc2626' },
      ]
    }
    if (industry === 'AGRICOLA') {
      return [
        { label: 'Cultivos activos',  value: data.summary?.crops?.active || 0,                                        color: '#036446' },
        { label: 'Granjas',           value: data.summary?.farms?.total || 0,                                         color: '#036446' },
        { label: 'Tareas pendientes', value: (data.tasks || []).filter((t: any) => t.status !== 'completada').length,  color: '#185fa5' },
        { label: 'Alertas activas',   value: (data.alerts || []).filter((a: any) => !a.readStatus).length,             color: '#dc2626' },
      ]
    }
    // MIXTO
    return [
      { label: 'Granjas',         value: data.summary?.farms?.total || 0,                                             color: '#036446' },
      { label: 'Animales',        value: data.summary?.animals?.total || 0,                                           color: '#036446' },
      { label: 'Tareas',          value: data.summary?.tasks?.total || 0,                                             color: '#185fa5' },
      { label: 'Alertas activas', value: (data.alerts || []).filter((a: any) => !a.readStatus).length,                color: '#dc2626' },
    ]
  }

  if (loading) return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ height: '24px', background: '#e5e5e3', borderRadius: '6px', width: '200px', marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '80px', background: '#e5e5e3', borderRadius: '10px' }} />)}
      </div>
    </div>
  )

  const kpis = getKpis()
  const isGanPalMix = data?.type === 'ganadero' || data?.type === 'agricola' || data?.type === 'mixto'

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>
            {greeting}, {nombre}
          </h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {user?.companyName || 'Tu operación'} · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {industry === 'AVICOLA'  && <Link href="/avicultura" style={{ fontSize: '12px', padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Ir a galpones →</Link>}
          {industry === 'PALMA'    && <Link href="/palma"      style={{ fontSize: '12px', padding: '8px 14px', background: '#d1fae5', color: '#065f46', border: '0.5px solid #6ee7b7', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Ir a palma →</Link>}
          {industry === 'GANADERO' && <Link href="/animals"    style={{ fontSize: '12px', padding: '8px 14px', background: '#fef3e2', color: '#b45309', border: '0.5px solid #fed7aa', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Ver hato →</Link>}
          {industry === 'AGRICOLA' && <Link href="/crops"      style={{ fontSize: '12px', padding: '8px 14px', background: '#e8f5ef', color: '#036446', border: '0.5px solid #a7f3d0', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Ver cultivos →</Link>}
        </div>
      </div>

      {/* KPIs — comunes a todos los sectores */}
      {kpis.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>
      )}

      {/* ── AVICULTOR ── */}
      {data?.type === 'avicola' && (
        data.activeBatches?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {data.activeBatches.slice(0, 6).map((b: any) => {
              const mort = b.mortalityLogs?.reduce((s: number, m: any) => s + m.quantity, 0) || 0
              const mortRate = b.initialQuantity > 0 ? Math.round((mort / b.initialQuantity) * 100 * 10) / 10 : 0
              const days = Math.ceil((new Date().getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={b.id} style={{ background: '#fff', border: `0.5px solid ${mortRate > 5 ? '#fecaca' : '#e5e5e3'}`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{b.house?.name || 'Galpón'}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', fontWeight: '500' }}>{b.type}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', fontFamily: 'monospace' }}>{b.currentQuantity.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>aves · día {days}</div>
                    </div>
                    <div style={{ background: mortRate > 5 ? '#fef2f2' : '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: mortRate > 5 ? '#dc2626' : '#1a1a18', fontFamily: 'monospace' }}>{mortRate}%</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>mortalidad</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="🐔" title="Sin lotes activos" desc="Crea un galpón y registra tu primer lote" href="/avicultura" cta="Ir a avicultura" />
        )
      )}

      {/* ── PALMICULTOR ── */}
      {data?.type === 'palma' && (
        data.plots?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {data.plots.slice(0, 6).map((p: any) => (
              <div key={p.id} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '10px' }}>{p.location || '—'} · {p.plantingYear || '—'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#065f46', fontFamily: 'monospace' }}>{p.hectares}</div>
                    <div style={{ fontSize: '10px', color: '#9b9b97' }}>hectáreas</div>
                  </div>
                  <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', fontFamily: 'monospace' }}>{p._count?.harvests || 0}</div>
                    <div style={{ fontSize: '10px', color: '#9b9b97' }}>cosechas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="🌴" title="Sin lotes de palma" desc="Registra tu primer lote de palma" href="/palma" cta="Ir a palma" />
        )
      )}

      {/* ── GANADERO / AGRÍCOLA / MIXTO ── */}
      {isGanPalMix && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Alertas */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginBottom: '12px' }}>Alertas recientes</div>
            {(data.alerts?.length === 0 || !data.alerts) ? (
              <div style={{ fontSize: '12px', color: '#9b9b97', textAlign: 'center', padding: '20px 0' }}>Sin alertas activas</div>
            ) : data.alerts.slice(0, 4).map((a: any) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee', fontSize: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: a.severity === 'critical' ? '#ef4444' : '#f59e0b', flexShrink: 0, marginTop: '4px' }} />
                <div style={{ color: '#6b6b67', lineHeight: 1.4 }}>{a.message}</div>
              </div>
            ))}
            <Link href="/alerts" style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: '#036446', fontWeight: '500', textDecoration: 'none' }}>Ver todas las alertas →</Link>
          </div>

          {/* Tareas */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginBottom: '12px' }}>Tareas pendientes</div>
            {(data.tasks?.filter((t: any) => t.status !== 'completada').length === 0 || !data.tasks) ? (
              <div style={{ fontSize: '12px', color: '#9b9b97', textAlign: 'center', padding: '20px 0' }}>Sin tareas pendientes</div>
            ) : data.tasks.filter((t: any) => t.status !== 'completada').slice(0, 4).map((t: any) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee', fontSize: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#185fa5', flexShrink: 0 }} />
                <div style={{ flex: 1, color: '#1a1a18' }}>{t.type || t.title || 'Tarea'}</div>
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: '#e6f1fb', color: '#185fa5' }}>{t.status}</span>
              </div>
            ))}
            <Link href="/tasks" style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: '#036446', fontWeight: '500', textDecoration: 'none' }}>Ver todas las tareas →</Link>
          </div>
        </div>
      )}

    </div>
  )
}
