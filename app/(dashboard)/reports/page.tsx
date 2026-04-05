'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { getRole } from '@/lib/auth'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

const TEMPLATES: Record<string, any[]> = {
  'dueño': [
    { id: 'reporte_ejecutivo', label: 'Reporte ejecutivo mensual', desc: 'KPIs, granjas, animales, tareas y alertas', icon: '📊', type: 'txt' },
    { id: 'inventario_completo', label: 'Inventario completo', desc: 'Todos los ítems con stock y valores', icon: '📦', type: 'csv' },
    { id: 'resumen_operativo', label: 'Resumen operativo', desc: 'Estado de granjas, cultivos y personal', icon: '🏡', type: 'txt' },
    { id: 'plan_anual', label: 'Plan anual de producción', desc: 'Plantilla para planificación de ciclos', icon: '📅', type: 'csv' },
  ],
  'gerente': [
    { id: 'reporte_semanal', label: 'Reporte semanal de operaciones', desc: 'Tareas completadas, pendientes y alertas', icon: '📋', type: 'txt' },
    { id: 'productividad_equipo', label: 'Productividad del equipo', desc: 'Tareas por trabajador y eficiencia', icon: '👥', type: 'csv' },
    { id: 'control_inventario', label: 'Control de inventario', desc: 'Stock actual vs mínimos requeridos', icon: '📦', type: 'csv' },
  ],
  'veterinario': [
    { id: 'ficha_animal', label: 'Ficha clínica animal', desc: 'Historial completo por animal', icon: '🐄', type: 'txt' },
    { id: 'registro_vacunacion', label: 'Registro de vacunación', desc: 'Plan de vacunas y fechas de aplicación', icon: '💉', type: 'csv' },
    { id: 'reporte_sanitario', label: 'Reporte sanitario del hato', desc: 'Estado de salud de todos los animales', icon: '🏥', type: 'txt' },
    { id: 'tratamientos_activos', label: 'Tratamientos activos', desc: 'Animales en tratamiento y medicamentos', icon: '💊', type: 'csv' },
  ],
  'contador': [
    { id: 'inventario_valorado', label: 'Inventario valorado', desc: 'Stock con cantidades y unidades', icon: '📊', type: 'csv' },
    { id: 'nomina_trabajadores', label: 'Nómina de trabajadores', desc: 'Plantilla de liquidación salarial', icon: '👷', type: 'csv' },
    { id: 'flujo_caja', label: 'Flujo de caja mensual', desc: 'Ingresos y egresos de la operación', icon: '💵', type: 'csv' },
    { id: 'reporte_tributario', label: 'Reporte tributario', desc: 'Resumen para declaración de impuestos', icon: '🧾', type: 'txt' },
  ],
  'supervisor': [
    { id: 'orden_trabajo', label: 'Orden de trabajo diaria', desc: 'Tareas asignadas y responsables', icon: '📝', type: 'txt' },
    { id: 'registro_labores', label: 'Registro de labores', desc: 'Control de actividades realizadas en campo', icon: '✅', type: 'csv' },
    { id: 'control_insumos', label: 'Control de insumos usados', desc: 'Agroquímicos y materiales aplicados', icon: '🧪', type: 'csv' },
  ],
  'ingeniero': [
    { id: 'plan_fertilizacion', label: 'Plan de fertilización', desc: 'Dosis, fechas y lotes por cultivo', icon: '🌱', type: 'csv' },
    { id: 'registro_aplicaciones', label: 'Registro de aplicaciones', desc: 'Historial de fumigaciones y riegos', icon: '💧', type: 'csv' },
    { id: 'cronograma_cosecha', label: 'Cronograma de cosecha', desc: 'Fechas estimadas por cultivo y lote', icon: '🌾', type: 'txt' },
  ],
}

function downloadFile(filename: string, content: string, type: string) {
  const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;'
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function toCSV(headers: string[], rows: any[][]) {
  const q = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  return [headers.map(q).join(','), ...rows.map(r => r.map(q).join(','))].join('\n')
}

export default function ReportsPage() {
  const { t } = useI18n()
  const role = getRole()
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string|null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [farms, animals, tasks, inventory] = await Promise.allSettled([
          supabase.from('farms').select('*').is('deleted_at',null), supabase.from('animals').select('*').is('deleted_at',null), supabase.from('tasks').select('*').is('deleted_at',null), supabase.from('inventory_items').select('*').is('deleted_at',null),
        ])
        setData({
          farms:     farms.status === 'fulfilled' ? farms.value.data : [],
          animals:   animals.status === 'fulfilled' ? animals.value.data : [],
          tasks:     tasks.status === 'fulfilled' ? tasks.value.data : [],
          inventory: inventory.status === 'fulfilled' ? inventory.value.data : [],
        })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  function handleDownload(templateId: string, type: string) {
    setDownloading(templateId)
    const farms = data.farms || []
    const animals = data.animals || []
    const tasks = data.tasks || []
    const inventory = data.inventory || []
    const date = new Date().toLocaleDateString('es-CO').replace(/\//g, '-')

    try {
      if (['inventario_completo','control_inventario','inventario_valorado'].includes(templateId)) {
        const csv = toCSV(
          ['Nombre','Tipo','Cantidad','Unidad','Stock Minimo','Estado','Granja'],
          inventory.map((i: any) => [
            i.name, i.type, i.quantity, i.unit, i.minStock,
            i.quantity <= i.minStock ? 'BAJO MINIMO' : 'Normal',
            farms.find((f: any) => f.id === i.farmId)?.name || '-'
          ])
        )
        downloadFile('inventario_' + date + '.csv', csv, 'csv')
      } else if (['registro_vacunacion','tratamientos_activos','ficha_animal'].includes(templateId)) {
        const csv = toCSV(
          ['Tipo','Raza','Edad meses','Estado Salud','Produccion L/dia','Granja'],
          animals.map((a: any) => [
            a.type, a.breed, a.age, a.healthStatus, a.milkProduction,
            farms.find((f: any) => f.id === a.farmId)?.name || '-'
          ])
        )
        downloadFile('animales_' + date + '.csv', csv, 'csv')
      } else if (['registro_labores','control_insumos','registro_aplicaciones','plan_fertilizacion','productividad_equipo','nomina_trabajadores'].includes(templateId)) {
        const csv = toCSV(
          ['Tipo Tarea','Estado','Fecha','Observaciones'],
          tasks.map((t: any) => [
            t.taskType, t.status,
            t.date ? new Date(t.date).toLocaleDateString('es-CO') : '',
            t.observations || ''
          ])
        )
        downloadFile('tareas_' + date + '.csv', csv, 'csv')
      } else {
        const completedTasks = tasks.filter((t: any) => t.status === 'completed' || t.status === 'completada').length
        const sickAnimals = animals.filter((a: any) => a.healthStatus === 'enfermo').length
        const lowStock = inventory.filter((i: any) => i.minStock > 0 && i.quantity <= i.minStock).length
        const totalHa = farms.reduce((s: number, f: any) => s + (f.totalArea || 0), 0)
        const lines = [
          'REPORTE PRAIRON - ' + date,
          '='.repeat(50),
          '',
          'RESUMEN EJECUTIVO',
          '-'.repeat(30),
          'Granjas: ' + farms.length + ' (' + totalHa + ' ha)',
          'Animales: ' + animals.length + ' (' + sickAnimals + ' enfermos)',
          'Tareas completadas: ' + completedTasks + '/' + tasks.length,
          'Stock bajo minimo: ' + lowStock + ' items',
          '',
          'GRANJAS',
          '-'.repeat(30),
          ...farms.map((f: any) => '- ' + f.name + ': ' + f.type + ' | ' + f.totalArea + ' ha | ' + (f.location || 'Sin ubicacion')),
          '',
          'INVENTARIO CRITICO',
          '-'.repeat(30),
          ...inventory
            .filter((i: any) => i.minStock > 0 && i.quantity <= i.minStock)
            .map((i: any) => '- ' + i.name + ': ' + i.quantity + ' ' + i.unit + ' (minimo: ' + i.minStock + ' ' + i.unit + ')'),
          '',
          'Generado por PRAIRON Agroindustrial OS',
        ]
        downloadFile('reporte_' + templateId + '_' + date + '.txt', lines.join('\n'), 'txt')
      }
    } finally {
      setDownloading(null)
    }
  }

  const myTemplates = TEMPLATES[role] || TEMPLATES['dueño']
  const farms = data.farms || []
  const animals = data.animals || []
  const tasks = data.tasks || []
  const inventory = data.inventory || []
  const completedTasks = tasks.filter((t: any) => t.status === 'completed' || t.status === 'completada').length
  const sickAnimals = animals.filter((a: any) => a.healthStatus === 'enfermo').length
  const lowStock = inventory.filter((i: any) => i.minStock > 0 && i.quantity <= i.minStock)


  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      // Hacemos la peticion con responseType blob para recibir el PDF binario
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/reports/pdf',
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('prairon_token'),
          },
        }
      )
      if (!response.ok) throw new Error('Error generando PDF')
      const blob = await response.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'reporte-prairon-' + new Date().toISOString().split('T')[0] + '.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error generando el PDF. Verifica que Chrome esté instalado en el servidor.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>{t('reports.title')}</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>{t('reports.subtitle')}</p>
        </div>
        <button onClick={handleDownloadPdf} disabled={downloadingPdf}
          style={{ fontSize: '12px', padding: '8px 16px', background: downloadingPdf ? '#e5e5e3' : '#036446', color: downloadingPdf ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: downloadingPdf ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
          {downloadingPdf ? t('reports.generating_pdf') : t('reports.download_pdf')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: t('reports.stat_farms'), value: farms.length, sub: farms.reduce((s: number, f: any) => s + (f.totalArea || 0), 0) + ' ha' },
          { label: t('reports.stat_animals'), value: animals.length, sub: sickAnimals + ' ' + t('reports.stat_sick') },
          { label: t('reports.stat_tasks'), value: completedTasks + '/' + tasks.length, sub: t('reports.stat_completed') },
          { label: t('reports.stat_stock'), value: lowStock.length, sub: t('reports.stat_critical') },
        ].map(m => (
          <div key={m.label} style={{ background: '#f9f9f7', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#036446' }}>{loading ? '—' : m.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginTop: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>
        {t('reports.templates_label')} — {role.toUpperCase()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        {myTemplates.map(tmpl => (
          <div key={tmpl.id} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>{tmpl.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', marginBottom: '3px' }}>{tmpl.label}</div>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '10px' }}>{tmpl.desc}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: tmpl.type === 'csv' ? '#e8f5ef' : '#e6f1fb', color: tmpl.type === 'csv' ? '#036446' : '#185fa5' }}>
                  {tmpl.type === 'csv' ? 'CSV / Excel' : 'Texto'}
                </span>
                <button
                  onClick={() => handleDownload(tmpl.id, tmpl.type)}
                  disabled={downloading === tmpl.id || loading}
                  style={{ fontSize: '11px', padding: '4px 12px', background: downloading === tmpl.id ? '#e5e5e3' : '#036446', color: downloading === tmpl.id ? '#9b9b97' : 'white', border: 'none', borderRadius: '5px', cursor: downloading === tmpl.id ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                  {downloading === tmpl.id ? t('reports.downloading') : t('reports.download')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>{t('reports.system_summary')}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #e5e5e3', background: '#f9f9f7' }}>
              {[t('reports.col_farm'),t('reports.col_type'),t('reports.col_area'),t('reports.col_location'),t('reports.col_animals')].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#9b9b97', fontSize: '11px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9b9b97' }}>{t('reports.loading')}</td></tr>
            ) : farms.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9b9b97' }}>{t('reports.no_farms')}</td></tr>
            ) : farms.map((f: any) => (
              <tr key={f.id} style={{ borderBottom: '0.5px solid #f0f0ee' }}>
                <td style={{ padding: '8px 12px', fontWeight: '500', color: '#1a1a18' }}>{f.name}</td>
                <td style={{ padding: '8px 12px', color: '#6b6b67' }}>{f.type}</td>
                <td style={{ padding: '8px 12px', color: '#6b6b67' }}>{f.totalArea}</td>
                <td style={{ padding: '8px 12px', color: '#6b6b67' }}>{f.location || '—'}</td>
                <td style={{ padding: '8px 12px', color: '#6b6b67' }}>{animals.filter((a: any) => a.farmId === f.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
