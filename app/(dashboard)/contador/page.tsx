'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

function toCSV(headers: string[], rows: any[][]) {
  const q = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  return [headers.map(q).join(','), ...rows.map(r => r.map(q).join(','))].join('\n')
}

function download(filename: string, content: string, type = 'csv') {
  const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;'
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ContadorPage() {
  const [summary, setSummary] = useState<any>(null)
  const [costReport, setCostReport] = useState<any>(null)
  const [nomina, setNomina] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'resumen'|'inventario'|'operaciones'|'nomina'>('resumen')
  const [downloading, setDownloading] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [s, c, n] = await Promise.allSettled([
          api.get('/finance_transactions'),
          api.get('/finance_costs'),
          api.get('/labor_records'),
        ])
        if (s.status === 'fulfilled') setSummary(s.value.data ?? [])
        if (c.status === 'fulfilled') setCostReport(c.value.data ?? [])
        if (n.status === 'fulfilled') setNomina(n.value.data ?? [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  function handleDownload(type: string) {
    setDownloading(type)
    const date = new Date().toLocaleDateString('es-CO').replace(/\//g, '-')
    try {
      if (type === 'inventario' && costReport) {
        const rows: any[][] = []
        costReport.inventoryByFarm?.forEach((farm: any) => {
          farm.items.forEach((item: any) => {
            rows.push([farm.farmName, item.name, item.type, item.quantity, item.unit, item.minStock, item.quantity <= item.minStock ? 'BAJO MINIMO' : 'Normal'])
          })
        })
        download('inventario_' + date + '.csv', toCSV(['Granja','Nombre','Tipo','Cantidad','Unidad','Stock Minimo','Estado'], rows))
      } else if (type === 'operaciones' && costReport) {
        const rows = costReport.tasksByMonth?.map((m: any) => [m.month, m.total, m.completed, m.pending]) || []
        download('operaciones_' + date + '.csv', toCSV(['Mes','Total Tareas','Completadas','Pendientes'], rows))
      } else if (type === 'nomina' && nomina.length > 0) {
        const rows = nomina.map((u: any) => [u.name, u.email, u.role, new Date(u.createdAt).toLocaleDateString('es-CO')])
        download('nomina_' + date + '.csv', toCSV(['Nombre','Email','Rol','Fecha Ingreso'], rows))
      } else if (type === 'resumen' && summary) {
        const lines = [
          'REPORTE FINANCIERO PRAIRON - ' + date,
          '='.repeat(50),
          '',
          'ACTIVOS PRODUCTIVOS',
          '-'.repeat(30),
          'Granjas: ' + summary.farms?.total + ' (' + summary.farms?.totalHa + ' ha)',
          'Parcelas: ' + summary.farms?.parcels,
          'Animales: ' + summary.animals?.total,
          'Produccion leche/dia: ' + summary.animals?.totalMilkPerDay + ' L',
          '',
          'INVENTARIO',
          '-'.repeat(30),
          'Total items: ' + summary.inventory?.total,
          'Items bajo minimo: ' + summary.inventory?.lowStock,
          ...Object.entries(summary.inventory?.byType || {}).map(([type, data]: any) => '  - ' + type + ': ' + data.count + ' items'),
          '',
          'OPERACIONES',
          '-'.repeat(30),
          'Total tareas: ' + summary.tasks?.total,
          'Completadas: ' + summary.tasks?.completed,
          'Pendientes: ' + summary.tasks?.pending,
          ...Object.entries(summary.tasks?.byType || {}).map(([type, count]: any) => '  - ' + type + ': ' + count),
          '',
          'Generado por PRAIRON Agroindustrial OS',
        ]
        download('resumen_financiero_' + date + '.txt', lines.join('\n'), 'txt')
      }
    } finally { setDownloading(null) }
  }

  const TABS = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'operaciones', label: 'Operaciones' },
    { key: 'nomina', label: 'Nómina' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Módulo Contador</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>Reportes financieros y operativos descargables</p>
        </div>
        <button onClick={() => handleDownload(tab)} disabled={downloading === tab || loading}
          style={{ fontSize: '12px', padding: '8px 16px', background: downloading === tab ? '#e5e5e3' : '#036446', color: downloading === tab ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: downloading === tab ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
          {downloading === tab ? 'Descargando...' : 'Descargar esta sección'}
        </button>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Granjas', value: summary.farms?.total, sub: summary.farms?.totalHa + ' ha totales' },
            { label: 'Animales', value: summary.animals?.total, sub: summary.animals?.totalMilkPerDay + ' L leche/día' },
            { label: 'Inventario', value: summary.inventory?.total, sub: summary.inventory?.lowStock + ' bajo mínimo' },
            { label: 'Tareas', value: summary.tasks?.total, sub: summary.tasks?.completed + ' completadas' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: '500', color: '#036446' }}>{loading ? '—' : m.value}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginTop: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', border: '0.5px solid #e5e5e3', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: '8px 20px', fontSize: '13px', border: 'none', cursor: 'pointer', borderRight: '0.5px solid #e5e5e3', background: tab === t.key ? '#036446' : '#fff', color: tab === t.key ? 'white' : '#6b6b67', fontWeight: tab === t.key ? '500' : '400' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#9b9b97', fontSize: '13px', padding: '40px', textAlign: 'center' }}>Cargando datos financieros...</div>
      ) : (
        <>
          {tab === 'resumen' && summary && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>ACTIVOS PRODUCTIVOS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Granjas registradas', value: summary.farms?.total + ' granjas' },
                    { label: 'Área total', value: summary.farms?.totalHa + ' hectáreas' },
                    { label: 'Parcelas', value: summary.farms?.parcels + ' parcelas' },
                    { label: 'Animales', value: summary.animals?.total + ' animales' },
                    { label: 'Producción leche', value: summary.animals?.totalMilkPerDay + ' L/día' },
                    { label: 'Animales lecheros', value: summary.animals?.milkAnimals + ' vacas' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee' }}>
                      <span style={{ fontSize: '13px', color: '#6b6b67' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>RESUMEN OPERATIVO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Total tareas', value: summary.tasks?.total },
                    { label: 'Tareas completadas', value: summary.tasks?.completed },
                    { label: 'Tareas pendientes', value: summary.tasks?.pending },
                    { label: 'Eficiencia', value: summary.tasks?.total > 0 ? Math.round(summary.tasks.completed / summary.tasks.total * 100) + '%' : '0%' },
                    { label: 'Items inventario', value: summary.inventory?.total },
                    { label: 'Items bajo mínimo', value: summary.inventory?.lowStock },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ee' }}>
                      <span style={{ fontSize: '13px', color: '#6b6b67' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2', background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>TAREAS POR TIPO</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                  {Object.entries(summary.tasks?.byType || {}).map(([type, count]: any) => (
                    <div key={type} style={{ background: '#f9f9f7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '500', color: '#036446' }}>{count}</div>
                      <div style={{ fontSize: '11px', color: '#9b9b97', textTransform: 'capitalize', marginTop: '4px' }}>{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'inventario' && costReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {costReport.inventoryByFarm?.map((farm: any) => (
                <div key={farm.farmId} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{farm.farmName}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#9b9b97' }}>{farm.totalItems} ítems</span>
                      {farm.lowStockItems > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: '#fef3e2', color: '#b45309' }}>
                          {farm.lowStockItems} bajo mínimo
                        </span>
                      )}
                    </div>
                  </div>
                  {farm.items.length === 0 ? (
                    <div style={{ padding: '16px', fontSize: '12px', color: '#9b9b97', textAlign: 'center' }}>Sin inventario</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '0.5px solid #e5e5e3' }}>
                          {['Nombre','Tipo','Cantidad','Unidad','Stock mín.','Estado'].map(h => (
                            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: '500', color: '#9b9b97', fontSize: '11px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {farm.items.map((item: any) => {
                          const isLow = item.minStock > 0 && item.quantity <= item.minStock
                          return (
                            <tr key={item.id} style={{ borderBottom: '0.5px solid #f0f0ee' }}>
                              <td style={{ padding: '8px 14px', fontWeight: '500', color: '#1a1a18' }}>{item.name}</td>
                              <td style={{ padding: '8px 14px', color: '#6b6b67' }}>{item.type}</td>
                              <td style={{ padding: '8px 14px', color: isLow ? '#dc2626' : '#1a1a18', fontWeight: isLow ? '500' : '400' }}>{item.quantity}</td>
                              <td style={{ padding: '8px 14px', color: '#6b6b67' }}>{item.unit}</td>
                              <td style={{ padding: '8px 14px', color: '#9b9b97' }}>{item.minStock || '—'}</td>
                              <td style={{ padding: '8px 14px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: isLow ? '#fef3e2' : '#e8f5ef', color: isLow ? '#b45309' : '#036446' }}>
                                  {isLow ? 'Bajo mínimo' : 'Normal'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'operaciones' && costReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e3' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>Tareas por mes</div>
                  <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>Últimos 6 meses</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid #e5e5e3' }}>
                      {['Mes','Total','Completadas','Pendientes','Eficiencia'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: '#9b9b97', fontSize: '11px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {costReport.tasksByMonth?.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9b9b97' }}>Sin datos de tareas</td></tr>
                    ) : costReport.tasksByMonth?.map((m: any) => (
                      <tr key={m.month} style={{ borderBottom: '0.5px solid #f0f0ee' }}>
                        <td style={{ padding: '10px 16px', fontWeight: '500', color: '#1a1a18' }}>{m.month}</td>
                        <td style={{ padding: '10px 16px', color: '#6b6b67' }}>{m.total}</td>
                        <td style={{ padding: '10px 16px', color: '#036446', fontWeight: '500' }}>{m.completed}</td>
                        <td style={{ padding: '10px 16px', color: '#b45309' }}>{m.pending}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '4px', background: '#e5e5e3', borderRadius: '2px', minWidth: '60px' }}>
                              <div style={{ height: '100%', width: (m.total > 0 ? Math.round(m.completed / m.total * 100) : 0) + '%', background: '#036446', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '11px', color: '#036446', fontWeight: '500', minWidth: '32px' }}>
                              {m.total > 0 ? Math.round(m.completed / m.total * 100) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'nomina' && (
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>Equipo de trabajo</div>
                  <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>{nomina.length} personas registradas</div>
                </div>
              </div>
              {nomina.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9b9b97', fontSize: '13px' }}>Sin personas registradas</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid #e5e5e3' }}>
                      {['Nombre','Email','Rol','Fecha ingreso'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: '#9b9b97', fontSize: '11px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nomina.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '0.5px solid #f0f0ee' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#036446', flexShrink: 0 }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '500', color: '#1a1a18' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#6b6b67' }}>{u.email}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: '#e8f5ef', color: '#036446' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#9b9b97' }}>
                          {new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
