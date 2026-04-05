'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const LABOR_TYPES = ['cosecha','siembra','fumigación','fertilización','poda','riego','mantenimiento','otro']
const PAY_UNITS = ['jornal','hora','kg','tarea']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

export default function TareoPage() {
  const [tab, setTab] = useState('dashboard')
  const [workers, setWorkers] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [workerModal, setWorkerModal] = useState(false)
  const [recordModal, setRecordModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [selWorker, setSelWorker] = useState<any>(null)

  const [workerForm, setWorkerForm] = useState({
    name:'', cedula:'', phone:'', payUnit:'jornal', payRate:'', notes:''
  })
  const [recordForm, setRecordForm] = useState({
    workerId:'', date: new Date().toISOString().split('T')[0],
    laborType:'cosecha', quantity:'', unit:'jornal',
    location:'', notes:''
  })
  const [payForm, setPayForm] = useState({
    amount:'', date: new Date().toISOString().split('T')[0],
    periodStart: '', periodEnd: '', notes:''
  })

  async function loadAll() {
    setLoading(true)
    try {
      const [w, r] = await Promise.allSettled([
        api.get('/workers'),
        api.get('/labor_records'),
      ])
      if (w.status === 'fulfilled') setWorkers(w.value.data ?? [])
      if (r.status === 'fulfilled') setRecords(r.value.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function saveWorker(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/workers', {
        ...workerForm,
        payRate: parseFloat(workerForm.payRate),
      })
      setWorkerModal(false)
      setWorkerForm({ name:'', cedula:'', phone:'', payUnit:'jornal', payRate:'', notes:'' })
      loadAll(); toastSuccess('Trabajador registrado')
    } catch { toastError('Error al registrar trabajador') }
  }

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/labor_records', {
        ...recordForm,
        quantity: parseFloat(recordForm.quantity),
      })
      setRecordModal(false)
      setRecordForm({ workerId:'', date: new Date().toISOString().split('T')[0], laborType:'cosecha', quantity:'', unit:'jornal', location:'', notes:'' })
      loadAll(); toastSuccess('Registro guardado')
    } catch { toastError('Error al guardar registro') }
  }

  async function savePay(e: React.FormEvent) {
    e.preventDefault()
    if (!selWorker) return
    try {
            await api.post('/payments', {worker_id:selWorker.id,
        amount: parseFloat(payForm.amount),
        date: payForm.date,
        periodStart: payForm.periodStart,
        periodEnd: payForm.periodEnd,
        notes: payForm.notes,
      })
      setPayModal(false)
      setPayForm({ amount:'', date: new Date().toISOString().split('T')[0], periodStart:'', periodEnd:'', notes:'' })
      loadAll(); toastSuccess('Pago registrado')
    } catch { toastError('Error al registrar pago') }
  }

  async function deleteWorker(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar trabajador', message:`¿Eliminar a "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
            await api.patch('/workers/id', {deleted_at:new Date().toISOString()})
      loadAll(); toastSuccess('Trabajador eliminado')
    } catch { toastError('Error al eliminar') }
  }

  async function deleteRecord(id: string) {
    const ok = await confirm({ title:'Eliminar registro', message:'¿Eliminar este registro de labor?', danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
            await api.patch('/labor_records/id', {deleted_at:new Date().toISOString()})
      loadAll(); toastSuccess('Registro eliminado')
    } catch { toastError('Error al eliminar') }
  }

  // Calcular nomina estimada por trabajador
  function calcNomina(worker: any) {
    const workerRecords = records.filter(r => r.workerId === worker.id)
    const totalQty = workerRecords.reduce((s, r) => s + (r.quantity || 0), 0)
    return totalQty * (worker.payRate || 0)
  }

  const totalJornales = records.length
  const totalNomina = workers.reduce((s, w) => s + calcNomina(w), 0)
  const hoy = new Date().toISOString().split('T')[0]
  const registrosHoy = records.filter(r => r.date?.startsWith(hoy)).length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Tareo Digital</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Registro de jornaleros, labores diarias y nómina</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setWorkerModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>
            + Trabajador
          </button>
          <button onClick={() => setRecordModal(true)} disabled={workers.length === 0}
            style={{ fontSize:'12px', padding:'8px 14px', background: workers.length === 0 ? '#e5e5e3' : '#036446', color: workers.length === 0 ? '#9b9b97' : 'white', border:'none', borderRadius:'6px', cursor: workers.length === 0 ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            + Registro
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','registros','trabajadores','nomina'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'registros' ? 'Registros' : t === 'trabajadores' ? 'Trabajadores' : 'Nómina'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div>
      ) : (
        <>
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Trabajadores activos', value: workers.length, color:'#036446' },
                  { label:'Registros de hoy', value: registrosHoy, color:'#185fa5' },
                  { label:'Total registros', value: totalJornales, color:'#1a1a18' },
                  { label:'Nómina estimada', value: '$' + totalNomina.toLocaleString('es-CO'), color:'#b45309' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {workers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>👷</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin trabajadores registrados</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tus jornaleros para comenzar el tareo digital</div>
                  <button onClick={() => setWorkerModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar trabajador</button>
                </div>
              ) : (
                <div>
                  {/* Resumen por trabajador */}
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#9b9b97', marginBottom:'10px', letterSpacing:'0.06em' }}>RESUMEN POR TRABAJADOR</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                    {workers.map((w: any) => {
                      const wRecords = records.filter(r => r.workerId === w.id)
                      const nomina = calcNomina(w)
                      const totalQty = wRecords.reduce((s, r) => s + (r.quantity || 0), 0)
                      return (
                        <div key={w.id} style={card}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#e8f5ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'600', color:'#036446' }}>
                                {w.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{w.name}</div>
                                <div style={{ fontSize:'11px', color:'#9b9b97' }}>{w.payRate?.toLocaleString('es-CO')}/{w.payUnit}</div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                            <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                              <div style={{ fontSize:'16px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{wRecords.length}</div>
                              <div style={{ fontSize:'10px', color:'#9b9b97' }}>registros</div>
                            </div>
                            <div style={{ background:'#fef9c3', borderRadius:'6px', padding:'8px' }}>
                              <div style={{ fontSize:'14px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>${nomina.toLocaleString('es-CO')}</div>
                              <div style={{ fontSize:'10px', color:'#9b9b97' }}>nómina</div>
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:'4px' }}>
                            <button onClick={() => { setRecordForm({...recordForm, workerId: w.id}); setRecordModal(true) }}
                              style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #d1fae5', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#036446' }}>
                              + Labor
                            </button>
                            <button onClick={() => { setSelWorker(w); setPayModal(true) }}
                              style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #fde68a', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#b45309' }}>
                              💰 Pagar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REGISTROS */}
          {tab === 'registros' && (
            <div>
              {records.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>📋</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin registros de labor</div>
                  <button onClick={() => setRecordModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar labor</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Fecha','Trabajador','Labor','Cantidad','Ubicación','Valor','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r: any) => {
                        const worker = workers.find(w => w.id === r.workerId)
                        const valor = (r.quantity || 0) * (worker?.payRate || 0)
                        return (
                          <tr key={r.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                            <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(r.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                            <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{r.worker?.name || worker?.name || '—'}</td>
                            <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{r.laborType}</span></td>
                            <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', fontFamily:'monospace' }}>{r.quantity} {r.unit}</td>
                            <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{r.location || '—'}</td>
                            <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>${valor.toLocaleString('es-CO')}</td>
                            <td style={{ padding:'10px 14px' }}>
                              <button onClick={() => deleteRecord(r.id)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TRABAJADORES */}
          {tab === 'trabajadores' && (
            <div>
              {workers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>👷</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin trabajadores</div>
                  <button onClick={() => setWorkerModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar trabajador</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Trabajador','Cédula','Teléfono','Tarifa','Unidad','Registros','Nómina estimada','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((w: any) => (
                        <tr key={w.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#e8f5ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'600', color:'#036446' }}>
                                {w.name?.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{w.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{w.cedula || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{w.phone || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18', fontFamily:'monospace' }}>${(w.payRate || 0).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#f9f9f7', color:'#6b6b67' }}>{w.payUnit}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{records.filter(r => r.workerId === w.id).length}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>${calcNomina(w).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelWorker(w); setPayModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fde68a', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#b45309' }}>Pagar</button>
                              <button onClick={() => deleteWorker(w.id, w.name)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* NÓMINA */}
          {tab === 'nomina' && (
            <div>
              <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'20px', marginBottom:'20px' }}>
                <div style={{ fontSize:'12px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em', marginBottom:'16px' }}>RESUMEN DE NÓMINA</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {[
                    { label:'Total trabajadores', value: workers.length, color:'#036446' },
                    { label:'Total registros', value: totalJornales, color:'#185fa5' },
                    { label:'Nómina total estimada', value: '$' + totalNomina.toLocaleString('es-CO'), color:'#b45309' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'#f9f9f7', borderRadius:'8px', padding:'14px' }}>
                      <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace' }}>{s.value}</div>
                      <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {workers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'13px', color:'#9b9b97' }}>Registra trabajadores para ver la nómina</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {workers.map((w: any) => {
                    const wRecords = records.filter(r => r.workerId === w.id)
                    const nomina = calcNomina(w)
                    const totalQty = wRecords.reduce((s, r) => s + (r.quantity || 0), 0)
                    return (
                      <div key={w.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#e8f5ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'600', color:'#036446' }}>
                            {w.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{w.name}</div>
                            <div style={{ fontSize:'12px', color:'#9b9b97' }}>{wRecords.length} registros · {totalQty} {w.payUnit}s · ${(w.payRate || 0).toLocaleString('es-CO')}/{w.payUnit}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>Nómina estimada</div>
                            <div style={{ fontSize:'18px', fontWeight:'600', color:'#b45309', fontFamily:'monospace' }}>${nomina.toLocaleString('es-CO')}</div>
                          </div>
                          <button onClick={() => { setSelWorker(w); setPayModal(true) }}
                            style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                            Registrar pago
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: Nuevo trabajador */}
      {workerModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo trabajador</div>
            <form onSubmit={saveWorker}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE COMPLETO</label>
                  <input value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name:e.target.value})} required style={inputStyle} placeholder="Pedro García" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CÉDULA</label>
                    <input value={workerForm.cedula} onChange={e => setWorkerForm({...workerForm, cedula:e.target.value})} style={inputStyle} placeholder="1.000.000.000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TELÉFONO</label>
                    <input value={workerForm.phone} onChange={e => setWorkerForm({...workerForm, phone:e.target.value})} style={inputStyle} placeholder="310 000 0000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TARIFA (COP)</label>
                    <input type="number" value={workerForm.payRate} onChange={e => setWorkerForm({...workerForm, payRate:e.target.value})} required style={inputStyle} placeholder="55000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD DE PAGO</label>
                    <select value={workerForm.payUnit} onChange={e => setWorkerForm({...workerForm, payUnit:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {PAY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={workerForm.notes} onChange={e => setWorkerForm({...workerForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setWorkerModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo registro de labor */}
      {recordModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Registrar labor</div>
            <form onSubmit={saveRecord}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TRABAJADOR</label>
                  <select value={recordForm.workerId} onChange={e => setRecordForm({...recordForm, workerId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar...</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={recordForm.date} onChange={e => setRecordForm({...recordForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO DE LABOR</label>
                    <select value={recordForm.laborType} onChange={e => setRecordForm({...recordForm, laborType:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {LABOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                    <input type="number" step="0.5" value={recordForm.quantity} onChange={e => setRecordForm({...recordForm, quantity:e.target.value})} required style={inputStyle} placeholder="1" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD</label>
                    <select value={recordForm.unit} onChange={e => setRecordForm({...recordForm, unit:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {PAY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN / LOTE</label>
                  <input value={recordForm.location} onChange={e => setRecordForm({...recordForm, location:e.target.value})} style={inputStyle} placeholder="Lote 3 - Sector norte" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setRecordModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar pago de nómina */}
      {payModal && selWorker && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>💰 Registrar pago</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>{selWorker.name}</div>
            <div style={{ fontSize:'13px', color:'#b45309', fontFamily:'monospace', marginBottom:'20px' }}>
              Nómina estimada: ${calcNomina(selWorker).toLocaleString('es-CO')}
            </div>
            <form onSubmit={savePay}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>MONTO PAGADO (COP)</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PERÍODO INICIO</label>
                    <input type="date" value={payForm.periodStart} onChange={e => setPayForm({...payForm, periodStart:e.target.value})} style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PERÍODO FIN</label>
                    <input type="date" value={payForm.periodEnd} onChange={e => setPayForm({...payForm, periodEnd:e.target.value})} style={inputStyle}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE PAGO</label>
                  <input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date:e.target.value})} required style={inputStyle}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={payForm.notes} onChange={e => setPayForm({...payForm, notes:e.target.value})} style={inputStyle} placeholder="Efectivo, transferencia..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setPayModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Confirmar pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
