'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import TasksSkeleton from '@/components/ui/TasksSkeleton'

const STATUS_COLS = [
  { key: 'pending',     labelKey: 'tasks.pending',    color: '#b45309', bg: '#fef3e2', border: '#fed7aa' },
  { key: 'in-progress', labelKey: 'tasks.in_progress', color: '#185fa5', bg: '#e6f1fb', border: '#bfdbfe' },
  { key: 'completada',  labelKey: 'tasks.completed',   color: '#036446', bg: '#e8f5ef', border: '#a7f3d0' },
]

const TASK_TYPES = ['fumigacion','riego','fertilizacion','vacunacion','cosecha','siembra','mantenimiento','poda','monitoreo','otro']

function TaskCard({ task, onEdit, onDelete, onStatusChange, t }: any) {
  const isOverdue = task.date && new Date(task.date) < new Date() && task.status !== 'completada' && task.status !== 'completed'
  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
      style={{
        background: '#fff', border: `0.5px solid ${isOverdue ? '#fecaca' : '#e5e5e3'}`,
        borderRadius: '8px', padding: '12px', cursor: 'grab', marginBottom: '8px',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', textTransform: 'capitalize' }}>{task.taskType}</div>
        <div style={{ display: 'flex', gap: '3px' }}>
          <button onClick={() => onEdit(task)} style={{ fontSize: '10px', padding: '2px 6px', border: '0.5px solid #e5e5e3', borderRadius: '4px', background: 'transparent', cursor: 'pointer', color: '#9b9b97' }}>✎</button>
          <button onClick={() => onDelete(task.id)} style={{ fontSize: '10px', padding: '2px 6px', border: '0.5px solid #fecaca', borderRadius: '4px', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>×</button>
        </div>
      </div>
      {task.observations && (
        <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '8px', lineHeight: 1.4 }}>
          {task.observations.length > 60 ? task.observations.slice(0, 60) + '…' : task.observations}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '10px', color: isOverdue ? '#dc2626' : '#9b9b97', fontWeight: isOverdue ? '500' : '400' }}>
          {task.date ? new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '—'}
          {isOverdue && ` · ${t('tasks.overdue')}`}
        </div>
        {task.status === 'pending' || task.status === 'pendiente' ? (
          <button onClick={() => onStatusChange(task.id, 'in-progress')}
            style={{ fontSize: '10px', padding: '3px 8px', border: '0.5px solid #185fa5', borderRadius: '20px', background: 'transparent', cursor: 'pointer', color: '#185fa5' }}>
            Iniciar →
          </button>
        ) : task.status === 'in-progress' ? (
          <button onClick={() => onStatusChange(task.id, 'completada')}
            style={{ fontSize: '10px', padding: '3px 8px', border: '0.5px solid #036446', borderRadius: '20px', background: 'transparent', cursor: 'pointer', color: '#036446' }}>
            ✓ Completar
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { t } = useI18n()
  const [tasks, setTasks] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban'|'list'>('kanban')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [draggingOver, setDraggingOver] = useState<string|null>(null)
  const [form, setForm] = useState({ taskType: 'riego', status: 'pending', observations: '', date: '', lotId: '' })

  const load = async () => {
    try {
            const [tasksRes, farmsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/farms'),
      ])
      setTasks(tasksRes.data || [])
      setLots((farmsRes.data || []).map((f:any) => ({ id: f.id, farmName: f.name })))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ taskType: 'riego', status: 'pending', observations: '', date: new Date().toISOString().split('T')[0], lotId: lots[0]?.id || '' })
    setSelected(null); setModal('create')
  }

  function openEdit(t: any) {
    setForm({ taskType: t.taskType, status: t.status, observations: t.observations || '', date: t.date ? t.date.split('T')[0] : '', lotId: t.lotId || '' })
    setSelected(t); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
        if (modal === 'create') await api.post('/tasks', { title: form.taskType, category: 'laboral', status: 'pendiente', due_date: form.date, farm_id: form.lotId })
    else await api.patch('/tasks/selected.id', { title: form.taskType, status: form.status, due_date: form.date })
    setModal(null); load(); toastSuccess('Guardado correctamente')
  }

  async function handleDelete(id: string) {
    if (!await confirm({ title: 'Eliminar', message: '¿Estás seguro?', danger: true, confirmText: 'Eliminar' })){ return }
    // was: esta tarea?')) return
        await api.patch('/tasks/id', { deleted_at: new Date().toISOString() }); load(); toastSuccess('Tarea eliminada')
  }

  async function handleStatusChange(id: string, status: string) {
        await api.patch('/tasks/id', { status }); load()
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) await handleStatusChange(taskId, newStatus)
    setDraggingOver(null)
  }

  const normalize = (s: string) => {
    if (s === 'completed') return 'completada'
    if (s === 'pendiente') return 'pending'
    return s
  }

  const getColTasks = (colKey: string) =>
    tasks.filter(t => normalize(t.status) === colKey)

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.taskType === filter)

  const counts = {
    pending: tasks.filter(t => normalize(t.status) === 'pending').length,
    'in-progress': tasks.filter(t => normalize(t.status) === 'in-progress').length,
    completada: tasks.filter(t => normalize(t.status) === 'completada').length,
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>{t('tasks.title')}</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {tasks.length} tareas · {counts.pending} pendientes · {counts['in-progress']} en progreso
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', border: '0.5px solid #e5e5e3', borderRadius: '6px', overflow: 'hidden' }}>
            <button onClick={() => setView('kanban')} style={{ padding: '7px 14px', fontSize: '12px', border: 'none', cursor: 'pointer', background: view === 'kanban' ? '#036446' : '#fff', color: view === 'kanban' ? 'white' : '#6b6b67', fontWeight: view === 'kanban' ? '500' : '400' }}>
              Kanban
            </button>
            <button onClick={() => setView('list')} style={{ padding: '7px 14px', fontSize: '12px', border: 'none', cursor: 'pointer', background: view === 'list' ? '#036446' : '#fff', color: view === 'list' ? 'white' : '#6b6b67', fontWeight: view === 'list' ? '500' : '400' }}>
              Lista
            </button>
          </div>
          <button onClick={openCreate} style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            + Nueva tarea
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', border: '0.5px solid', cursor: 'pointer', borderColor: filter === 'all' ? '#036446' : '#e5e5e3', background: filter === 'all' ? '#e8f5ef' : 'transparent', color: filter === 'all' ? '#036446' : '#6b6b67' }}>
          {t('tasks.all')} ({tasks.length})
        </button>
        {TASK_TYPES.filter(type => tasks.some(t => t.taskType === type)).map(type => (
          <button key={type} onClick={() => setFilter(type)} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', border: '0.5px solid', cursor: 'pointer', borderColor: filter === type ? '#036446' : '#e5e5e3', background: filter === type ? '#e8f5ef' : 'transparent', color: filter === type ? '#036446' : '#6b6b67', textTransform: 'capitalize' }}>
            {type} ({tasks.filter(t => t.taskType === type).length})
          </button>
        ))}
      </div>

      {loading ? (
        <TasksSkeleton />
      ) : view === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
          {STATUS_COLS.map(col => {
            const colTasks = getColTasks(col.key).filter(t => filter === 'all' || t.taskType === filter)
            return (
              <div key={col.key}
                onDragOver={e => { e.preventDefault(); setDraggingOver(col.key) }}
                onDragLeave={() => setDraggingOver(null)}
                onDrop={e => handleDrop(e, col.key)}
                style={{
                  background: draggingOver === col.key ? col.bg : '#f9f9f7',
                  border: `0.5px solid ${draggingOver === col.key ? col.border : '#e5e5e3'}`,
                  borderRadius: '12px', padding: '14px', minHeight: '200px',
                  transition: 'all 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '12px', fontWeight: '500', color: col.color }}>{t(col.labelKey)}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: col.bg, color: col.color, border: `0.5px solid ${col.border}` }}>
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '12px', color: '#9b9b97', border: '0.5px dashed #e5e5e3', borderRadius: '8px' }}>
                    Sin tareas
                  </div>
                ) : colTasks.map((t: any) => (
                  <TaskCard key={t.id} task={t} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} t={t} />
                ))}
                {col.key === 'pending' && (
                  <button onClick={openCreate} style={{ width: '100%', padding: '8px', border: '0.5px dashed #e5e5e3', borderRadius: '8px', background: 'transparent', fontSize: '12px', color: '#9b9b97', cursor: 'pointer', marginTop: '4px' }}>
                    + Agregar tarea
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '0.5px dashed #e5e5e3', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>{t('tasks.no_tasks_empty')}</div>
              <button onClick={openCreate} style={{ fontSize: '12px', padding: '8px 20px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t('tasks.create_first')}</button>
            </div>
          ) : filteredTasks.map((t: any) => {
            const col = STATUS_COLS.find(c => c.key === normalize(t.status)) || STATUS_COLS[0]
            const isOverdue = t.date && new Date(t.date) < new Date() && normalize(t.status) !== 'completada'
            return (
              <div key={t.id} style={{ background: '#fff', border: `0.5px solid ${isOverdue ? '#fecaca' : '#e5e5e3'}`, borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', textTransform: 'capitalize' }}>{t.taskType}</span>
                    <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: col.bg, color: col.color }}>{t(col.labelKey)}</span>
                    {isOverdue && <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626' }}>{t('tasks.overdue')}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9b9b97' }}>{t.observations || '—'} · {t.date ? new Date(t.date).toLocaleDateString('es-CO') : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {normalize(t.status) !== 'completada' && (
                    <button onClick={() => handleStatusChange(t.id, normalize(t.status) === 'pending' ? 'in-progress' : 'completada')}
                      style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid #e5e5e3', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#036446' }}>
                      {normalize(t.status) === 'pending' ? `▶ ${t('tasks.start')}` : `✓ ${t('tasks.complete')}`}
                    </button>
                  )}
                  <button onClick={() => openEdit(t)} style={{ fontSize: '11px', padding: '5px 8px', border: '0.5px solid #e5e5e3', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#6b6b67' }}>{t('common.edit')}</button>
                  <button onClick={() => handleDelete(t.id)} style={{ fontSize: '11px', padding: '5px 8px', border: '0.5px solid #fecaca', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>{modal === 'create' ? t('tasks.modal_create') : t('tasks.modal_edit')}</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('tasks.task_type')}</label>
                  <select value={form.taskType} onChange={e => setForm({ ...form, taskType: e.target.value })}
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff' }}>
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('tasks.status')}</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff' }}>
                    <option value="pending">{t('tasks.pending')}</option>
                    <option value="in-progress">{t('tasks.in_progress')}</option>
                    <option value="completada">{t('tasks.completed')}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('tasks.date')}</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('tasks.lot')}</label>
                  <select value={form.lotId} onChange={e => setForm({ ...form, lotId: e.target.value })}
                    style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff' }}>
                    <option value="">{t('tasks.no_lot')}</option>
                    {lots.map(l => <option key={l.id} value={l.id}>{l.farmName} — {l.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('tasks.observations')}</label>
                <textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} rows={3}
                  placeholder="Detalles de la tarea..."
                  style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ fontSize: '12px', padding: '8px 16px', border: '0.5px solid #e5e5e3', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>{t('common.cancel')}</button>
                <button type="submit" style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                  {modal === 'create' ? t('tasks.create_btn') : t('tasks.save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
