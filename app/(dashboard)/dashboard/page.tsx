'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import Link from 'next/link'

// ─── Utilidades ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('es-CO') ?? '0'
const fmtCOP = (n: number) => `$${fmt(Math.round(n || 0))}`

function getRoleGroup(roleName: string): 'owner' | 'field' | 'finance' | 'worker' {
  const r = roleName?.toLowerCase() || ''
  if (r.includes('dueño') || r.includes('gerente') || r.includes('administrador')) return 'owner'
  if (r.includes('contador') || r.includes('financ')) return 'finance'
  if (r.includes('trabajador') || r.includes('operario') || r.includes('jornal')) return 'worker'
  return 'field' // ingeniero, supervisor, veterinario
}

// ─── Componentes premium ──────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon, trend, trendUp, trendDown, trendNeutral }: { label: string; value: string|number; sub?: string; color: string; icon: string; trend?: 'up'|'down'|'neutral'; trendUp?: string; trendDown?: string; trendNeutral?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 14, padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {trend && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: trend==='up'?'#e8f5ef':trend==='down'?'#fef2f2':'#f5f5f3', color: trend==='up'?'#036446':trend==='down'?'#dc2626':'#6b6b67' }}>
          {trend==='up'?(trendUp||'↑'):trend==='down'?(trendDown||'↓'):(trendNeutral||'→')}
        </span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children, href, cta }: { title: string; children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 14, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</div>
        {href && <Link href={href} style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>{cta} →</Link>}
      </div>
      {children}
    </div>
  )
}

function AlertRow({ a }: { a: any }) {
  const colors: Record<string, string> = { critical: '#ef4444', warning: '#f59e0b', info: '#185fa5' }
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border-color)', alignItems: 'flex-start' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[a.severity]||'#9b9b97', flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{a.message}</div>
      <span style={{ fontSize: 10, color: colors[a.severity]||'#9b9b97', fontWeight: 600, flexShrink: 0 }}>{a.severity}</span>
    </div>
  )
}

function TaskRow({ t }: { t: any }) {
  const statusColor: Record<string, string> = { pendiente: '#f59e0b', 'en_progreso': '#185fa5', completada: '#036446' }
  const sc = statusColor[t.status] || '#9b9b97'
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border-color)', alignItems: 'center' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>{t.type || t.title || 'Tarea'}</div>
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: sc+'22', color: sc, fontWeight: 600 }}>{t.status}</span>
    </div>
  )
}

function EmptyMini({ icon, text }: { icon: string; text: string }) {
  return <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--color-text-secondary)' }}><div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>{text}</div>
}

// ─── Vista Dueño/Gerente ──────────────────────────────────────────────────────
function OwnerView({ data, industry, t }: { data: any; industry: string; t: any }) {
  const s = data?.summary || {}
  const kpis: { label: string; value: string|number; icon: string; color: string; trend: 'up'|'down'|'neutral' }[] = industry === 'AVICOLA' ? [
    { label: 'Galpones activos', value: s.totalHouses||0, icon: '🏠', color: '#dc2626', trend: 'neutral' as const },
    { label: 'Aves en producción', value: fmt(s.totalAnimals||0), icon: '🐔', color: '#dc2626', trend: 'up' as const },
    { label: 'Mortalidad promedio', value: `${s.avgMortalityRate||0}%`, icon: '📉', color: (s.avgMortalityRate||0)>5?'#ef4444':'#036446', trend: ((s.avgMortalityRate||0)>5?'down':'up') as 'up'|'down'|'neutral' },
    { label: 'Lotes activos', value: s.activeBatches||0, icon: '📦', color: '#185fa5', trend: 'neutral' as const },
  ] : industry === 'PALMA' ? [
    { label: 'Lotes de palma', value: s.totalPlots||0, icon: '🌴', color: '#036446', trend: 'neutral' as const },
    { label: 'Hectáreas totales', value: `${s.totalHectares||0} ha`, icon: '📐', color: '#036446', trend: 'neutral' as const },
    { label: 'FFB total', value: `${s.totalFFB||0} ton`, icon: '⚖️', color: '#b45309', trend: 'up' as const },
    { label: 'Eficiencia ext.', value: `${s.avgEfficiency||0}%`, icon: '⚙️', color: '#185fa5', trend: 'neutral' as const },
  ] : [
    { label: 'Ingresos del mes', value: fmtCOP(s.totalIncome||0), icon: '💰', color: '#036446', trend: 'up' as const },
    { label: 'Egresos del mes', value: fmtCOP(s.totalExpenses||0), icon: '📤', color: '#dc2626', trend: 'neutral' as const },
    { label: 'Balance neto', value: fmtCOP((s.totalIncome||0)-(s.totalExpenses||0)), icon: '��', color: (s.totalIncome||0)>(s.totalExpenses||0)?'#036446':'#dc2626', trend: ((s.totalIncome||0)>(s.totalExpenses||0)?'up':'down') as 'up'|'down'|'neutral' },
    { label: 'Alertas activas', value: data?.alerts?.filter((a:any)=>!a.readStatus)?.length||0, icon: '🔔', color: '#f59e0b', trend: 'neutral' as const },
  ]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {kpis.map(k => <KpiCard key={k.label} {...k} trendUp={t('dashboard_page.trend_up')} trendDown={t('dashboard_page.trend_down')} trendNeutral={t('dashboard_page.trend_neutral')} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title={t("dashboard_page.recent_alerts")} href="/alerts" cta={t('dashboard_page.view_all')}>
          {(!data?.alerts?.length) ? <EmptyMini icon="✅" text={t("dashboard_page.no_alerts")} /> : data.alerts.slice(0,5).map((a:any) => <AlertRow key={a.id} a={a} />)}
        </SectionCard>
        <SectionCard title={t("dashboard_page.pending_tasks")} href="/tasks" cta={t('dashboard_page.view_all')}>
          {(!data?.tasks?.length) ? <EmptyMini icon="🎉" text={t("dashboard_page.no_tasks")} /> : data.tasks.filter((t:any)=>t.status!=='completada').slice(0,5).map((t:any) => <TaskRow key={t.id} t={t} />)}
        </SectionCard>
      </div>
    </>
  )
}

// ─── Vista Ingeniero/Supervisor ───────────────────────────────────────────────
function FieldView({ data, t }: { data: any; t: any }) {
  const tasks = (data?.tasks||[]).filter((t:any) => t.status !== 'completada')
  const alerts = (data?.alerts||[]).filter((a:any) => a.severity === 'critical' || a.severity === 'warning')
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard_page.my_tasks")} value={tasks.length} icon="📋" color="#185fa5" trend={tasks.length>5?'down':'neutral'} />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard_page.tech_alerts")} value={alerts.length} icon="⚠️" color="#f59e0b" trend={alerts.length>0?'down':'up'} />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard_page.pending_tasks")} value={(data?.tasks||[]).filter((t:any)=>t.status==='completada').length} icon="✅" color="#036446" trend="up" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        <SectionCard title={t("dashboard_page.my_tasks")} href="/tasks" cta={t('dashboard_page.view_all')}>
          {!tasks.length ? <EmptyMini icon="🎉" text={t("dashboard_page.no_tasks")} /> : tasks.slice(0,8).map((t:any) => <TaskRow key={t.id} t={t} />)}
        </SectionCard>
        <SectionCard title={t("dashboard_page.tech_alerts")} href="/alerts" cta={t('dashboard_page.view_all')}>
          {!alerts.length ? <EmptyMini icon="✅" text={t("dashboard_page.no_tech_alerts")} /> : alerts.slice(0,5).map((a:any) => <AlertRow key={a.id} a={a} />)}
        </SectionCard>
      </div>
    </>
  )
}

// ─── Vista Contador ───────────────────────────────────────────────────────────
function FinanceView({ data, t }: { data: any; t: any }) {
  const s = data?.summary || {}
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard.monthly_income")} value={fmtCOP(s.totalIncome||0)} icon="💰" color="#036446" trend="up" />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard.monthly_expenses")} value={fmtCOP(s.totalExpenses||0)} icon="📤" color="#dc2626" trend="neutral" />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard.net_balance")} value={fmtCOP((s.totalIncome||0)-(s.totalExpenses||0))} icon="📊" color={(s.totalIncome||0)>(s.totalExpenses||0)?'#036446':'#dc2626'} trend={(s.totalIncome||0)>(s.totalExpenses||0)?'up':'down'} />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label="Transacciones" value={s.transactionCount||0} icon="🧾" color="#185fa5" trend="neutral" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title={t("dashboard_page.transactions")} href="/contador" cta={t('dashboard_page.view_all')}>
          {(!s.recentTransactions?.length) ? <EmptyMini icon="📭" text={t("dashboard_page.no_transactions")} /> :
            s.recentTransactions?.slice(0,5).map((t:any) => (
              <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid var(--border-color)', fontSize:12 }}>
                <div style={{ color:'var(--color-text-secondary)' }}>{t.description||t.category}</div>
                <div style={{ fontWeight:600, color: t.type==='INGRESO'?'#036446':'#dc2626' }}>{t.type==='INGRESO'?'+':'-'}{fmtCOP(t.amount)}</div>
              </div>
            ))
          }
        </SectionCard>
        <SectionCard title={t("dashboard_page.pending_payroll")} href="/rrhh" cta={t('dashboard_page.view_all')}>
          <EmptyMini icon="👷" text={t("dashboard_page.payroll_hint")} />
        </SectionCard>
      </div>
    </>
  )
}

// ─── Vista Trabajador ─────────────────────────────────────────────────────────
function WorkerView({ data, t }: { data: any; t: any }) {
  const tasks = (data?.tasks||[]).filter((t:any) => t.status !== 'completada')
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard_page.my_tasks")} value={tasks.length} icon="📋" color="#185fa5" trend="neutral" />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label={t("dashboard_page.pending_tasks")} value={(data?.tasks||[]).filter((t:any)=>t.status==='completada').length} icon="✅" color="#036446" trend="up" />
        <KpiCard trendUp={t("dashboard_page.trend_up")} trendDown={t("dashboard_page.trend_down")} trendNeutral={t("dashboard_page.trend_neutral")} label="Urgentes" value={(data?.tasks||[]).filter((t:any)=>t.status==='pendiente').length} icon="⚡" color="#f59e0b" trend="neutral" />
      </div>
      <SectionCard title={t("dashboard_page.assigned_tasks")} href="/tasks" cta={t('dashboard_page.view_all')}>
        {!tasks.length ? <EmptyMini icon="🎉" text={t("dashboard_page.no_assigned")} /> : tasks.slice(0,10).map((t:any) => <TaskRow key={t.id} t={t} />)}
      </SectionCard>
    </>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useI18n()
  const user = getUser()
  const industry = ((user as any)?.industryType || 'MIXTO').toUpperCase()
  const roleName = (user as any)?.roleName || 'Dueño'
  const roleGroup = getRoleGroup(roleName)
  const nombre = user?.name?.split(' ')[0] || 'productor'
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [industry, roleGroup])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [alertsRes, tasksRes, prodsRes] = await Promise.all([
        api.get('/alerts?limit=5').catch(() => ({ data: [] })),
        api.get('/tasks?limit=5').catch(() => ({ data: [] })),
        api.get('/production_records?limit=10').catch(() => ({ data: [] })),
      ])
      setData({
        type: industry.toLowerCase(),
        alerts: alertsRes.data || [],
        tasks: tasksRes.data || [],
        productions: prodsRes.data || [],
        summary: {}
      })
    } catch { setData({ type: industry.toLowerCase() }) }
    finally { setLoading(false) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard_page.greeting_morning') : hour < 19 ? t('dashboard_page.greeting_afternoon') : t('dashboard_page.greeting_evening')

  const roleLabel: Record<string, string> = { owner: '👑 Dueño / Gerente', field: '🌿 Campo', finance: '💼 Contador', worker: '👷 Trabajador' }
  const industryColor: Record<string, string> = { AVICOLA: '#dc2626', PALMA: '#036446', GANADERO: '#b45309', AGRICOLA: '#185fa5', MIXTO: '#6d28d9' }
  const ic = industryColor[industry] || '#036446'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header premium */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{greeting}, {nombre}</h1>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: ic+'18', color: ic, border: `0.5px solid ${ic}44` }}>{roleLabel[roleGroup]}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            {(user as any)?.companyName || 'Tu operación'} · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {industry==='AVICOLA'  && <Link href="/avicultura" style={{ fontSize:12, padding:'8px 14px', background:'#fef2f2', color:'#dc2626', border:'0.5px solid #fecaca', borderRadius:8, textDecoration:'none', fontWeight:600 }}>Galpones →</Link>}
          {industry==='PALMA'    && <Link href="/palma"      style={{ fontSize:12, padding:'8px 14px', background:'#e8f5ef', color:'#036446', border:'0.5px solid #6ee7b7', borderRadius:8, textDecoration:'none', fontWeight:600 }}>Palma →</Link>}
          {industry==='GANADERO' && <Link href="/animals"    style={{ fontSize:12, padding:'8px 14px', background:'#fef3e2', color:'#b45309', border:'0.5px solid #fed7aa', borderRadius:8, textDecoration:'none', fontWeight:600 }}>Hato →</Link>}
          {industry==='AGRICOLA' && <Link href="/crops"      style={{ fontSize:12, padding:'8px 14px', background:'#e8f5ef', color:'#036446', border:'0.5px solid #a7f3d0', borderRadius:8, textDecoration:'none', fontWeight:600 }}>Cultivos →</Link>}
          <Link href="/certificaciones" style={{ fontSize:12, padding:'8px 14px', background:'var(--bg-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--border-color)', borderRadius:8, textDecoration:'none', fontWeight:600 }}>{t('dashboard_page.certifications')}</Link>
        </div>
      </div>

      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height:100, background:'var(--bg-secondary)', borderRadius:14, animation:'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      )}

      {!loading && data && (
        <>
          {roleGroup === 'owner'   && <OwnerView data={data} industry={industry} t={t} />}
          {roleGroup === 'field'   && <FieldView data={data} t={t} />}
          {roleGroup === 'finance' && <FinanceView data={data} t={t} />}
          {roleGroup === 'worker'  && <WorkerView data={data} t={t} />}
        </>
      )}
    </div>
  )
}
