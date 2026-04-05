'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// /calendario — Calendario agrícola mensual
//
// Muestra las tareas del sistema organizadas por fecha en una vista de mes
// No necesita nuevo backend — usa GET /tasks que ya existe
// ─────────────────────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  pending:    { bg: '#fef3e2', color: '#b45309', dot: '#f59e0b' },
  pendiente:  { bg: '#fef3e2', color: '#b45309', dot: '#f59e0b' },
  'in-progress': { bg: '#e6f1fb', color: '#185fa5', dot: '#3b82f6' },
  completada: { bg: '#e8f5ef', color: '#036446', dot: '#10b981' },
  completed:  { bg: '#e8f5ef', color: '#036446', dot: '#10b981' },
}

const TASK_TYPE_ICONS: Record<string, string> = {
  fumigacion: '🧪', riego: '💧', fertilizacion: '🌿', vacunacion: '💉',
  cosecha: '🌾', siembra: '🌱', mantenimiento: '🔧', poda: '✂️',
  monitoreo: '🔍', otro: '📋',
}

export default function CalendarioPage() {
  const today    = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [tasks,    setTasks]   = useState<any[]>([])
  const [loading,  setLoading] = useState(true)
  const [selected, setSelected] = useState<Date | null>(null)

  useEffect(() => {
    api.get('/tasks')
  }, [])

  // Navega al mes anterior
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  // Navega al mes siguiente
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  // Obtiene el primer día de la semana del mes (0=Dom)
  const firstDay = new Date(year, month, 1).getDay()
  // Total de días en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Agrupa tareas por día del mes actual
  function getTasksForDay(day: number): any[] {
    return tasks.filter(t => {
      if (!t.date) return false
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  // Tareas del día seleccionado
  const selectedTasks = selected
    ? tasks.filter(t => {
        if (!t.date) return false
        const d = new Date(t.date)
        return d.getFullYear() === selected.getFullYear() &&
               d.getMonth() === selected.getMonth() &&
               d.getDate() === selected.getDate()
      })
    : []

  // Conteo de tareas del mes para el resumen
  const monthTasks = tasks.filter(t => {
    if (!t.date) return false
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
  const pending   = monthTasks.filter(t => t.status === 'pending' || t.status === 'pendiente').length
  const inProgress = monthTasks.filter(t => t.status === 'in-progress').length
  const done      = monthTasks.filter(t => t.status === 'completada' || t.status === 'completed').length

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const isSelected = (day: number) =>
    selected?.getFullYear() === year && selected?.getMonth() === month && selected?.getDate() === day

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Calendario agrícola</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {monthTasks.length} tareas en {MESES[month]} {year}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Stats rápidos del mes */}
          {[
            { label: 'Pendientes', count: pending, color: '#b45309', bg: '#fef3e2' },
            { label: 'En progreso', count: inProgress, color: '#185fa5', bg: '#e6f1fb' },
            { label: 'Completadas', count: done, color: '#036446', bg: '#e8f5ef' },
          ].map(s => (
            <div key={s.label} style={{ padding: '6px 12px', background: s.bg, borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: s.color, fontFamily: 'monospace', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '10px', color: s.color, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
          <a href="/tasks" style={{ fontSize: '12px', padding: '8px 14px', border: '0.5px solid #036446', borderRadius: '6px', color: '#036446', textDecoration: 'none', fontWeight: '500' }}>
            + Nueva tarea
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

        {/* ── Calendario ── */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Navegación del mes */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={prevMonth}
              style={{ width: '32px', height: '32px', border: '0.5px solid #e5e5e3', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ‹
            </button>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18' }}>
              {MESES[month]} {year}
            </div>
            <button onClick={nextMonth}
              style={{ width: '32px', height: '32px', border: '0.5px solid #e5e5e3', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ›
            </button>
          </div>

          {/* Nombres de días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '0.5px solid #e5e5e3' }}>
            {DIAS.map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#9b9b97', letterSpacing: '0.06em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas del mes */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9b9b97', fontSize: '13px' }}>Cargando tareas...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Celdas vacías antes del primer día */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={'empty-' + i} style={{ minHeight: '80px', borderRight: '0.5px solid #f0f0ee', borderBottom: '0.5px solid #f0f0ee', background: '#fafafa' }} />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayTasks = getTasksForDay(day)
                const todayFlag = isToday(day)
                const selFlag   = isSelected(day)

                return (
                  <div key={day}
                    onClick={() => setSelected(new Date(year, month, day))}
                    style={{
                      minHeight: '80px',
                      borderRight: '0.5px solid #f0f0ee',
                      borderBottom: '0.5px solid #f0f0ee',
                      padding: '6px',
                      cursor: 'pointer',
                      background: selFlag ? '#e8f5ef' : '#fff',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!selFlag) (e.currentTarget as HTMLElement).style.background = '#f9f9f7' }}
                    onMouseLeave={e => { if (!selFlag) (e.currentTarget as HTMLElement).style.background = '#fff' }}>

                    {/* Número del día */}
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: todayFlag ? '#036446' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: todayFlag ? '600' : '400',
                      color: todayFlag ? 'white' : selFlag ? '#036446' : '#1a1a18',
                      marginBottom: '4px',
                    }}>
                      {day}
                    </div>

                    {/* Tareas del día — máximo 3 visibles */}
                    {dayTasks.slice(0, 3).map(t => {
                      const s = STATUS_COLORS[t.status] || STATUS_COLORS.pending
                      const icon = TASK_TYPE_ICONS[t.taskType] || '📋'
                      return (
                        <div key={t.id} style={{
                          fontSize: '10px', padding: '2px 5px', borderRadius: '4px',
                          background: s.bg, color: s.color,
                          marginBottom: '2px', lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {icon} {t.taskType}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div style={{ fontSize: '10px', color: '#9b9b97', paddingLeft: '2px' }}>
                        +{dayTasks.length - 3} más
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Panel lateral: tareas del día seleccionado ── */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e5e3', background: '#f9f9f7' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>
              {selected
                ? `${selected.getDate()} de ${MESES[selected.getMonth()]}`
                : 'Selecciona un día'}
            </div>
            {selected && (
              <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>
                {selectedTasks.length} tarea{selectedTasks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div style={{ padding: '12px' }}>
            {!selected ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9b9b97', fontSize: '12px', lineHeight: 1.6 }}>
                Haz clic en un día del calendario para ver sus tareas
              </div>
            ) : selectedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '12px', color: '#9b9b97', marginBottom: '12px' }}>Sin tareas este día</div>
                <a href="/tasks" style={{ fontSize: '11px', padding: '6px 14px', background: '#036446', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
                  + Crear tarea
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTasks.map(t => {
                  const s = STATUS_COLORS[t.status] || STATUS_COLORS.pending
                  const icon = TASK_TYPE_ICONS[t.taskType] || '📋'
                  const overdue = t.date && new Date(t.date) < new Date() && t.status !== 'completada' && t.status !== 'completed'
                  return (
                    <div key={t.id} style={{ border: `0.5px solid ${overdue ? '#fecaca' : '#e5e5e3'}`, borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '14px' }}>{icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', textTransform: 'capitalize' }}>{t.taskType}</span>
                      </div>
                      {t.observations && (
                        <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '6px', lineHeight: 1.4 }}>
                          {t.observations.length > 50 ? t.observations.slice(0, 50) + '…' : t.observations}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: '500' }}>
                          {t.status === 'pending' || t.status === 'pendiente' ? 'Pendiente' : t.status === 'in-progress' ? 'En progreso' : 'Completada'}
                        </span>
                        {overdue && (
                          <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '500' }}>Vencida</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
