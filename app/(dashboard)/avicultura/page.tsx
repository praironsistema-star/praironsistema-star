'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

// ─────────────────────────────────────────────────────────────────────────────
// /avicultura — Módulo avícola completo
// Tabs: Dashboard · Galpones · Lotes · Registros
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_TYPES  = ['engorde','postura','reproductora']
const BATCH_TYPES  = ['engorde','postura']
const FEED_TYPES   = ['iniciador','crecimiento','engorde','postura','concentrado','maiz','soya','otro']
const HEALTH_TYPES = ['vacuna','medicamento','diagnostico','desparasitante']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}

export default function AviculturaPage() {
  const [tab, setTab]             = useState('dashboard')
  const [dashboard, setDashboard] = useState<any>(null)
  const [houses, setHouses]       = useState<any[]>([])
  const [batches, setBatches]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  // Modales
  const [houseModal, setHouseModal] = useState(false)
  const [batchModal, setBatchModal] = useState(false)
  const [recModal,   setRecModal]   = useState<'mortality'|'feed'|'health'|null>(null)
  const [selBatch,   setSelBatch]   = useState<any>(null)

  // Formularios
  const [houseForm, setHouseForm] = useState({ name:'', capacity:'', type:'engorde', location:'', notes:'' })
  const [batchForm, setBatchForm] = useState({ houseId:'', type:'engorde', initialQuantity:'', breed:'', startDate: new Date().toISOString().split('T')[0] })
  const [recForm,   setRecForm]   = useState<any>({ date: new Date().toISOString().split('T')[0], quantity:'', cause:'', feedType:'iniciador', unit:'kg', cost:'', type:'vacuna', product:'', dose:'', notes:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [d, h, b] = await Promise.all([
        supabase.from('poultry_houses').select('count').is('deleted_at',null),
        supabase.from('poultry_houses').select('*').is('deleted_at',null),
        supabase.from('poultry_batches').select('*').is('deleted_at',null),
      ])
      setDashboard(d.data)
      setHouses(h.data)
      setBatches(b.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function saveHouse(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_houses').insert({...houseForm,capacity:parseInt(houseForm.capacity)})
    setHouseModal(false); loadAll(); toastSuccess('Galpón creado')
  }

  async function saveBatch(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_batches').insert({...batchForm,initial_quantity:parseInt(batchForm.initialQuantity)})
    setBatchModal(false); loadAll(); toastSuccess('Lote creado')
  }

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!selBatch) return
    if (recModal === 'mortality') {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_records').insert({...recForm,batch_id:selBatch.id,record_type:'mortality',quantity:parseInt(recForm.quantity)})
      toastSuccess('Mortalidad registrada')
    } else if (recModal === 'feed') {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_records').insert({...recForm,batch_id:selBatch.id,record_type:'feed',quantity:parseFloat(recForm.quantity),cost:recForm.cost?parseFloat(recForm.cost):null})
      toastSuccess('Alimentación registrada')
    } else if (recModal === 'health') {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_records').insert({...recForm,batch_id:selBatch.id,record_type:'health'})
      toastSuccess('Registro sanitario guardado')
    }
    setRecModal(null); loadAll()
  }

  async function deleteHouse(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar galpón', message:`¿Eliminar "${name}"?`, danger: true, confirmText:'Eliminar' })
    if (!ok) return
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('poultry_houses').update({deleted_at:new Date().toISOString()}).eq('id',id); loadAll(); toastSuccess('Galpón eliminado')
  }

  const TABS = ['dashboard','galpones','lotes']

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Avicultura</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            Galpones, lotes, mortalidad y conversión alimenticia
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setHouseModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>
            + Galpón
          </button>
          <button onClick={() => setBatchModal(true)} disabled={houses.length === 0} style={{ fontSize:'12px', padding:'8px 14px', background: houses.length === 0 ? '#e5e5e3' : '#036446', color: houses.length === 0 ? '#9b9b97' : 'white', border:'none', borderRadius:'6px', cursor: houses.length === 0 ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            + Lote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3', paddingBottom:'0' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'galpones' ? 'Galpones' : 'Lotes'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div>
      ) : (
        <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && dashboard && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Galpones activos', value: dashboard.summary.totalHouses, color:'#036446' },
                  { label:'Lotes en curso',   value: dashboard.summary.activeBatches, color:'#185fa5' },
                  { label:'Aves totales',     value: dashboard.summary.totalAnimals.toLocaleString(), color:'#036446' },
                  { label:'Mortalidad total', value: dashboard.summary.totalMortality, color: dashboard.summary.avgMortalityRate > 5 ? '#dc2626' : '#b45309' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {dashboard.summary.activeBatches === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🐔</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes activos</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Crea un galpón y luego registra tu primer lote</div>
                  <button onClick={() => setHouseModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer galpón</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {dashboard.activeBatches.map((b: any) => {
                    const mort = b.mortalityLogs?.reduce((s: number, m: any) => s + m.quantity, 0) || 0
                    const mortRate = b.initialQuantity > 0 ? Math.round((mort / b.initialQuantity) * 100 * 10) / 10 : 0
                    const days = Math.ceil((new Date().getTime() - new Date(b.startDate).getTime()) / (1000*60*60*24))
                    return (
                      <div key={b.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{b.house?.name || '—'}</div>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>{b.breed || b.type} · {days} días</div>
                          </div>
                          <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e6f1fb', color:'#185fa5', fontWeight:'500' }}>{b.type}</span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                          <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{b.currentQuantity.toLocaleString()}</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>aves actuales</div>
                          </div>
                          <div style={{ background: mortRate > 5 ? '#fef2f2' : '#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color: mortRate > 5 ? '#dc2626' : '#1a1a18', fontFamily:'monospace' }}>{mortRate}%</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>mortalidad</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'4px' }}>
                          <button onClick={() => { setSelBatch(b); setRecModal('mortality') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>
                            + Mort.
                          </button>
                          <button onClick={() => { setSelBatch(b); setRecModal('feed') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>
                            + Alim.
                          </button>
                          <button onClick={() => { setSelBatch(b); setRecModal('health') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #bfdbfe', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>
                            + Sanidad
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── GALPONES ── */}
          {tab === 'galpones' && (
            <div>
              {houses.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏠</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin galpones registrados</div>
                  <button onClick={() => setHouseModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer galpón</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {houses.map((h: any) => (
                    <div key={h.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{h.name}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97' }}>{h.location || 'Sin ubicación'}</div>
                        </div>
                        <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446', fontWeight:'500', height:'fit-content' }}>{h.type}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'18px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{h.capacity.toLocaleString()}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>capacidad</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'18px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{h._count?.batches || 0}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>lotes totales</div>
                        </div>
                      </div>
                      <button onClick={() => deleteHouse(h.id, h.name)}
                        style={{ width:'100%', fontSize:'11px', padding:'6px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LOTES ── */}
          {tab === 'lotes' && (
            <div>
              {batches.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🐣</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes registrados</div>
                  <button onClick={() => setBatchModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer lote</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Galpón','Tipo','Raza','Inicio','Cantidad inicial','Actuales','Estado','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b: any) => (
                        <tr key={b.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{b.house?.name || '—'}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e6f1fb', color:'#185fa5' }}>{b.type}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{b.breed || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(b.startDate).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18', fontFamily:'monospace' }}>{b.initialQuantity.toLocaleString()}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{b.currentQuantity.toLocaleString()}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: b.status==='activo'?'#e8f5ef':'#f9f9f7', color: b.status==='activo'?'#036446':'#9b9b97' }}>{b.status}</span></td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelBatch(b); setRecModal('mortality') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Mort.</button>
                              <button onClick={() => { setSelBatch(b); setRecModal('feed') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>Alim.</button>
                              <button onClick={() => { setSelBatch(b); setRecModal('health') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #bfdbfe', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>Sanidad</button>
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
        </>
      )}

      {/* Modal: Nuevo galpón */}
      {houseModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo galpón</div>
            <form onSubmit={saveHouse}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label>
                  <input value={houseForm.name} onChange={e => setHouseForm({...houseForm, name:e.target.value})} required style={inputStyle} placeholder="Galpón 1" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CAPACIDAD (aves)</label>
                  <input type="number" value={houseForm.capacity} onChange={e => setHouseForm({...houseForm, capacity:e.target.value})} required style={inputStyle} placeholder="10000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                  <select value={houseForm.type} onChange={e => setHouseForm({...houseForm, type:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label>
                  <input value={houseForm.location} onChange={e => setHouseForm({...houseForm, location:e.target.value})} style={inputStyle} placeholder="Sector norte" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
                <button type="button" onClick={() => setHouseModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear galpón</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo lote */}
      {batchModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo lote</div>
            <form onSubmit={saveBatch}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>GALPÓN</label>
                  <select value={batchForm.houseId} onChange={e => setBatchForm({...batchForm, houseId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar...</option>
                    {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                  <select value={batchForm.type} onChange={e => setBatchForm({...batchForm, type:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {BATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD INICIAL</label>
                  <input type="number" value={batchForm.initialQuantity} onChange={e => setBatchForm({...batchForm, initialQuantity:e.target.value})} required style={inputStyle} placeholder="5000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA INICIO</label>
                  <input type="date" value={batchForm.startDate} onChange={e => setBatchForm({...batchForm, startDate:e.target.value})} required style={inputStyle} onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RAZA / LÍNEA</label>
                <input value={batchForm.breed} onChange={e => setBatchForm({...batchForm, breed:e.target.value})} style={inputStyle} placeholder="Ross 308, Cobb 500..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setBatchModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registros (mortalidad / alimentación / sanidad) */}
      {recModal && selBatch && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>
              {recModal === 'mortality' ? 'Registrar mortalidad' : recModal === 'feed' ? 'Registrar alimentación' : 'Registro sanitario'}
            </div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selBatch.house?.name} · {selBatch.currentQuantity.toLocaleString()} aves</div>
            <form onSubmit={saveRecord}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={recForm.date} onChange={e => setRecForm({...recForm, date:e.target.value})} required style={inputStyle}/></div>
                {recModal === 'mortality' && <>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                    <input type="number" value={recForm.quantity} onChange={e => setRecForm({...recForm, quantity:e.target.value})} required min="1" style={inputStyle} placeholder="0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CAUSA</label>
                    <input value={recForm.cause} onChange={e => setRecForm({...recForm, cause:e.target.value})} style={inputStyle} placeholder="Enfermedad, aplastamiento..."/></div>
                </>}
                {recModal === 'feed' && <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO ALIMENTO</label>
                      <select value={recForm.feedType} onChange={e => setRecForm({...recForm, feedType:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                        {FEED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD (kg)</label>
                      <input type="number" value={recForm.quantity} onChange={e => setRecForm({...recForm, quantity:e.target.value})} required min="0" step="0.1" style={inputStyle} placeholder="0"/></div>
                  </div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label>
                    <input type="number" value={recForm.cost} onChange={e => setRecForm({...recForm, cost:e.target.value})} min="0" style={inputStyle} placeholder="Opcional"/></div>
                </>}
                {recModal === 'health' && <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                      <select value={recForm.type} onChange={e => setRecForm({...recForm, type:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                        {HEALTH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCTO</label>
                      <input value={recForm.product} onChange={e => setRecForm({...recForm, product:e.target.value})} style={inputStyle} placeholder="Nombre del producto"/></div>
                  </div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DOSIS / NOTAS</label>
                    <input value={recForm.notes} onChange={e => setRecForm({...recForm, notes:e.target.value})} style={inputStyle} placeholder="Dosis, observaciones..."/></div>
                </>}
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setRecModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
