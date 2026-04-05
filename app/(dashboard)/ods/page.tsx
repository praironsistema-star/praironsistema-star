import { supabase } from '@/lib/supabase'
'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

const ODS_COLORS: Record<number, string> = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',
  6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',
  11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',
  16:'#00689D',17:'#19486A',
}

const ODS_LABELS: Record<number, string> = {
  1:'Fin de la pobreza',2:'Hambre cero',3:'Salud y bienestar',
  4:'Educación de calidad',5:'Igualdad de género',6:'Agua limpia',
  7:'Energía asequible',8:'Trabajo decente',9:'Industria e innovación',
  10:'Reducción desigualdades',11:'Ciudades sostenibles',12:'Producción responsable',
  13:'Acción por el clima',14:'Vida submarina',15:'Vida de ecosistemas',
  16:'Paz y justicia',17:'Alianzas para objetivos',
}

const AGRO_ODS = [2,3,6,7,8,12,13,15]

export default function OdsPage() {
  const [objectives, setObjectives] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number|null>(null)
  const [seeding, setSeeding] = useState(false)
  const [view, setView] = useState<'grid'|'list'>('grid')

  async function load() {
    try {
      const [obj, t, dash] = await Promise.allSettled([
        supabase.from('ods_objectives').select('*'),
        supabase.from('tasks').select('*').eq('type','ods').is('deleted_at',null),
        supabase.from('ods_objectives').select('count'),
      ])
      if (obj.status === 'fulfilled') setObjectives(obj.value.data)
      if (t.status === 'fulfilled') setTasks(t.value.data)
      if (dash.status === 'fulfilled') setDashboard(dash.value.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true)
    try { await load() } // seed reemplazado por datos en Supabase
    finally { setSeeding(false) }
  }

  const selectedObj = objectives.find(o => o.number === selected)
  const selectedTasks = tasks.filter(t => t.odsObjectiveId === selectedObj?.id)

  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'completada').length
  const totalProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>ODS — Objetivos de Desarrollo Sostenible</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            Seguimiento de impacto sostenible de tu operación agroindustrial
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', border: '0.5px solid #e5e5e3', borderRadius: '6px', overflow: 'hidden' }}>
            <button onClick={() => setView('grid')} style={{ padding: '7px 14px', fontSize: '12px', border: 'none', cursor: 'pointer', background: view === 'grid' ? '#036446' : '#fff', color: view === 'grid' ? 'white' : '#6b6b67' }}>Cuadrícula</button>
            <button onClick={() => setView('list')} style={{ padding: '7px 14px', fontSize: '12px', border: 'none', cursor: 'pointer', background: view === 'list' ? '#036446' : '#fff', color: view === 'list' ? 'white' : '#6b6b67' }}>Lista</button>
          </div>
          {objectives.length === 0 && (
            <button onClick={handleSeed} disabled={seeding}
              style={{ fontSize: '12px', padding: '8px 16px', background: seeding ? '#e5e5e3' : '#036446', color: seeding ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: seeding ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
              {seeding ? 'Cargando ODS...' : 'Inicializar ODS'}
            </button>
          )}
        </div>
      </div>

      {dashboard && tasks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'ODS activos', value: objectives.length },
            { label: 'Tareas ODS', value: tasks.length },
            { label: 'Completadas', value: dashboard.completadas || completedTasks },
            { label: 'En progreso', value: dashboard.enProgreso || tasks.filter((t:any) => t.status === 'in-progress').length },
            { label: 'Progreso total', value: totalProgress + '%' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '22px', fontWeight: '500', color: '#036446' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '4px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#9b9b97', fontSize: '13px', padding: '40px', textAlign: 'center' }}>Cargando ODS...</div>
      ) : objectives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '0.5px dashed #e5e5e3', borderRadius: '12px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌱</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>ODS no inicializados</div>
          <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Carga los 17 Objetivos de Desarrollo Sostenible de la ONU con indicadores específicos para tu operación agroindustrial
          </div>
          <button onClick={handleSeed} disabled={seeding}
            style={{ fontSize: '13px', padding: '10px 24px', background: '#036446', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            {seeding ? 'Inicializando...' : 'Cargar 17 ODS con indicadores agrícolas'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px' }}>
          <div>
            {view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {Array.from({ length: 17 }, (_, i) => i + 1).map(num => {
                  const obj = objectives.find(o => o.number === num)
                  const color = ODS_COLORS[num]
                  const isAgro = AGRO_ODS.includes(num)
                  const objTasks = tasks.filter(t => t.odsObjectiveId === obj?.id)
                  const objCompleted = objTasks.filter(t => t.status === 'completed' || t.status === 'completada').length
                  const progress = objTasks.length > 0 ? Math.round((objCompleted / objTasks.length) * 100) : 0
                  return (
                    <div key={num} onClick={() => setSelected(selected === num ? null : num)}
                      style={{
                        background: selected === num ? color : '#fff',
                        border: `0.5px solid ${selected === num ? color : isAgro ? color + '44' : '#e5e5e3'}`,
                        borderRadius: '10px', padding: '14px', cursor: 'pointer',
                        transition: 'all 0.15s', opacity: obj ? 1 : 0.5,
                      }}
                      onMouseEnter={e => { if (selected !== num) (e.currentTarget as HTMLElement).style.borderColor = color }}
                      onMouseLeave={e => { if (selected !== num) (e.currentTarget as HTMLElement).style.borderColor = isAgro ? color + '44' : '#e5e5e3' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>{num}</div>
                        {isAgro && <div style={{ fontSize: '9px', fontWeight: '500', padding: '2px 6px', borderRadius: '10px', background: color + '22', color: color }}>Relevante</div>}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: selected === num ? 'white' : '#1a1a18', lineHeight: 1.3, marginBottom: '8px' }}>
                        {ODS_LABELS[num]}
                      </div>
                      {objTasks.length > 0 && (
                        <>
                          <div style={{ height: '3px', background: selected === num ? 'rgba(255,255,255,0.3)' : '#e5e5e3', borderRadius: '2px', marginBottom: '3px' }}>
                            <div style={{ height: '100%', width: progress + '%', background: selected === num ? 'white' : color, borderRadius: '2px' }} />
                          </div>
                          <div style={{ fontSize: '10px', color: selected === num ? 'rgba(255,255,255,0.8)' : '#9b9b97' }}>{progress}% · {objTasks.length} tareas</div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid #e5e5e3', background: '#f9f9f7' }}>
                      {['ODS','Objetivo','Tareas','Progreso','Estado'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '500', color: '#9b9b97', fontSize: '11px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {objectives.map((obj:any) => {
                      const color = ODS_COLORS[obj.number]
                      const objTasks = tasks.filter(t => t.odsObjectiveId === obj.id)
                      const completed = objTasks.filter(t => t.status === 'completed' || t.status === 'completada').length
                      const progress = objTasks.length > 0 ? Math.round((completed / objTasks.length) * 100) : 0
                      return (
                        <tr key={obj.id} onClick={() => setSelected(selected === obj.number ? null : obj.number)}
                          style={{ borderBottom: '0.5px solid #f0f0ee', cursor: 'pointer', background: selected === obj.number ? color + '11' : 'transparent' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: 'white' }}>{obj.number}</div>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: '500', color: '#1a1a18' }}>{obj.title || ODS_LABELS[obj.number]}</td>
                          <td style={{ padding: '10px 14px', color: '#6b6b67' }}>{objTasks.length}</td>
                          <td style={{ padding: '10px 14px', minWidth: '100px' }}>
                            <div style={{ height: '4px', background: '#e5e5e3', borderRadius: '2px', marginBottom: '3px' }}>
                              <div style={{ height: '100%', width: progress + '%', background: color, borderRadius: '2px' }} />
                            </div>
                            <div style={{ fontSize: '10px', color: '#9b9b97' }}>{progress}%</div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: color + '22', color: color }}>
                              {progress === 100 ? 'Completo' : progress > 0 ? 'En progreso' : 'Sin iniciar'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && selectedObj && (
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden', height: 'fit-content', position: 'sticky', top: '20px' }}>
              <div style={{ background: ODS_COLORS[selected], padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white' }}>{selected}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>ODS {selected}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{ODS_LABELS[selected]}</div>
                  </div>
                </div>
                {selectedTasks.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                      <span>Progreso</span>
                      <span>{Math.round(selectedTasks.filter(t => t.status === 'completed' || t.status === 'completada').length / selectedTasks.length * 100)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: Math.round(selectedTasks.filter(t => t.status === 'completed' || t.status === 'completada').length / selectedTasks.length * 100) + '%', background: 'white', borderRadius: '2px' }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '10px' }}>TAREAS DE SOSTENIBILIDAD ({selectedTasks.length})</div>
                {selectedTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#9b9b97', fontSize: '12px' }}>Sin tareas para este ODS</div>
                ) : selectedTasks.map((task:any) => {
                  const isComplete = task.status === 'completed' || task.status === 'completada'
                  return (
                    <div key={task.id} style={{ padding: '8px 0', borderBottom: '0.5px solid #f0f0ee', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${isComplete ? ODS_COLORS[selected] : '#e5e5e3'}`, background: isComplete ? ODS_COLORS[selected] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {isComplete && <span style={{ color: 'white', fontSize: '9px' }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', textDecoration: isComplete ? 'line-through' : 'none', opacity: isComplete ? 0.6 : 1 }}>{task.title || task.description}</div>
                        {task.indicator && <div style={{ fontSize: '10px', color: '#9b9b97', marginTop: '2px' }}>{task.indicator}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
