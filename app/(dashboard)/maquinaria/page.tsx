'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const TYPES = ['tractor','bomba','aspersor','cosechadora','fumigadora','camion','generador','motosierra','otro']
const STATUSES = [
  { key: 'operativo',     label: 'Operativo',     color: '#036446', bg: '#e8f5ef' },
  { key: 'mantenimiento', label: 'Mantenimiento',  color: '#b45309', bg: '#fef3e2' },
  { key: 'inactivo',      label: 'Inactivo',       color: '#6b6b67', bg: '#f9f9f7' },
]
const TYPE_ICONS: Record<string, string> = {
  tractor:'🚜', bomba:'⛽', aspersor:'💦', cosechadora:'🌾',
  fumigadora:'��', camion:'🚛', generador:'⚡', motosierra:'🪚', otro:'🔧',
}

export default function MaquinariaPage() {
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create'|'edit'|null>(null)
  const [selected,setSelected]= useState<any>(null)
  const [filter,  setFilter]  = useState('all')
  const [form, setForm] = useState({
    name:'', type:'tractor', brand:'', model:'', year:'',
    status:'operativo', fuelConsumption:'', notes:'',
    lastMaintenance:'', nextMaintenance:'',
  })

  const load = async () => {
    try {       const { data } = await api.get('/machinery'); setItems(data||[]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ name:'', type:'tractor', brand:'', model:'', year:'',
      status:'operativo', fuelConsumption:'', notes:'',
      lastMaintenance:'', nextMaintenance:'' })
    setSelected(null); setModal('create')
  }

  function openEdit(item: any) {
    setForm({
      name: item.name, type: item.type, brand: item.brand||'',
      model: item.model||'', year: item.year?String(item.year):'',
      status: item.status, fuelConsumption: item.fuelConsumption?String(item.fuelConsumption):'',
      notes: item.notes||'',
      lastMaintenance: item.lastMaintenance ? item.lastMaintenance.split('T')[0] : '',
      nextMaintenance: item.nextMaintenance ? item.nextMaintenance.split('T')[0] : '',
    })
    setSelected(item); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body: any = { ...form,
      year: form.year ? parseInt(form.year) : null,
      fuelConsumption: form.fuelConsumption ? parseFloat(form.fuelConsumption) : null,
      lastMaintenance: form.lastMaintenance || null,
      nextMaintenance: form.nextMaintenance || null,
    }
          if (modal === 'create') await api.post('/machinery', body)
    else await api.patch(`/machinery/${selected?.id}`, body)
    setModal(null); load(); toastSuccess('Guardado correctamente')
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({ title: 'Eliminar equipo', message: `¿Eliminar "${name}"?`, danger: true, confirmText: 'Eliminar' })
    if (!ok) return
          await api.patch('/machinery/id', {deleted_at:new Date().toISOString()}); load(); toastSuccess('Equipo eliminado')
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const needsMaint = items.filter(i => i.nextMaintenance && new Date(i.nextMaintenance) <= new Date())

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '7px',
    padding: '9px 12px', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', background: '#f9f9f7',
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Maquinaria</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {items.length} equipos · {items.filter(i => i.status === 'operativo').length} operativos
          </p>
        </div>
        <button onClick={openCreate}
          style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          + Nuevo equipo
        </button>
      </div>

      {/* Alerta de mantenimientos vencidos */}
      {needsMaint.length > 0 && (
        <div style={{ background: '#fef3e2', border: '0.5px solid #fed7aa', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>
            {needsMaint.length} equipo{needsMaint.length > 1 ? 's' : ''} con mantenimiento vencido: {needsMaint.map(i => i.name).join(', ')}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        <button onClick={() => setFilter('all')}
          style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '0.5px solid', cursor: 'pointer', borderColor: filter==='all'?'#036446':'#e5e5e3', background: filter==='all'?'#e8f5ef':'transparent', color: filter==='all'?'#036446':'#6b6b67' }}>
          Todos ({items.length})
        </button>
        {STATUSES.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '0.5px solid', cursor: 'pointer', borderColor: filter===s.key?s.color:'#e5e5e3', background: filter===s.key?s.bg:'transparent', color: filter===s.key?s.color:'#6b6b67' }}>
            {s.label} ({items.filter(i => i.status === s.key).length})
          </button>
        ))}
      </div>

      {/* Grid de equipos */}
      {loading ? (
        <div style={{ color: '#9b9b97', fontSize: '13px', padding: '40px', textAlign: 'center' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '0.5px dashed #e5e5e3', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚜</div>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>No hay equipos registrados</div>
          <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '20px' }}>Registra tractores, bombas, aspersores y más</div>
          <button onClick={openCreate}
            style={{ fontSize: '12px', padding: '8px 20px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Agregar primer equipo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {filtered.map((item: any) => {
            const st = STATUSES.find(s => s.key === item.status) || STATUSES[0]
            const icon = TYPE_ICONS[item.type] || '🔧'
            const maintDue = item.nextMaintenance && new Date(item.nextMaintenance) <= new Date()
            return (
              <div key={item.id} style={{ background: '#fff', border: `0.5px solid ${maintDue ? '#fed7aa' : '#e5e5e3'}`, borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#9b9b97', textTransform: 'capitalize' }}>{item.type}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                  {item.brand && (
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18' }}>{item.brand}</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>marca</div>
                    </div>
                  )}
                  {item.year && (
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18' }}>{item.year}</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>año</div>
                    </div>
                  )}
                  {item.fuelConsumption && (
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18' }}>{item.fuelConsumption} L/h</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>consumo</div>
                    </div>
                  )}
                  {item.nextMaintenance && (
                    <div style={{ background: maintDue ? '#fef3e2' : '#f9f9f7', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: maintDue ? '#b45309' : '#1a1a18' }}>
                        {new Date(item.nextMaintenance).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>{maintDue ? '⚠️ vencido' : 'próx. mant.'}</div>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '10px', lineHeight: 1.4 }}>
                    {item.notes.length > 60 ? item.notes.slice(0, 60) + '…' : item.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button onClick={() => openEdit(item)}
                    style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid #e5e5e3', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#6b6b67' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item.id, item.name)}
                    style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid #fecaca', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                    ×
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>
              {modal === 'create' ? 'Nuevo equipo' : 'Editar equipo'}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>NOMBRE DEL EQUIPO</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ej: Tractor John Deere #1" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>TIPO</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>ESTADO</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>MARCA</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="John Deere" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>MODELO</label>
                  <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="5075E" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>AÑO</label>
                  <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2020" min="1990" max="2030" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>CONSUMO (L/hora)</label>
                  <input type="number" value={form.fuelConsumption} onChange={e => setForm({...form, fuelConsumption: e.target.value})} placeholder="0" min="0" step="0.1" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>ÚLTIMO MANTENIMIENTO</label>
                  <input type="date" value={form.lastMaintenance} onChange={e => setForm({...form, lastMaintenance: e.target.value})} style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>PRÓXIMO MANTENIMIENTO</label>
                  <input type="date" value={form.nextMaintenance} onChange={e => setForm({...form, nextMaintenance: e.target.value})} style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>NOTAS</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Observaciones adicionales" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#036446'} onBlur={e => e.target.style.borderColor='#e5e5e3'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(null)}
                  style={{ fontSize: '12px', padding: '8px 16px', border: '0.5px solid #e5e5e3', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                  {modal === 'create' ? 'Crear equipo' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
