'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler)

export default function PerformancePage() {
  const [data, setData] = useState<any>({})
  const [aiData, setAiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'general'|'animales'|'tareas'|'ia'>('general')

  useEffect(() => {
    async function load() {
      try {
        const [farms, animals, tasks, inventory, ai] = await Promise.allSettled([
          supabase.from('farms').select('*').is('deleted_at',null), supabase.from('animals').select('*').is('deleted_at',null), supabase.from('tasks').select('*').is('deleted_at',null),
          supabase.from('inventory_items').select('*').is('deleted_at',null), supabase.from('inventory_items').select('count').is('deleted_at',null),
        ])
        setData({
          farms:     farms.status === 'fulfilled' ? farms.value.data : [],
          animals:   animals.status === 'fulfilled' ? animals.value.data : [],
          tasks:     tasks.status === 'fulfilled' ? tasks.value.data : [],
          inventory: inventory.status === 'fulfilled' ? inventory.value.data : [],
        })
        if (ai.status === 'fulfilled') setAiData(ai.value.data ?? [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: '28px 32px', color: '#9b9b97', fontSize: '13px' }}>Analizando rendimiento...</div>

  const farms = data.farms || []
  const animals = data.animals || []
  const tasks = data.tasks || []
  const inventory = data.inventory || []

  const completedTasks = tasks.filter((t:any) => t.status === 'completed' || t.status === 'completada').length
  const pendingTasks = tasks.filter((t:any) => t.status === 'pending' || t.status === 'pendiente').length
  const inProgressTasks = tasks.filter((t:any) => t.status === 'in-progress').length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const healthyAnimals = animals.filter((a:any) => a.healthStatus === 'saludable').length
  const sickAnimals = animals.filter((a:any) => a.healthStatus === 'enfermo').length
  const treatmentAnimals = animals.filter((a:any) => a.healthStatus === 'tratamiento').length
  const healthRate = animals.length > 0 ? Math.round((healthyAnimals / animals.length) * 100) : 0
  const lowStock = inventory.filter((i:any) => i.minStock > 0 && i.quantity <= i.minStock).length
  const totalMilk = animals.filter((a:any) => a.milkProduction > 0).reduce((s:number, a:any) => s + a.milkProduction, 0)
  const totalHa = farms.reduce((s:number, f:any) => s + (f.totalArea || 0), 0)

  const score = aiData?.score || Math.round((completionRate * 0.4) + (healthRate * 0.4) + (lowStock === 0 ? 20 : Math.max(0, 20 - lowStock * 4)))
  const scoreColor = score >= 70 ? '#036446' : score >= 40 ? '#b45309' : '#dc2626'

  const kpis = [
    { label: 'Score general', value: score + '/100', color: scoreColor, sub: score >= 70 ? 'Operación saludable' : score >= 40 ? 'Requiere atención' : 'Situación crítica' },
    { label: 'Eficiencia tareas', value: completionRate + '%', color: '#036446', sub: completedTasks + ' de ' + tasks.length },
    { label: 'Salud animal', value: healthRate + '%', color: healthRate >= 80 ? '#036446' : '#b45309', sub: sickAnimals + ' enfermos' },
    { label: 'Total producción', value: totalMilk.toFixed(1) + ' L', color: '#036446', sub: 'leche/día' },
    { label: 'Área productiva', value: totalHa + ' ha', color: '#036446', sub: farms.length + ' granjas' },
    { label: 'Stock crítico', value: lowStock, color: lowStock > 0 ? '#b45309' : '#036446', sub: lowStock > 0 ? 'ítems bajo mínimo' : 'Todo en orden' },
  ]

  const taskTypes = tasks.reduce((acc:any, t:any) => { acc[t.taskType] = (acc[t.taskType] || 0) + 1; return acc }, {})
  const farmNames = farms.map((f:any) => f.name.split(' ').slice(-1)[0])
  const farmAnimals = farms.map((f:any) => animals.filter((a:any) => a.farmId === f.id).length)
  const farmAreas = farms.map((f:any) => f.totalArea || 0)

  const tasksByStatus = [completedTasks, inProgressTasks, pendingTasks]
  const animalsByHealth = [healthyAnimals, treatmentAnimals, sickAnimals]

  const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' as const, labels: { font: { size: 11 }, boxWidth: 10, padding: 8 } } } }
  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#f0f0ee' }, ticks: { font: { size: 11 } } } } }

  const TABS = [
    { key: 'general', label: 'General' },
    { key: 'animales', label: 'Animales' },
    { key: 'tareas', label: 'Operaciones' },
    { key: 'ia', label: 'IA Insights' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Rendimiento</h1>
        <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>Análisis integral de tu operación agroindustrial</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '24px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '22px', fontWeight: '500', color: k.color, marginBottom: '4px' }}>{k.value}</div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#1a1a18', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '10px', color: '#9b9b97' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', border: '0.5px solid #e5e5e3', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: '8px 20px', fontSize: '13px', border: 'none', cursor: 'pointer', borderRight: '0.5px solid #e5e5e3', background: tab === t.key ? '#036446' : '#fff', color: tab === t.key ? 'white' : '#6b6b67', fontWeight: tab === t.key ? '500' : '400' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>ÁREA POR GRANJA (ha)</div>
            <div style={{ height: '220px' }}>
              {farmNames.length > 0 ? (
                <Bar data={{ labels: farmNames, datasets: [{ data: farmAreas, backgroundColor: ['#036446', '#0dac5e', '#5bc898'], borderRadius: 4 }] }} options={barOpts as any} />
              ) : <div style={{ color: '#9b9b97', fontSize: '12px', textAlign: 'center', paddingTop: '90px' }}>Sin granjas</div>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>SCORE DE OPERACIÓN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e5e3" strokeWidth="8"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="8"
                      strokeDasharray={`${score * 2.01} 201`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '500', color: scoreColor }}>{score}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>{score >= 70 ? 'Excelente' : score >= 40 ? 'Regular' : 'Crítico'}</div>
                  <div style={{ fontSize: '11px', color: '#9b9b97', lineHeight: 1.5 }}>
                    Basado en eficiencia de tareas, salud animal y control de inventario
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>ESTADO DE TAREAS</div>
              <div style={{ height: '120px' }}>
                <Doughnut data={{ labels: ['Completadas', 'En progreso', 'Pendientes'], datasets: [{ data: tasksByStatus, backgroundColor: ['#036446', '#378add', '#e5e5e3'], borderWidth: 0 }] }} options={doughnutOpts} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'animales' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>SALUD DEL HATO</div>
            <div style={{ height: '200px' }}>
              <Doughnut data={{ labels: ['Saludable', 'Tratamiento', 'Enfermo'], datasets: [{ data: animalsByHealth, backgroundColor: ['#036446', '#f59e0b', '#ef4444'], borderWidth: 0 }] }} options={doughnutOpts} />
            </div>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>ANIMALES POR GRANJA</div>
            <div style={{ height: '200px' }}>
              {farmNames.length > 0 ? (
                <Bar data={{ labels: farmNames, datasets: [{ data: farmAnimals, backgroundColor: '#036446', borderRadius: 4 }] }} options={barOpts as any} />
              ) : <div style={{ color: '#9b9b97', fontSize: '12px', textAlign: 'center', paddingTop: '80px' }}>Sin datos</div>}
            </div>
          </div>
          <div style={{ gridColumn: 'span 2', background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>PRODUCCIÓN LÁCTEA POR ANIMAL</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
              {animals.filter((a:any) => a.milkProduction > 0).map((a:any) => (
                <div key={a.id} style={{ padding: '12px', background: '#f9f9f7', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '500', color: '#036446' }}>{a.milkProduction} L</div>
                  <div style={{ fontSize: '11px', color: '#1a1a18', fontWeight: '500', marginTop: '4px' }}>{a.breed}</div>
                  <div style={{ fontSize: '10px', color: '#9b9b97' }}>{a.type}</div>
                </div>
              ))}
              {animals.filter((a:any) => a.milkProduction > 0).length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', color: '#9b9b97', fontSize: '12px', padding: '20px 0' }}>Sin producción láctea registrada</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'tareas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '14px' }}>TAREAS POR TIPO</div>
            <div style={{ height: '220px' }}>
              {Object.keys(taskTypes).length > 0 ? (
                <Doughnut data={{ labels: Object.keys(taskTypes), datasets: [{ data: Object.values(taskTypes), backgroundColor: ['#036446','#0dac5e','#378add','#f59e0b','#ef4444','#7c3aed','#ec4899','#06b6d4'], borderWidth: 0 }] }} options={doughnutOpts} />
              ) : <div style={{ color: '#9b9b97', fontSize: '12px', textAlign: 'center', paddingTop: '90px' }}>Sin tareas</div>}
            </div>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>RESUMEN OPERATIVO</div>
            {[
              { label: 'Total tareas', value: tasks.length, bar: 100 },
              { label: 'Completadas', value: completedTasks, bar: tasks.length > 0 ? Math.round(completedTasks/tasks.length*100) : 0, color: '#036446' },
              { label: 'En progreso', value: inProgressTasks, bar: tasks.length > 0 ? Math.round(inProgressTasks/tasks.length*100) : 0, color: '#378add' },
              { label: 'Pendientes', value: pendingTasks, bar: tasks.length > 0 ? Math.round(pendingTasks/tasks.length*100) : 0, color: '#f59e0b' },
              { label: 'Vencidas', value: tasks.filter((t:any) => t.date && new Date(t.date) < new Date() && t.status !== 'completada' && t.status !== 'completed').length, bar: 0, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#6b6b67' }}>{item.label}</span>
                  <span style={{ fontWeight: '500', color: item.color || '#1a1a18' }}>{item.value}</span>
                </div>
                <div style={{ height: '4px', background: '#e5e5e3', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: item.bar + '%', background: item.color || '#e5e5e3', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '16px' }}>ANÁLISIS IA — ESTADO DE TU OPERACIÓN</div>
            {aiData?.insights && aiData.insights.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiData.insights.map((insight: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#f9f9f7', borderRadius: '8px', borderLeft: '3px solid #036446' }}>
                    <div style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.6 }}>{insight}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  completionRate >= 70 ? 'Tu tasa de completado de tareas es ' + completionRate + '%. Excelente gestión operativa.' : 'Tu tasa de completado es ' + completionRate + '%. Considera revisar las tareas pendientes esta semana.',
                  healthRate >= 80 ? 'El ' + healthRate + '% de tus animales están saludables. El hato está en buen estado.' : 'Solo el ' + healthRate + '% de tus animales están saludables. Se recomienda revisión veterinaria.',
                  lowStock === 0 ? 'Tu inventario está en niveles correctos. No hay ítems bajo el mínimo.' : lowStock + ' ítem(s) de inventario están bajo el mínimo. Solicita reposición esta semana.',
                  'Tienes ' + farms.length + ' granjas con ' + totalHa + ' ha productivas y ' + animals.length + ' animales registrados.',
                ].map((insight, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#f9f9f7', borderRadius: '8px', borderLeft: '3px solid #036446' }}>
                    <div style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.6 }}>{insight}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { label: 'Recomendación', icon: '💡', text: completionRate < 70 ? 'Prioriza las ' + pendingTasks + ' tareas pendientes esta semana' : 'Mantén el ritmo actual de operaciones' },
              { label: 'Alerta', icon: '⚠️', text: sickAnimals > 0 ? sickAnimals + ' animal(es) requieren atención veterinaria urgente' : 'Sin alertas críticas en este momento' },
              { label: 'Oportunidad', icon: '📈', text: totalMilk > 0 ? 'Producción láctea de ' + totalMilk.toFixed(1) + ' L/día. Evalúa optimización de dieta' : 'Registra producción láctea para análisis de rentabilidad' },
            ].map(card => (
              <div key={card.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{card.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', marginBottom: '6px', letterSpacing: '0.06em' }}>{card.label.toUpperCase()}</div>
                <div style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.5 }}>{card.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
